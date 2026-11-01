#!/usr/bin/env node

// Compare committed JSON values, so formatting changes do not request releases.
// Git/ref/JSON errors fail the guard. Only same-repository release PRs from the
// configured release actor (github-actions[bot] by default) are exempt.
// In an npm workspaces root every publishable workspace package is checked;
// a package that does not exist at the merge base is new and may start at any
// version.
import { getJsRoot, parseJsRootConfig } from './js-paths.mjs';
import { parsePackageInfo, readReleasePackages } from './package-info.mjs';
import { getPrComparison, git, isTrustedReleasePr } from './pr-comparison.mjs';

/**
 * @param {string} ref
 * @param {string} manifest
 * @returns {string | null}
 */
function showOrNull(ref, manifest) {
  try {
    return git(['show', `${ref}:${manifest}`]);
  } catch (error) {
    if (/does not exist|exists on disk, but not in/.test(error.message)) {
      return null;
    }
    throw error;
  }
}

try {
  const { mergeBase, head } = getPrComparison();
  const jsRoot = getJsRoot({ jsRoot: parseJsRootConfig() });
  const manifests = readReleasePackages({ jsRoot }).map((pkg) =>
    pkg.packageJsonPath.replaceAll('\\', '/').replace(/^\.\//, '')
  );
  const changes = [];
  for (const manifest of manifests) {
    const beforeContent = showOrNull(mergeBase, manifest);
    if (beforeContent === null) {
      console.log(`${manifest}: new package, no previous version`);
      continue;
    }
    const before = parsePackageInfo(beforeContent, manifest);
    const after = parsePackageInfo(
      git(['show', `${head}:${manifest}`]),
      manifest
    );
    if (before.version !== after.version) {
      changes.push(`${manifest}: ${before.version} -> ${after.version}`);
    }
  }
  if (changes.length > 0 && !isTrustedReleasePr()) {
    throw new Error(
      `Manual version change in ${changes.join(', ')}. Add a changeset; CI manages versions.`
    );
  }
  console.log('No manual version changes detected - check passed');
} catch (error) {
  console.error(`::error::Version check failed: ${error.message}`);
  if (process.env.DEBUG) {
    console.error(error.stack);
  }
  process.exitCode = 1;
}
