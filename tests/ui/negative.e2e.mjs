import { expect, test } from '@playwright/test';

import { axeViolations, expectAccessible } from './helpers.mjs';

test('axe reports label and color-contrast violations', async ({ page }) => {
  await page.goto('tests/ui/pages/inaccessible.html');
  const ids = (await axeViolations(page)).map((v) => v.id);
  expect(ids).toContain('label');
  expect(ids).toContain('color-contrast');
});

test('expectAccessible fails on an inaccessible page', async ({ page }) => {
  await page.goto('tests/ui/pages/inaccessible.html');
  await expect(expectAccessible(page)).rejects.toThrow(/color-contrast/);
});
