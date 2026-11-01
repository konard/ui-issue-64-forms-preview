import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

import { expectAccessible } from './helpers.mjs';

const distIndex = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../examples/universal-app/dist/index.html'
);

/**
 * Violations that exist today. Each entry links the issue that tracks its
 * fix; the helper fails once a listed rule stops firing.
 * @type {{id: string, issue: string}[]}
 */
const knownViolations = [];

test('example app is accessible', async ({ page }) => {
  // Run `npm run example:web:build` first; this test does not build.
  expect(
    existsSync(distIndex),
    `missing ${distIndex}: run npm run example:web:build`
  ).toBe(true);
  await page.goto('example-app/');
  await page.locator('#calculator-title').waitFor();
  await expectAccessible(page, { knownViolations });
});
