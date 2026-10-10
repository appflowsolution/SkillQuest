import { test, expect } from './fixtures';

test.describe('Dashboard & Navigation Suite', () => {
  test('should render header branding, 3D icon, and all 6 arcade games in catalog', async ({ pageWithAudio: page }) => {
    // 1. Verify Header Branding
    await expect(page.locator('header img[alt="SkillQuest Icon"]')).toBeVisible();
    await expect(page.locator('header').getByText('Skill')).toBeVisible();
    await expect(page.locator('header').getByText('Quest')).toBeVisible();
    await expect(page.getByText('HERO ZONE')).toBeVisible();

    // 2. Verify Mission Arcade Hero Banner
    await expect(page.getByText('SUPERPOWER TRAINING ARCADE')).toBeVisible();
    await expect(page.getByRole('heading', { name: /CHOOSE YOUR QUEST/i })).toBeVisible();

    // 3. Verify all 6 Games in the Catalog
    await expect(page.getByText(/Cosmic Break Quest/i)).toBeVisible();
    await expect(page.getByText(/Time Warp Explorer/i)).toBeVisible();
    await expect(page.getByText(/Star Tower Co-Op/i)).toBeVisible();
    await expect(page.getByText(/Icon Quest Island/i)).toBeVisible();
    await expect(page.getByText(/Chroma Critters Lab/i)).toBeVisible();
    await expect(page.getByText(/Echo Beats Jam/i)).toBeVisible();
  });

  test('should toggle sound in the header and accept search input', async ({ pageWithAudio: page }) => {
    // Audio Mute/Unmute Toggle
    const soundBtn = page.locator('header button[title="Mute Sound"], header button[title="Unmute Sound"]');
    await expect(soundBtn).toBeVisible();
    await soundBtn.click();
    await expect(page.locator('header button[title="Unmute Sound"]')).toBeVisible();
    await soundBtn.click();
    await expect(page.locator('header button[title="Mute Sound"]')).toBeVisible();

    // Search bar functionality
    const searchInput = page.getByPlaceholder('Search missions...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Echo');
    await expect(searchInput).toHaveValue('Echo');
    await searchInput.clear();
  });

  test('should flip 3D card when tapping yellow SKILL corner to view clinical alignment', async ({ pageWithAudio: page }) => {
    const card = page.locator('.perspective-1000').filter({ hasText: /Cosmic Break Quest/i });
    const skillCornerBtn = card.getByRole('button', { name: /SKILL/i });
    await expect(skillCornerBtn).toBeVisible();

    // Tap SKILL corner to flip card
    await skillCornerBtn.click();

    // Verify back face of card reveals clinical ABA alignment
    await expect(card.getByText(/Functional Break Request/i)).toBeVisible();
    await expect(card.getByText(/What is this Skill\?/i)).toBeVisible();

    // Tap Flip Back button
    const flipBackBtn = card.getByRole('button', { name: /Flip back to front cover/i });
    await expect(flipBackBtn).toBeVisible();
    await flipBackBtn.click();

    // Front face should be visible again
    await expect(card.getByText(/Cosmic Break Quest/i)).toBeVisible();
  });
});
