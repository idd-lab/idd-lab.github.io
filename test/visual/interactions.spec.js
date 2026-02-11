const { test, expect } = require('@playwright/test');
const { preparePage, stabilizeVisuals } = require('./helpers');

test('publications Abs toggle opens and closes', async ({ page }) => {
  await preparePage(page, 'light');
  await page.goto('al-folio/publications/', { waitUntil: 'networkidle' });
  await stabilizeVisuals(page);

  const absButton = page.getByRole('button', { name: 'Abs' }).first();
  await expect(absButton).toBeVisible();

  const panel = page.locator('.abstract.hidden').first();
  await absButton.click();
  await expect(panel).toHaveClass(/open/);

  await absButton.click();
  await expect(panel).not.toHaveClass(/open/);
});

test('publication popover works without bootstrap compat runtime', async ({ page }) => {
  await preparePage(page, 'light');
  await page.goto('al-folio/publications/', { waitUntil: 'networkidle' });
  await stabilizeVisuals(page);

  const popoverTrigger = page.locator('[data-toggle="popover"]').first();
  test.skip((await popoverTrigger.count()) === 0, 'no popover trigger found in fixture data');

  await popoverTrigger.hover();
  await expect(page.locator('.af-popover')).toBeVisible();
});

test('mobile navbar can expand/collapse', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile-only navigation behavior');

  await preparePage(page, 'light');
  await page.goto('al-folio/', { waitUntil: 'networkidle' });

  const toggle = page.locator('.navbar-toggler').first();
  await expect(toggle).toBeVisible();

  const nav = page.locator('.navbar-collapse').first();
  await toggle.click();
  await expect(nav).toHaveClass(/show/);

  await toggle.click();
  await expect(nav).not.toHaveClass(/show/);
});

test('repositories page renders external stat cards with deterministic fixtures', async ({ page }) => {
  await preparePage(page, 'light');
  await page.goto('al-folio/repositories/', { waitUntil: 'networkidle' });
  await stabilizeVisuals(page);

  const repoImages = page.locator('img[src*="github-readme-stats"], img[src*="github-profile-trophy"]');
  await expect(repoImages.first()).toBeVisible();

  const renderedCount = await repoImages.evaluateAll((images) =>
    images.filter((img) => img.complete && img.naturalWidth > 0).length
  );
  expect(renderedCount).toBeGreaterThan(0);
});

test('blog pagination uses core Tailwind-native styling contract', async ({ page }) => {
  await preparePage(page, 'light');
  await page.goto('al-folio/blog/', { waitUntil: 'networkidle' });
  await stabilizeVisuals(page);

  const pagination = page.locator('.af-pagination');
  await expect(pagination.first()).toBeVisible();

  const pageLink = page.locator('.af-page-link').first();
  await expect(pageLink).toBeVisible();

  const styles = await pageLink.evaluate((node) => {
    const computed = window.getComputedStyle(node);
    return {
      borderTopWidth: computed.borderTopWidth,
      backgroundColor: computed.backgroundColor,
      paddingTop: computed.paddingTop,
      paddingLeft: computed.paddingLeft,
    };
  });

  expect(styles.borderTopWidth).not.toBe('0px');
  expect(styles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  expect(styles.paddingTop).not.toBe('0px');
  expect(styles.paddingLeft).not.toBe('0px');
});
