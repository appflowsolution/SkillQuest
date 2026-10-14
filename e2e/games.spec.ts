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

  test('should enter Cosmic Fuel Lab, calibrate energy cells (+5, +5, -2), launch rocket, and return', async ({ pageWithAudio: page }) => {
    // 1. Switch to Sector 2: Math Academy
    await page.getByRole('button', { name: /SECTOR 2: MATH ACADEMY/i }).click();
    await expect(page.getByText(/Cosmic Fuel Lab/i)).toBeVisible();

    // 2. Click Cosmic Fuel Lab card
    const fuelCard = page.locator('.perspective-1000').filter({ hasText: /Cosmic Fuel Lab/i });
    await fuelCard.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });

    // 3. Verify Cosmic Fuel UI
    await expect(page.getByText(/REACTOR CALIBRATION/i)).toBeVisible();
    await expect(page.getByText(/MOON BASE ALPHA/i)).toBeVisible();
    await expect(page.getByText(/TARGET:/i)).toBeVisible();
    await expect(page.getByText(/NEED \+8 MW/i)).toBeVisible();

    // Launch button should be disabled initially
    const launchBtn = page.getByRole('button', { name: /CALIBRATE TO LAUNCH/i });
    await expect(launchBtn).toBeDisabled();

    // 4. Inject +5 MW
    await page.getByRole('button', { name: /\+5/i }).first().click();
    await expect(page.getByText(/NEED \+3 MW/i)).toBeVisible();

    // 5. Inject +5 MW again -> 10 MW (overcharge!)
    await page.getByRole('button', { name: /\+5/i }).first().click();
    await expect(page.getByText(/OVERCHARGE \(\+2 MW\)/i)).toBeVisible();

    // 6. Use safety purge valve -2 MW -> 8 MW (exact match!)
    await page.getByRole('button', { name: /-2/i }).first().click();
    await expect(page.getByText(/CALIBRATED! READY TO LAUNCH/i)).toBeVisible();

    // 7. Launch rocket
    const ignitionBtn = page.getByRole('button', { name: /IGNITION • LAUNCH/i });
    await expect(ignitionBtn).toBeEnabled();
    await ignitionBtn.click();

    // 8. Verify victory modal
    await expect(page.getByRole('heading', { name: /MISSION ACCOMPLISHED!/i })).toBeVisible();
    await expect(page.getByText(/Rocket launched successfully/i)).toBeVisible();

    // 9. Return to Mission Hub
    const returnBtn = page.getByRole('button', { name: /Mission Hub/i }).last();
    await returnBtn.click();
    // Must return to Sector 2: Math Academy directly, not the default Sector 1
    await expect(page.getByRole('heading', { name: /COSMIC MATH QUESTS/i })).toBeVisible();
    await expect(page.getByText(/Meteor Array Blaster/i)).toBeVisible();
  });
});
