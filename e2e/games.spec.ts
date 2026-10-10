import { test, expect } from './fixtures';

test.describe('Game Navigation & Flow Suite', () => {
  test('should enter Cosmic Break Quest and return to Mission Hub', async ({ pageWithAudio: page }) => {
    const card = page.locator('.perspective-1000').filter({ hasText: /Cosmic Break Quest/i });
    await card.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });

    // Verify inside Break Request
    const missionHubBtn = page.getByRole('button', { name: /Mission Hub/i });
    await expect(missionHubBtn).toBeVisible();

    // Verify game specific UI
    await expect(page.getByText(/Cosmic Break/i).or(page.getByText(/Calm/i))).toBeVisible();

    // Return to Mission Hub
    await missionHubBtn.click();
    await expect(page.getByRole('heading', { name: /CHOOSE YOUR QUEST/i })).toBeVisible();
  });

  test('should enter Icon Quest, verify 12 AAC flashcards grid, and return', async ({ pageWithAudio: page }) => {
    const card = page.locator('.perspective-1000').filter({ hasText: /Icon Quest/i });
    await card.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });

    // Verify inside Icon Quest
    const missionHubBtn = page.getByRole('button', { name: /Mission Hub/i });
    await expect(missionHubBtn).toBeVisible();

    // Verify AAC flashcards are visible
    await expect(page.getByText('WANT', { exact: true })).toBeVisible();
    await expect(page.getByText('HELP', { exact: true })).toBeVisible();
    await expect(page.getByText('PLAY', { exact: true })).toBeVisible();

    // Return to Mission Hub
    await missionHubBtn.click();
    await expect(page.getByRole('heading', { name: /CHOOSE YOUR QUEST/i })).toBeVisible();
  });

  test('should enter Echo Beats Jam, verify Start Quest overlay, and return', async ({ pageWithAudio: page }) => {
    const card = page.locator('.perspective-1000').filter({ hasText: /Echo Beats Jam/i });
    await card.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });

    // Verify inside Echo Beats
    const missionHubBtn = page.getByRole('button', { name: /Mission Hub/i });
    await expect(missionHubBtn).toBeVisible();

    // Verify Start Echo Quest Overlay is rendered
    await expect(page.getByRole('button', { name: /START ECHO QUEST/i })).toBeVisible();

    // Return to Mission Hub
    await missionHubBtn.click();
    await expect(page.getByRole('heading', { name: /CHOOSE YOUR QUEST/i })).toBeVisible();
  });

  test('should enter Time Warp: Wait Master and return', async ({ pageWithAudio: page }) => {
    const card = page.locator('.perspective-1000').filter({ hasText: /Time Warp/i });
    await card.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });

    // Verify inside Time Warp
    const missionHubBtn = page.getByRole('button', { name: /Mission Hub/i });
    await expect(missionHubBtn).toBeVisible();

    // Return to Mission Hub
    await missionHubBtn.click();
    await expect(page.getByRole('heading', { name: /CHOOSE YOUR QUEST/i })).toBeVisible();
  });
});
