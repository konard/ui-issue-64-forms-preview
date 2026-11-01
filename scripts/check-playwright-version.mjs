#!/usr/bin/env node
/**
 * Keep the `@playwright/test` npm pin and every pinned Playwright container
 * in `.github/workflows/*.yml` on the same release. Screenshot baselines are
 * only reproducible when the test runner and the browsers come from the same
 * Playwright version.
 *
 * Every line like
 *   image: mcr.microsoft.com/playwright@sha256:<digest> # v1.59.1-noble
 * must carry the version that package.json pins for `@playwright/test`.
 * Ad-hoc `playwright@X.Y.Z` installs in workflows are checked too.
 *
 * Usage: node scripts/check-playwright-version.mjs [--root <dir>]
 * Exit codes: 0 in sync, 1 mismatch or missing pin.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTAINER_PATTERN =
  /mcr\.microsoft\.com\/playwright(?:@sha256:[0-9a-f]{64}\s*#\s*v|:v)(\d+\.\d+\.\d+)/g;
const NPM_PATTERN = /(?:^|\s)(?:@playwright\/test|playwright)@(\d+\.\d+\.\d+)/g;

/**
 * @param {string} root repository root
 * @returns {{expected: string | null, problems: string[], checked: number}}
 */
export function checkPlaywrightVersion(root) {
  const problems = [];
  const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
  const expected =
    pkg.devDependencies?.['@playwright/test'] ??
    pkg.dependencies?.['@playwright/test'] ??
    null;
  if (!expected) {
    return {
      expected,
      problems: ['package.json does not pin @playwright/test'],
      checked: 0,
    };
  }
  if (!/^\d+\.\d+\.\d+$/.test(expected)) {
    problems.push(
      `package.json must pin @playwright/test exactly, found "${expected}"`
    );
  }

  const sources = [];
  const workflowsDir = path.join(root, '.github', 'workflows');
  for (const name of readdirSync(workflowsDir).sort()) {
    if (/\.ya?ml$/.test(name)) {
      sources.push(path.join('.github', 'workflows', name));
    }
  }
  if (pkg.scripts) {
    sources.push('package.json');
  }

  let checked = 0;
  for (const relative of sources) {
    const lines =
      relative === 'package.json'
        ? Object.values(pkg.scripts)
        : readFileSync(path.join(root, relative), 'utf8').split('\n');
    lines.forEach((line, index) => {
      for (const pattern of [CONTAINER_PATTERN, NPM_PATTERN]) {
        for (const match of line.matchAll(pattern)) {
          checked += 1;
          if (match[1] !== expected) {
            const where =
              relative === 'package.json'
                ? relative
                : `${relative}:${index + 1}`;
            problems.push(
              `${where}: Playwright ${match[1]} does not match @playwright/test ${expected}`
            );
          }
        }
      }
    });
  }
  if (checked === 0) {
    problems.push('no pinned Playwright container found in .github/workflows');
  }
  return { expected, problems, checked };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rootIndex = process.argv.indexOf('--root');
  const root =
    rootIndex === -1
      ? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
      : path.resolve(process.argv[rootIndex + 1]);
  const { expected, problems, checked } = checkPlaywrightVersion(root);
  if (problems.length > 0) {
    for (const problem of problems) {
      console.error(`::error::${problem}`);
    }
    process.exit(1);
  }
  console.log(`Playwright ${expected}: ${checked} pin(s) in sync.`);
}
