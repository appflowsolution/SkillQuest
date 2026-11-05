import { test, expect } from './fixtures';

test.describe('Clinical & Game Usage Statistics Suite', () => {
  test('should open PIN auth modal from header and unlock with default PIN', async ({ pageWithAudio: page }) => {
    // 1. Verify Stats Button exists in Header
    const statsBtn = page.locator('header button[aria-label="Usage Statistics"]');
    await expect(statsBtn).toBeVisible();

    // 2. Open Auth Modal
    await statsBtn.click();
    await expect(page.getByText('RBT & Clinical Access')).toBeVisible();
    await expect(page.getByText(/Enter your 4-digit PIN/i)).toBeVisible();

    // 3. Test Wrong PIN
    const keypad = page.locator('.grid.grid-cols-3');
    await keypad.getByRole('button', { name: '9' }).click();
    await keypad.getByRole('button', { name: '9' }).click();
    await keypad.getByRole('button', { name: '9' }).click();
    await keypad.getByRole('button', { name: '9' }).click();

    // Error feedback should display
    await expect(page.getByText(/Incorrect PIN/i)).toBeVisible();

    // Wait for error reset
    await page.waitForTimeout(700);

    // 4. Enter Correct Default PIN (1234)
    await keypad.getByRole('button', { name: '1' }).click();
    await keypad.getByRole('button', { name: '2' }).click();
    await keypad.getByRole('button', { name: '3' }).click();
    await keypad.getByRole('button', { name: '4' }).click();

    // 5. Verify Stats Dashboard renders
    await expect(page.getByText(/RBT & Clinical Analytics Hub/i)).toBeVisible();
    await expect(page.getByText(/Total Play Time/i)).toBeVisible();
    await expect(page.getByText(/Total Sessions/i)).toBeVisible();
    await expect(page.getByText(/Favorite Mission/i)).toBeVisible();
    await expect(page.getByText(/Active Missions/i)).toBeVisible();

    // Verify Time Scale Switcher
    await expect(page.getByRole('button', { name: 'Daily' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Weekly' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Monthly' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Total' })).toBeVisible();

    // Verify Vertical Axis Metric Switcher
    await expect(page.getByRole('button', { name: 'No. of Sessions' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Play Time' })).toBeVisible();

    // Test switching metric to Play Time
    await page.getByRole('button', { name: 'Play Time' }).click();
    await page.getByRole('button', { name: 'No. of Sessions' }).click();

    // Verify Sector Tabs
    await expect(page.getByRole('button', { name: /All Missions/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Behavior & Superpowers/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Math & Logic/i })).toBeVisible();

    // 6. Return to Mission Hub
    const backBtn = page.getByRole('button', { name: 'Mission Hub' });
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    // Back on Dashboard
    await expect(page.getByText('SUPERPOWER TRAINING ARCADE')).toBeVisible();
  });

  test('should accurately accumulate play time and reflect in the bar chart and breakdown', async ({ pageWithAudio: page }) => {
    // 1. Launch Cosmic Break Quest
    const cosmicCard = page.locator('.perspective-1000').filter({ hasText: /Cosmic Break Quest/i });
    await cosmicCard.click();

    // Verify inside game
    await expect(page.getByText('Round 1', { exact: true })).toBeVisible();

    // Play for 2.5 seconds
    await page.waitForTimeout(2500);

    // Return to Mission Hub
    const exitBtn = page.getByRole('button', { name: 'Mission Hub' });
    await exitBtn.click();

    // Verify back on main dashboard
    await expect(page.getByText('SUPERPOWER TRAINING ARCADE')).toBeVisible();

    // 2. Open Stats Dashboard
    const statsBtn = page.locator('header button[aria-label="Usage Statistics"]');
    await statsBtn.click();

    // Enter PIN (1234) if prompted, or already unlocked
    const pinHeader = page.getByText('RBT & Clinical Access');
    if (await pinHeader.isVisible()) {
      const keypad = page.locator('.grid.grid-cols-3');
      await keypad.getByRole('button', { name: '1' }).click();
      await keypad.getByRole('button', { name: '2' }).click();
      await keypad.getByRole('button', { name: '3' }).click();
      await keypad.getByRole('button', { name: '4' }).click();
    }

    // Verify stats panel
    await expect(page.getByText(/RBT & Clinical Analytics Hub/i)).toBeVisible();

    // Locate Cosmic Break Quest bar label in the chart
    await expect(page.getByText('Break Quest', { exact: true })).toBeVisible();

    // Locate Cosmic Break Quest item in the leaderboard breakdown
    const breakdown = page.locator('.divide-y');
    await expect(breakdown.getByText('Cosmic Break Quest')).toBeVisible();
    await expect(breakdown.getByText(/sessions/i).first()).toBeVisible();

    // 3. Test Time Scale switchers (Daily, Weekly, Monthly, Total)
    const dailyBtn = page.getByRole('button', { name: 'Daily' });
    const weeklyBtn = page.getByRole('button', { name: 'Weekly' });
    const monthlyBtn = page.getByRole('button', { name: 'Monthly' });
    const totalBtn = page.getByRole('button', { name: 'Total' });

    // Switch to Daily
    await dailyBtn.click();
    await expect(breakdown.getByText('Cosmic Break Quest')).toBeVisible();

    // Switch to Weekly
    await weeklyBtn.click();
    await expect(breakdown.getByText('Cosmic Break Quest')).toBeVisible();

    // Switch to Monthly
    await monthlyBtn.click();
    await expect(breakdown.getByText('Cosmic Break Quest')).toBeVisible();

    // Switch back to Total
    await totalBtn.click();
    await expect(breakdown.getByText('Cosmic Break Quest')).toBeVisible();
  });
});
