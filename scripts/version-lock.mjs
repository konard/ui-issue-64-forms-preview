import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { listWorkspacePackagesSync } from './workspace-packages.mjs';

const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
];

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

/**
 * Remove the fields a version bump may change: the version and, in a
 * workspace, the ranges of dependencies on other workspace packages
 * (Changesets' updateInternalDependencies).
 */
function stripVersionFields(record, internalNames) {
  if (!record) {
    return record;
  }
  const result = globalThis.structuredClone(record);
  delete result.version;
  for (const field of DEPENDENCY_FIELDS) {
    for (const name of internalNames) {
      if (result[field]) {
        delete result[field][name];
      }
    }
  }
  return result;
}
function nonVersionLock(lock, workspaceDirs, internalNames) {
  const result = globalThis.structuredClone(lock);
  delete result.version;
  delete result.packages[''].version;
  for (const dir of workspaceDirs) {
    result.packages[dir] = stripVersionFields(
      result.packages[dir],
      internalNames
    );
  }
  return result;
}
function readWorkspaces(jsRoot) {
  return Object.fromEntries(
    listWorkspacePackagesSync(jsRoot).map((pkg) => [
      pkg.dir,
      readJson(join(jsRoot, pkg.dir, 'package.json')),
    ])
  );
}
export function captureVersionTree(jsRoot) {
  const manifest = readJson(join(jsRoot, 'package.json'));
  const lock = readJson(join(jsRoot, 'package-lock.json'));
  if (
    ![2, 3].includes(lock.lockfileVersion) ||
    !lock.packages?.[''] ||
    typeof manifest.name !== 'string' ||
    !manifest.name ||
    lock.name !== manifest.name ||
    lock.packages[''].name !== manifest.name ||
    typeof manifest.version !== 'string' ||
    lock.version !== manifest.version ||
    lock.packages[''].version !== manifest.version
  ) {
    throw new Error(
      'Invalid package/lock names, root record, version, or unsupported lockfile (requires npm v2/v3)'
    );
  }
  const workspaces = readWorkspaces(jsRoot);
  for (const [dir, workspace] of Object.entries(workspaces)) {
    const record = lock.packages[dir];
    if (
      !record ||
      record.name !== workspace.name ||
      record.version !== workspace.version
    ) {
      throw new Error(
        `Workspace ${dir} is missing from package-lock.json or has a stale name/version; run npm install`
      );
    }
  }
  return { manifest, lock, workspaces };
}
/**
 * Versioning may change only versions: the root manifest version, the two
 * root lock versions and, in a workspace, each workspace manifest version
 * (plus its internal dependency ranges) and its lock record.
 */
export function syncVersionLock(jsRoot, before) {
  const manifest = readJson(join(jsRoot, 'package.json'));
  const lock = readJson(join(jsRoot, 'package-lock.json'));
  const beforeWorkspaces = before.workspaces ?? {};
  const workspaceDirs = Object.keys(beforeWorkspaces);
  const internalNames = Object.values(beforeWorkspaces).map((pkg) => pkg.name);
  const workspaces = readWorkspaces(jsRoot);
  assert.deepEqual(
    stripVersionFields(manifest, []),
    stripVersionFields(before.manifest, []),
    'Package configuration changed after validation: package.json'
  );
  assert.deepEqual(
    Object.keys(workspaces).sort(),
    [...workspaceDirs].sort(),
    'Workspace packages changed after validation'
  );
  for (const dir of workspaceDirs) {
    assert.deepEqual(
      stripVersionFields(workspaces[dir], internalNames),
      stripVersionFields(beforeWorkspaces[dir], internalNames),
      `Package configuration changed after validation: ${dir}/package.json`
    );
  }
  assert.deepEqual(
    nonVersionLock(lock, workspaceDirs, internalNames),
    nonVersionLock(before.lock, workspaceDirs, internalNames),
    'Package configuration changed after validation: package-lock.json'
  );
  for (const pkg of [manifest, ...Object.values(workspaces)]) {
    if (
      typeof pkg.version !== 'string' ||
      !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.+-]+)?$/.test(pkg.version)
    ) {
      throw new Error('Invalid release version');
    }
  }
  lock.version = manifest.version;
  lock.packages[''].version = manifest.version;
  for (const dir of workspaceDirs) {
    const record = lock.packages[dir];
    record.version = workspaces[dir].version;
    for (const field of DEPENDENCY_FIELDS) {
      for (const name of internalNames) {
        if (workspaces[dir][field]?.[name] !== undefined) {
          record[field] = {
            ...record[field],
            [name]: workspaces[dir][field][name],
          };
        }
      }
    }
  }
  writeFileSync(
    join(jsRoot, 'package-lock.json'),
    `${JSON.stringify(lock, null, 2)}\n`
  );
  captureVersionTree(jsRoot);
}
