#!/usr/bin/env node

/**
 * npm workspaces discovery shared by the release scripts.
 *
 * The repository root is an npm workspaces monorepo (`"workspaces":
 * ["packages/*"]`). Every release script asks this module which packages it
 * must check, version, publish or smoke test, so the knowledge of the layout
 * lives in one place (R23: no per-package copies).
 *
 * A root package.json without `workspaces` keeps the old single-package
 * behaviour: the root package itself is the only release package. That keeps
 * template synchronisation with single-package repositories possible.
 *
 * Only `<dir>/*` and literal directory patterns are supported, which is all
 * npm workspaces need here; no glob dependency is added.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * @typedef {Object} WorkspacePackage
 * @property {string} dir - Directory relative to the root, `/`-separated ('.' for the root package)
 * @property {string} name - npm package name
 * @property {string} version - package version
 * @property {boolean} private - true when the package must never be published
 */

/**
 * @param {string} file
 * @returns {any}
 */
function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`Could not read ${file}: ${error.message}`, {
      cause: error,
    });
  }
}

/**
 * Read the `workspaces` patterns of a root package.json.
 * Supports both the array form and the `{ packages: [...] }` object form.
 * @param {any} rootManifest
 * @returns {string[] | null} patterns, or null when the root is not a workspace root
 */
export function getWorkspacePatterns(rootManifest) {
  const workspaces = rootManifest?.workspaces;
  if (Array.isArray(workspaces)) {
    return workspaces;
  }
  if (workspaces && Array.isArray(workspaces.packages)) {
    return workspaces.packages;
  }
  return null;
}

/**
 * Check whether a directory is an npm workspaces root.
 * @param {string} [rootDir='.']
 * @returns {boolean}
 */
export function isWorkspaceRoot(rootDir = '.') {
  const manifestPath = join(rootDir, 'package.json');
  return (
    existsSync(manifestPath) &&
    getWorkspacePatterns(readJson(manifestPath)) !== null
  );
}

/**
 * Expand one workspace pattern into package directories relative to rootDir.
 * @param {string} rootDir
 * @param {string} pattern
 * @returns {string[]}
 */
function expandPattern(rootDir, pattern) {
  const normalized = pattern
    .replaceAll('\\', '/')
    .replace(/^\.\//, '')
    .replace(/\/$/, '');
  if (!normalized.includes('*')) {
    return [normalized];
  }
  if (!/^[^*]+\/\*$/.test(normalized)) {
    throw new Error(
      `Unsupported workspace pattern "${pattern}": use "<dir>/*" or a literal directory`
    );
  }
  const parent = normalized.slice(0, -2);
  const parentPath = join(rootDir, parent);
  if (!existsSync(parentPath)) {
    return [];
  }
  return readdirSync(parentPath)
    .filter((entry) => !entry.startsWith('.'))
    .filter((entry) => statSync(join(parentPath, entry)).isDirectory())
    .map((entry) => `${parent}/${entry}`);
}

/**
 * Describe the package in a directory.
 * @param {string} rootDir
 * @param {string} dir
 * @returns {WorkspacePackage}
 */
function describePackage(rootDir, dir) {
  const manifestPath = join(rootDir, dir, 'package.json');
  const manifest = readJson(manifestPath);
  if (typeof manifest.name !== 'string' || manifest.name.trim() === '') {
    throw new Error(`Package name is missing in ${manifestPath}`);
  }
  return {
    dir,
    name: manifest.name,
    version: typeof manifest.version === 'string' ? manifest.version : '',
    private: manifest.private === true,
  };
}

/**
 * List the workspace packages synchronously, sorted by name.
 * Returns an empty list when the root has no `workspaces` field.
 * @param {string} [rootDir='.']
 * @returns {WorkspacePackage[]}
 */
export function listWorkspacePackagesSync(rootDir = '.') {
  const patterns = getWorkspacePatterns(
    readJson(join(rootDir, 'package.json'))
  );
  if (patterns === null) {
    return [];
  }
  const dirs = [
    ...new Set(patterns.flatMap((pattern) => expandPattern(rootDir, pattern))),
  ].filter((dir) => existsSync(join(rootDir, dir, 'package.json')));
  const packages = dirs.map((dir) => describePackage(rootDir, dir));
  const seen = new Map();
  for (const pkg of packages) {
    if (seen.has(pkg.name)) {
      throw new Error(
        `Duplicate workspace package name ${pkg.name} in ${seen.get(pkg.name)} and ${pkg.dir}`
      );
    }
    seen.set(pkg.name, pkg.dir);
  }
  return packages.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * List the workspace packages, sorted by name.
 * @param {string} [rootDir='.']
 * @returns {Promise<WorkspacePackage[]>}
 */
export function listWorkspacePackages(rootDir = '.') {
  return Promise.resolve().then(() => listWorkspacePackagesSync(rootDir));
}

/**
 * List the non-private workspace packages, sorted by name.
 * @param {string} [rootDir='.']
 * @returns {Promise<WorkspacePackage[]>}
 */
export function listPublishablePackages(rootDir = '.') {
  return listWorkspacePackages(rootDir).then((packages) =>
    packages.filter((pkg) => !pkg.private)
  );
}

/**
 * List the packages a release must handle.
 *
 * - workspaces root: every non-private workspace package;
 * - single-package root (no `workspaces`): the root package itself.
 *
 * @param {string} [rootDir='.']
 * @returns {WorkspacePackage[]}
 */
export function listReleasePackagesSync(rootDir = '.') {
  if (!isWorkspaceRoot(rootDir)) {
    return [describePackage(rootDir, '.')];
  }
  return listWorkspacePackagesSync(rootDir).filter((pkg) => !pkg.private);
}

/**
 * Pick the one package a single-package release step works on.
 *
 * The release jobs publish one version per run. In a workspace with several
 * publishable packages the package must be named explicitly (the
 * `packageName` option or the RELEASE_PACKAGE environment variable);
 * with exactly one publishable package it is chosen automatically.
 *
 * @param {string} [rootDir='.']
 * @param {{packageName?: string, env?: Record<string, string | undefined>}} [options]
 * @returns {WorkspacePackage}
 */
export function resolveReleasePackage(rootDir = '.', options = {}) {
  const env = options.env ?? process.env;
  const requested = options.packageName || env.RELEASE_PACKAGE || '';
  const packages = listReleasePackagesSync(rootDir);
  if (requested) {
    const match = packages.find((pkg) => pkg.name === requested);
    if (!match) {
      throw new Error(
        `Unknown release package ${requested}. Known: ${packages.map((pkg) => pkg.name).join(', ') || '(none)'}`
      );
    }
    return match;
  }
  if (packages.length === 1) {
    return packages[0];
  }
  if (packages.length === 0) {
    throw new Error('No publishable workspace package found');
  }
  throw new Error(
    `Several publishable packages (${packages.map((pkg) => pkg.name).join(', ')}): set RELEASE_PACKAGE to the one to release`
  );
}

/**
 * Join a package directory onto the JavaScript root.
 * @param {string} jsRoot
 * @param {string} dir
 * @param {string} [file]
 * @returns {string}
 */
export function packagePath(jsRoot, dir, file = '') {
  const parts = [jsRoot, dir, file].filter((part) => part && part !== '.');
  return parts.length === 0 ? '.' : parts.join('/');
}
