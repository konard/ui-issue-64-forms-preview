import { readFileSync } from 'node:fs';

import { getJsRoot, getPackageJsonPath } from './js-paths.mjs';
import {
  isWorkspaceRoot,
  listReleasePackagesSync,
  packagePath,
  resolveReleasePackage,
} from './workspace-packages.mjs';

/**
 * Parse package metadata from a package.json file body.
 * @param {string} packageJsonContent
 * @param {string} packageJsonPath
 * @returns {{name: string, version: string}}
 */
export function parsePackageInfo(
  packageJsonContent,
  packageJsonPath = 'package.json'
) {
  let packageJson;
  try {
    packageJson = JSON.parse(packageJsonContent);
  } catch (error) {
    throw new Error(`Could not parse ${packageJsonPath}: ${error.message}`, {
      cause: error,
    });
  }

  if (typeof packageJson.name !== 'string' || packageJson.name.trim() === '') {
    throw new Error(`Package name is missing in ${packageJsonPath}`);
  }

  if (
    typeof packageJson.version !== 'string' ||
    packageJson.version.trim() === ''
  ) {
    throw new Error(`Package version is missing in ${packageJsonPath}`);
  }

  return {
    name: packageJson.name,
    version: packageJson.version,
  };
}

/**
 * Read name and version of the package a release step works on.
 *
 * A single-package root returns the root package. An npm workspaces root
 * returns the release package chosen by resolveReleasePackage(): the only
 * publishable workspace package, or the one named by `packageName` /
 * RELEASE_PACKAGE.
 *
 * @param {Object} options - Configuration options (passed to getPackageJsonPath)
 * @param {string} [options.packageName] - workspace package to select
 * @returns {{name: string, version: string, dir: string, packageJsonPath: string}}
 */
export function readPackageInfo(options = {}) {
  const jsRoot =
    options.jsRoot !== undefined ? options.jsRoot : getJsRoot(options);
  let packageJsonPath = getPackageJsonPath({ ...options, jsRoot });
  let dir = '.';
  if (isWorkspaceRoot(jsRoot)) {
    dir = resolveReleasePackage(jsRoot, options).dir;
    packageJsonPath = packagePath(jsRoot, dir, 'package.json');
  }
  return {
    ...parsePackageInfo(readFileSync(packageJsonPath, 'utf8'), packageJsonPath),
    dir,
    packageJsonPath,
  };
}

/**
 * Read every package a release must handle (see listReleasePackagesSync).
 * @param {Object} options
 * @param {string} [options.jsRoot]
 * @returns {Array<{name: string, version: string, dir: string, private: boolean, packageJsonPath: string}>}
 */
export function readReleasePackages(options = {}) {
  const jsRoot =
    options.jsRoot !== undefined ? options.jsRoot : getJsRoot(options);
  return listReleasePackagesSync(jsRoot).map((pkg) => ({
    ...pkg,
    packageJsonPath: packagePath(jsRoot, pkg.dir, 'package.json'),
  }));
}

/**
 * Escape a string for safe use inside a regular expression.
 * @param {string} value
 * @returns {string}
 */
export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build a regex that matches the package bump line in a changeset.
 * @param {string} packageName
 * @param {Object} options
 * @param {boolean} [options.requireQuotes=true]
 * @returns {RegExp}
 */
export function getChangesetVersionTypeRegex(
  packageName,
  { requireQuotes = true } = {}
) {
  const quotePattern = requireQuotes ? '[\'"]' : '[\'"]?';
  return new RegExp(
    `^${quotePattern}${escapeRegExp(packageName)}${quotePattern}:\\s+(major|minor|patch)\\s*$`,
    'm'
  );
}

/**
 * Format a changeset package bump header line.
 * @param {string} packageName
 * @param {string} bumpType
 * @returns {string}
 */
export function formatChangesetHeader(packageName, bumpType) {
  return `'${packageName}': ${bumpType}`;
}

/**
 * Format an npm package@version specifier.
 * @param {string} packageName
 * @param {string} version
 * @returns {string}
 */
export function formatNpmPackageVersion(packageName, version) {
  return `${packageName}@${version}`;
}
