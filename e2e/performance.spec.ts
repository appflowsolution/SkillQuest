import { test, expect } from './fixtures';

const BUDGET_MS = Number(process.env.PERF_BUDGET_MS) || 4000;

test.describe('Performance & Resource Budget Suite', () => {
  test('time-to-content: Dashboard renders within performance budget', async ({ pageWithAudio: page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.getByRole('heading', { name: /CHOOSE YOUR QUEST/i }).waitFor({ state: 'visible' });
    const ms = Date.now() - start;

    console.log(`[perf] Dashboard time-to-content: ${ms}ms (budget: ${BUDGET_MS}ms)`);
    expect(ms, `Dashboard should render within ${BUDGET_MS}ms`).toBeLessThan(BUDGET_MS);
  });

  test('navigation timing + resource metrics on initial load', async ({ pageWithAudio: page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      const imageResources = resources.filter(r => /\.(webp|jpg|jpeg|png|svg)$/i.test(r.name));

      return {
        domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd),
        loadMs: Math.round(nav.loadEventEnd),
        totalResourceCount: resources.length,
        imageCount: imageResources.length,
      };
    });

    console.log(`[perf] Navigation metrics: ${JSON.stringify(metrics, null, 2)}`);
    expect(metrics.domContentLoadedMs, 'DOMContentLoaded should be sub-second').toBeLessThan(BUDGET_MS);
  });

  test('game transition performance: navigating into games is sub-second', async ({ pageWithAudio: page }) => {
    // 1. Transition into Icon Quest
    const startIconQuest = Date.now();
    const iconCard = page.locator('.perspective-1000').filter({ hasText: /Icon Quest/i });
    await iconCard.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });
    await page.getByRole('button', { name: /Mission Hub/i }).waitFor({ state: 'visible' });
    const msIconQuest = Date.now() - startIconQuest;

    console.log(`[perf] Transition to Icon Quest took: ${msIconQuest}ms`);
    expect(msIconQuest, 'Transition into Icon Quest should be faster than 1500ms').toBeLessThan(1500);

    // Return to Mission Hub
    await page.getByRole('button', { name: /Mission Hub/i }).click();

    // 2. Transition into Echo Beats Jam
    const startEcho = Date.now();
    const echoCard = page.locator('.perspective-1000').filter({ hasText: /Echo Beats Jam/i });
    await echoCard.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });
    await page.getByRole('button', { name: /START ECHO QUEST/i }).waitFor({ state: 'visible' });
    const msEcho = Date.now() - startEcho;

    console.log(`[perf] Transition to Echo Beats took: ${msEcho}ms`);
    expect(msEcho, 'Transition into Echo Beats should be faster than 1500ms').toBeLessThan(1500);
  });
});
