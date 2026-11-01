#!/usr/bin/env node

/**
 * Check for pending changeset files
 *
 * This script checks for pending changeset files in the .changeset directory
 * and outputs the count and status for use in GitHub Actions workflow
 * conditions. A pending changeset must declare the current package and a valid
 * bump type in changeset frontmatter; stray Markdown docs are ignored.
 *
 * Usage:
 *   node scripts/check-changesets.mjs
 *
 * Outputs (written to GITHUB_OUTPUT):
 *   - has_changesets: 'true' if there are pending changesets
 *   - changeset_count: number of changeset files found
 */

import { appendFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { getChangesetDir, getJsRoot, parseJsRootConfig } from './js-paths.mjs';
import {
  getChangesetVersionTypeRegex,
  readReleasePackages,
} from './package-info.mjs';

/**
 * Write output to GitHub Actions output file
 * @param {string} name - Output name
 * @param {string} value - Output value
 */
function setOutput(name, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    appendFileSync(outputFile, `${name}=${value}\n`);
  }
  console.log(`${name}=${value}`);
}

/**
 * Extract frontmatter from a Markdown changeset file.
 * @param {string} content
 * @returns {string | null}
 */
function extractChangesetFrontmatter(content) {
  const frontmatterMatch = content.match(
    /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/
  );

  return frontmatterMatch ? frontmatterMatch[1] : null;
}

/**
 * Check whether a file name can be a changeset candidate.
 * @param {string} file
 * @returns {boolean}
 */
function isMarkdownChangesetCandidate(file) {
  return file.endsWith('.md') && file !== 'README.md';
}

/**
 * Check whether a Markdown file has valid changeset frontmatter.
 * @param {string} filePath
 * @param {RegExp} versionTypeRegex
 * @returns {boolean}
 */
function hasValidChangesetFrontmatter(filePath, versionTypeRegex) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const frontmatter = extractChangesetFrontmatter(content);

    return frontmatter !== null && versionTypeRegex.test(frontmatter);
  } catch (error) {
    console.warn(`Warning: Failed to read ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Count changeset files in the .changeset directory per release package.
 * A changeset that names several packages counts once for each of them and
 * once in the total.
 * @param {string} changesetDir
 * @param {string[]} packageNames
 * @returns {{total: number, perPackage: Map<string, number>}}
 */
function countChangesetFiles(changesetDir, packageNames) {
  const perPackage = new Map(packageNames.map((name) => [name, 0]));
  if (!existsSync(changesetDir)) {
    return { total: 0, perPackage };
  }

  const regexes = packageNames.map((name) => [
    name,
    getChangesetVersionTypeRegex(name, { requireQuotes: false }),
  ]);
  let total = 0;
  for (const file of readdirSync(changesetDir)) {
    if (!isMarkdownChangesetCandidate(file)) {
      continue;
    }
    const named = regexes.filter(([, regex]) =>
      hasValidChangesetFrontmatter(join(changesetDir, file), regex)
    );
    for (const [name] of named) {
      perPackage.set(name, perPackage.get(name) + 1);
    }
    if (named.length > 0) {
      total += 1;
    }
  }

  return { total, perPackage };
}

/**
 * Main function to check for changesets
 */
function checkChangesets() {
  console.log('Checking for pending changeset files...\n');

  const jsRootConfig = parseJsRootConfig();
  const jsRoot = getJsRoot({ jsRoot: jsRootConfig, verbose: true });
  const changesetDir = getChangesetDir({ jsRoot });
  const packageNames = readReleasePackages({ jsRoot }).map((pkg) => pkg.name);

  console.log(`Packages: ${packageNames.join(', ')}`);
  console.log(`Changeset directory: ${changesetDir}`);

  const { total, perPackage } = countChangesetFiles(changesetDir, packageNames);

  if (packageNames.length > 1) {
    for (const [name, count] of perPackage) {
      console.log(`  ${name}: ${count} changeset file(s)`);
    }
  }
  console.log(`Found ${total} changeset file(s)`);

  setOutput('has_changesets', total > 0 ? 'true' : 'false');
  setOutput('changeset_count', String(total));
}

// Run the check
checkChangesets();
