import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('docs/screenshots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const BASE_URL = process.env.BASE_URL || 'https://skill-quest.web.app';

async function capture() {
  console.log(`Launching browser to capture screenshots from ${BASE_URL}...`);
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2, // Retina 2x for ultra-sharp screenshots
  });
  const page = await context.newPage();

  // 1. Dashboard / Mission Hub
  console.log('Capturing Dashboard...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'dashboard.png') });

  // 2. Clinical Skill Card (Flipped card)
  console.log('Capturing Flipped Clinical Card...');
  const firstSkillBadge = page.locator('span:text-is("SKILL 11")').first();
  if (await firstSkillBadge.isVisible()) {
    await firstSkillBadge.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'clinical-card-flipped.png') });
    // Flip back
    await firstSkillBadge.click();
    await page.waitForTimeout(400);
  }

  // 3. Cosmic Break Quest (Mission 1)
  console.log('Capturing Cosmic Break Quest...');
  const breakCard = page.locator('.perspective-1000').filter({ hasText: /Cosmic Break Quest/i });
  await breakCard.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'cosmic-break-quest.png') });

  // Return to Mission Hub
  await page.getByRole('button', { name: /Mission Hub/i }).click();
  await page.waitForTimeout(500);

  // 4. Icon Quest Island (Mission 4 - AAC flashcards)
  console.log('Capturing Icon Quest Island...');
  const iconCard = page.locator('.perspective-1000').filter({ hasText: /Icon Quest/i });
  await iconCard.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'icon-quest-island.png') });

  // Return to Mission Hub
  await page.getByRole('button', { name: /Mission Hub/i }).click();
  await page.waitForTimeout(500);

  // 5. Echo Beats Jam (Mission 6)
  console.log('Capturing Echo Beats Jam...');
  const echoCard = page.locator('.perspective-1000').filter({ hasText: /Echo Beats Jam/i });
  await echoCard.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'echo-beats-jam.png') });

  // Return to Mission Hub
  await page.getByRole('button', { name: /Mission Hub/i }).click();
  await page.waitForTimeout(500);

  // 6. Time Warp Explorer (Mission 2)
  console.log('Capturing Time Warp Explorer...');
  const timeCard = page.locator('.perspective-1000').filter({ hasText: /Time Warp/i });
  await timeCard.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'time-warp-explorer.png') });

  await browser.close();
  console.log('All screenshots captured successfully in docs/screenshots/!');
}

capture().catch(err => {
  console.error('Failed to capture screenshots:', err);
  process.exit(1);
});
