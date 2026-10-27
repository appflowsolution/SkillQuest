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

    // 3. Verify all 7 Games in the Catalog (6 behavior missions + the memory vault)
    await expect(page.getByText(/Cosmic Break Quest/i)).toBeVisible();
    await expect(page.getByText(/Time Warp Explorer/i)).toBeVisible();
    await expect(page.getByText(/Star Tower Co-Op/i)).toBeVisible();
    await expect(page.getByText(/Icon Quest Island/i)).toBeVisible();
    await expect(page.getByText(/Chroma Critters Lab/i)).toBeVisible();
    await expect(page.getByText(/Echo Beats Jam/i)).toBeVisible();
    await expect(page.getByText(/Nebula Memory Vault/i)).toBeVisible();
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

  test('should switch to Sector 2: Math Academy via sector tabs and lateral chevrons', async ({ pageWithAudio: page }) => {
    // 1. Initial State: Behavior Sector active
    await expect(page.getByRole('heading', { name: /CHOOSE YOUR QUEST/i })).toBeVisible();
    await expect(page.getByText(/Cosmic Break Quest/i)).toBeVisible();

    // 2. Click "SECTOR 2: MATH ACADEMY" tab
    const mathTab = page.getByRole('button', { name: /SECTOR 2: MATH ACADEMY/i });
    await expect(mathTab).toBeVisible();
    await mathTab.click();

    // 3. Verify Math Sector Header & Math Quests
    await expect(page.getByRole('heading', { name: /COSMIC MATH QUESTS/i })).toBeVisible();
    await expect(page.getByText(/Cosmic Fuel Lab/i)).toBeVisible();
    await expect(page.getByText(/Meteor Array Blaster/i)).toBeVisible();
    await expect(page.getByText(/Number Forge Alchemist/i)).toBeVisible();

    // Behavior games should not be in the current view
    await expect(page.getByText(/Cosmic Break Quest/i)).not.toBeVisible();

    // 4. Verify Lateral Chevron to go back to Sector 1
    const prevSectorBtn = page.getByRole('button', { name: /Previous Sector: Behavior & Focus/i });
    await expect(prevSectorBtn).toBeVisible();
    await prevSectorBtn.click();

    // Should be back to Behavior Sector
    await expect(page.getByRole('heading', { name: /CHOOSE YOUR QUEST/i })).toBeVisible();
    await expect(page.getByText(/Cosmic Break Quest/i)).toBeVisible();

    // 5. Verify Lateral Chevron to go to Sector 2
    const nextSectorBtn = page.getByRole('button', { name: /Next Sector: Math & Logic/i });
    await expect(nextSectorBtn).toBeVisible();
    await nextSectorBtn.click();
    await expect(page.getByRole('heading', { name: /COSMIC MATH QUESTS/i })).toBeVisible();
  });

  test('should flip 3D card for Math Quest to view learning goals and interactive mechanics', async ({ pageWithAudio: page }) => {
    // Navigate to Math Sector
    await page.getByRole('button', { name: /SECTOR 2: MATH ACADEMY/i }).click();
    await expect(page.getByText(/Cosmic Fuel Lab/i)).toBeVisible();

    const mathCard = page.locator('.perspective-1000').filter({ hasText: /Cosmic Fuel Lab/i });
    const skillBtn = mathCard.getByRole('button', { name: /SKILL/i });
    await skillBtn.click();

    // Verify pedagogical alignment details
    await expect(mathCard.getByText(/Additive Decomposition & Mass Balance/i)).toBeVisible();
    await expect(mathCard.getByText(/Learning Goal:/i)).toBeVisible();
    await expect(mathCard.getByText(/Interactive Mechanics:/i)).toBeVisible();

    // Flip back
    const flipBackBtn = mathCard.getByRole('button', { name: /Flip back to front cover/i });
    await flipBackBtn.click();
    await expect(mathCard.getByText(/Cosmic Fuel Lab/i)).toBeVisible();
  });

  test('should navigate between sectors using horizontal touch swipe gestures', async ({ pageWithAudio: page }) => {
    // Start in Behavior sector
    await expect(page.getByRole('heading', { name: /CHOOSE YOUR QUEST/i })).toBeVisible();

    // Simulate swipe left (from right to left: deltaX = -150) to transition to Math sector
    await page.evaluate(() => {
      const container = document.querySelector('.overflow-y-auto') as HTMLElement;
      if (!container) return;

      const touchStart = new Touch({
        identifier: 0,
        target: container,
        clientX: 400,
        clientY: 300,
      });
      const touchEnd = new Touch({
        identifier: 0,
        target: container,
        clientX: 250,
        clientY: 305,
      });

      container.dispatchEvent(new TouchEvent('touchstart', { touches: [touchStart], changedTouches: [touchStart], bubbles: true }));
      container.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [touchEnd], bubbles: true }));
    });

    // Should switch to Math sector
    await expect(page.getByRole('heading', { name: /COSMIC MATH QUESTS/i })).toBeVisible();
    await expect(page.getByText(/Meteor Array Blaster/i)).toBeVisible();

    // Simulate swipe right (from left to right: deltaX = +150) to transition back to Behavior sector
    await page.evaluate(() => {
      const container = document.querySelector('.overflow-y-auto') as HTMLElement;
      if (!container) return;

      const touchStart = new Touch({
        identifier: 1,
        target: container,
        clientX: 200,
        clientY: 300,
      });
      const touchEnd = new Touch({
        identifier: 1,
        target: container,
        clientX: 350,
        clientY: 302,
      });

      container.dispatchEvent(new TouchEvent('touchstart', { touches: [touchStart], changedTouches: [touchStart], bubbles: true }));
      container.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [touchEnd], bubbles: true }));
    });

    // Should return to Behavior sector
    await expect(page.getByRole('heading', { name: /CHOOSE YOUR QUEST/i })).toBeVisible();
  });
});
