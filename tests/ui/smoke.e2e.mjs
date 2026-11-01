import { expect, test } from '@playwright/test';

import { expectAccessible, screenshotMatrix } from './helpers.mjs';

test.describe('smoke page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('tests/ui/pages/smoke.html');
  });

  test('is accessible in every theme and locale', async ({ page }) => {
    for (const locale of ['en', 'ru']) {
      for (const theme of ['light', 'dark']) {
        await page.evaluate((cell) => window.setUi(cell), { theme, locale });
        await expectAccessible(page);
      }
    }
  });

  test('matches the theme × locale baselines', async ({ page }) => {
    await screenshotMatrix(page, 'smoke', {
      apply: (p, cell) => p.evaluate((c) => window.setUi(c), cell),
    });
  });

  // Guards the visual gate itself: one changed colour must fail the
  // comparison. Skipped while baselines are being rewritten, because
  // --update-snapshots would store the altered colour as the baseline.
  test('fails when one colour changes', async ({ page }, testInfo) => {
    test.skip(
      !['missing', 'none'].includes(testInfo.config.updateSnapshots),
      'baselines are being updated'
    );
    await page.addStyleTag({ content: ':root { --accent: #0b8043; }' });
    await expect(
      expect(page).toHaveScreenshot('smoke-en-light.png', { timeout: 2000 })
    ).rejects.toThrow(/pixels .* are different/);
  });
});
