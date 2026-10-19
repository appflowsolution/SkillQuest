import { test, expect } from './fixtures';

const IPAD_VIEWPORTS = [
  { name: 'iPad Pro 11 Landscape', width: 1180, height: 820 },
  { name: 'iPad 10th Gen Landscape', width: 1080, height: 810 },
  { name: 'iPad Mini / Standard Landscape', width: 1024, height: 768 },
];

test.describe('Layout & Tablet Viewport Guards', () => {
  for (const vp of IPAD_VIEWPORTS) {
    test(`Dashboard has zero horizontal/vertical overflow on ${vp.name} (${vp.width}x${vp.height})`, async ({ pageWithAudio: page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(500);

      const overflowX = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflowX, `Dashboard must not scroll horizontally on ${vp.name}`).toBeLessThanOrEqual(2);

      const overflowY = await page.evaluate(
        () => document.documentElement.scrollHeight - document.documentElement.clientHeight
      );
      expect(overflowY, `Dashboard outer window must fit inside screen without browser scroll on ${vp.name}`).toBeLessThanOrEqual(2);
    });
  }

  test('Icon Quest: all 12 AAC flashcards must fit inside iPad screen without clipping bottom row', async ({ pageWithAudio: page }) => {
    // Test on smallest standard iPad width 1024x768
    await page.setViewportSize({ width: 1024, height: 768 });

    // Navigate to Icon Quest
    const card = page.locator('.perspective-1000').filter({ hasText: /Icon Quest/i });
    await card.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });
    await expect(page.getByRole('button', { name: /Mission Hub/i })).toBeVisible();

    // Verify all 12 flashcards exist and are strictly within the viewport boundaries
    const flashcards = page.locator('.grid-cols-4.grid-rows-3 button');
    await expect(flashcards).toHaveCount(12);

    for (let i = 0; i < 12; i++) {
      const btn = flashcards.nth(i);
      const box = await btn.boundingBox();
      expect(box, `Card #${i} must have a valid bounding box`).not.toBeNull();
      if (box) {
        expect(box.y + box.height, `Card #${i} bottom edge (${box.y + box.height}) must be inside screen height 768`).toBeLessThanOrEqual(768);
        expect(box.x + box.width, `Card #${i} right edge (${box.x + box.width}) must be inside screen width 1024`).toBeLessThanOrEqual(1024);
      }
    }
  });

  test('Echo Beats Jam: Start Quest overlay covers viewport and models without overflow', async ({ pageWithAudio: page }) => {
    await page.setViewportSize({ width: 1180, height: 820 });

    const card = page.locator('.perspective-1000').filter({ hasText: /Echo Beats Jam/i });
    await card.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });

    // Verify start overlay is visible and centered
    const startBtn = page.getByRole('button', { name: /START ECHO QUEST/i });
    await expect(startBtn).toBeVisible();

    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflowX, 'Echo Beats must have zero horizontal overflow').toBeLessThanOrEqual(2);
  });

  test('Time Warp: Canvas and game controls fit snug on iPad', async ({ pageWithAudio: page }) => {
    await page.setViewportSize({ width: 1180, height: 820 });

    const card = page.locator('.perspective-1000').filter({ hasText: /Time Warp/i });
    await card.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });

    await expect(page.getByRole('button', { name: /Mission Hub/i })).toBeVisible();

    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflowX, 'Time Warp must have zero horizontal overflow').toBeLessThanOrEqual(2);
  });

  test('Cosmic Fuel Lab: Reactor, rocket and controls fit snug on standard iPad (1024x768)', async ({ pageWithAudio: page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });

    // Navigate to Math Sector and into Cosmic Fuel Lab
    await page.getByRole('button', { name: /SECTOR 2: MATH ACADEMY/i }).click();
    const fuelCard = page.locator('.perspective-1000').filter({ hasText: /Cosmic Fuel Lab/i });
    await fuelCard.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });

    await expect(page.getByText(/REACTOR CALIBRATION/i)).toBeVisible();

    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflowX, 'Cosmic Fuel Lab must have zero horizontal overflow').toBeLessThanOrEqual(2);

    const overflowY = await page.evaluate(
      () => document.documentElement.scrollHeight - document.documentElement.clientHeight
    );
    expect(overflowY, 'Cosmic Fuel Lab outer window must fit inside screen without browser scroll').toBeLessThanOrEqual(2);
  });

  test('Meteor Array Blaster: Radar, reticle, and steppers fit snug on iPad 9th Gen (1080x810) and Standard (1024x768)', async ({ pageWithAudio: page }) => {
    for (const { width, height, name } of [
      { width: 1080, height: 810, name: 'iPad 9th Gen (1080x810)' },
      { width: 1024, height: 768, name: 'iPad Standard (1024x768)' },
    ]) {
      await page.setViewportSize({ width, height });

      // Navigate to Math Sector and into Meteor Array Blaster
      await page.goto('/');
      await page.getByRole('button', { name: /SECTOR 2: MATH ACADEMY/i }).click();
      const arrayCard = page.locator('.perspective-1000').filter({ hasText: /Meteor Array Blaster/i });
      await arrayCard.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });

      await expect(page.getByText(/SWARM TARGET/i)).toBeVisible();

      const overflowX = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflowX, `Meteor Array Blaster must have zero horizontal overflow on ${name}`).toBeLessThanOrEqual(2);

      const overflowY = await page.evaluate(
        () => document.documentElement.scrollHeight - document.documentElement.clientHeight
      );
      expect(overflowY, `Meteor Array Blaster outer window must fit inside screen without browser scroll on ${name}`).toBeLessThanOrEqual(2);
    }
  });

  test('Number Forge Alchemist: Cauldron, owl, gems, and runes fit snug on standard iPad (1024x768)', async ({ pageWithAudio: page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });

    // Navigate to Math Sector and into Number Forge Alchemist
    await page.getByRole('button', { name: /SECTOR 2: MATH ACADEMY/i }).click();
    const forgeCard = page.locator('.perspective-1000').filter({ hasText: /Number Forge Alchemist/i });
    await forgeCard.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });

    await expect(page.getByText(/STARLIGHT SANCTUM/i)).toBeVisible();

    const overflowX = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflowX, 'Number Forge Alchemist must have zero horizontal overflow').toBeLessThanOrEqual(2);

    const overflowY = await page.evaluate(
      () => document.documentElement.scrollHeight - document.documentElement.clientHeight
    );
    expect(overflowY, 'Number Forge Alchemist outer window must fit inside screen without browser scroll').toBeLessThanOrEqual(2);
  });
});

