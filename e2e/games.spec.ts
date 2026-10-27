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

  test('should enter Meteor Array Blaster, adjust rows/cols, vaporize swarm, and return', async ({ pageWithAudio: page }) => {
    // 1. Switch to Sector 2: Math Academy
    await page.getByRole('button', { name: /SECTOR 2: MATH ACADEMY/i }).click();
    await expect(page.getByRole('heading', { name: /COSMIC MATH QUESTS/i })).toBeVisible();

    // 2. Click on Meteor Array Blaster card
    const arrayCard = page.locator('.perspective-1000').filter({ hasText: /Meteor Array Blaster/i });
    await arrayCard.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });

    // 3. Verify game HUD and level 1 swarm target
    await expect(page.getByText(/LUNAR OUTPOST ALPHA/i)).toBeVisible();
    await expect(page.getByText(/6 METEORS/i)).toBeVisible();

    // 4. Default rows=2, cols=3 => 2 * 3 = 6 CELLS
    await expect(page.getByText('ROWS:').first()).toBeVisible();
    await expect(page.getByText('COLS:').first()).toBeVisible();
    await expect(page.getByText(/6 CELLS/i)).toBeVisible();

    // 5. Fire matrix beam with arcade Big Red FIRE button
    const fireBtn = page.getByRole('button', { name: /^FIRE$/i });
    await expect(fireBtn).toBeVisible();
    await fireBtn.click();

    // 6. Verify swarm vaporized
    await expect(page.getByText(/SWARM VAPORIZED!/i)).toBeVisible();

    // 7. Return to Mission Hub
    const returnBtn = page.getByRole('button', { name: /Mission Hub/i }).first();
    await returnBtn.click();

    // 8. Assert returned to Sector 2: Math Academy
    await expect(page.getByRole('heading', { name: /COSMIC MATH QUESTS/i })).toBeVisible();
    await expect(page.getByText(/Meteor Array Blaster/i)).toBeVisible();
  });

  test('should enter Number Forge Alchemist, transmute gems in cauldron (3 + 4 = 7), forge crystal, and return', async ({ pageWithAudio: page }) => {
    // 1. Switch to Sector 2: Math Academy
    await page.getByRole('button', { name: /SECTOR 2: MATH ACADEMY/i }).click();
    await expect(page.getByRole('heading', { name: /COSMIC MATH QUESTS/i })).toBeVisible();

    // 2. Click on Number Forge Alchemist card
    const forgeCard = page.locator('.perspective-1000').filter({ hasText: /Number Forge Alchemist/i });
    await forgeCard.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });

    // 3. Verify Sanctum 1 HUD and Target Crystal 7
    await expect(page.getByText(/STARLIGHT SANCTUM/i)).toBeVisible();
    await expect(page.getByTestId('target-crystal-value')).toHaveText('7');

    // 4. Toss Gem 3 into cauldron -> select Rune + -> toss Gem 4
    await page.getByRole('button', { name: 'Gem 3' }).click();
    await expect(page.getByTestId('cauldron-current-value')).toHaveText('3');

    await page.getByRole('button', { name: 'Rune +' }).click();
    await page.getByRole('button', { name: 'Gem 4' }).click();
    await expect(page.getByTestId('cauldron-current-value')).toHaveText('7');
    await expect(page.getByText(/ELIXIR READY!/i)).toBeVisible();

    // 5. Forge the crystal
    const forgeBtn = page.getByRole('button', { name: /FORGE CRYSTAL/i });
    await expect(forgeBtn).toBeEnabled();
    await forgeBtn.click();
    await expect(page.getByText(/CRYSTAL FORGED!/i).first()).toBeVisible();

    // 6. Return to Mission Hub and verify Sector 2 persistence
    const returnBtn = page.getByRole('button', { name: /Mission Hub/i }).first();
    await returnBtn.click();
    await expect(page.getByRole('heading', { name: /COSMIC MATH QUESTS/i })).toBeVisible();
    await expect(page.getByText(/Number Forge Alchemist/i)).toBeVisible();
  });

  test('should enter Nebula Memory Vault, reunite a symbol pair, and return to Mission Hub', async ({ pageWithAudio: page }) => {
    // 1. Sector 1 (Focus & Behavior) is the default sector
    const card = page.locator('.perspective-1000').filter({ hasText: /Nebula Memory Vault/i });
    await card.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });

    // 2. Verify the vault HUD for level 1
    // The app header also renders a "Mission Hub" button, so match the vault's own
    // distinguishable accessible name to avoid a strict-mode ambiguity.
    await expect(page.getByRole('button', { name: /Return to Mission Hub/i })).toBeVisible();
    await expect(page.getByText(/Vault 1\/4/i)).toBeVisible();
    await expect(page.getByText(/Docking Bay Alpha/i)).toBeVisible();

    // 3. Level 1 holds 3 pairs = 6 capsules, all face down at start
    const capsules = page.getByTestId('vault-capsule');
    await expect(capsules).toHaveCount(6);
    await expect(page.locator('[data-testid="vault-capsule"][data-face-up="true"]')).toHaveCount(0);

    // 4. Flip one capsule
    await capsules.first().click();
    await expect(page.locator('[data-testid="vault-capsule"][data-face-up="true"]')).toHaveCount(1);

    // 5. Flip its twin (resolved by symbol, never by shuffle order)
    const symbols = await capsules.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-symbol')),
    );
    const firstSymbol = symbols[0];
    const twinIndex = symbols.findIndex((symbol, index) => index > 0 && symbol === firstSymbol);
    expect(twinIndex, 'level 1 must contain the twin of the first capsule').toBeGreaterThan(0);

    await capsules.nth(twinIndex).click();

    // 6. The pair stays face up and is marked as resolved
    await expect(page.locator('[data-testid="vault-capsule"][data-matched="true"]')).toHaveCount(2);
    await expect(capsules.first()).toHaveAttribute('data-matched', 'true');
    await expect(capsules.nth(twinIndex)).toHaveAttribute('data-matched', 'true');

    // 7. Return to Mission Hub and stay in Sector 1
    await page.getByRole('button', { name: /Return to Mission Hub/i }).click();
    await expect(page.getByRole('heading', { name: /CHOOSE YOUR QUEST/i })).toBeVisible();
    await expect(page.getByText(/Nebula Memory Vault/i)).toBeVisible();
  });

  test('should re-seal a mismatched capsule pair without penalty in Nebula Memory Vault', async ({ pageWithAudio: page }) => {
    const card = page.locator('.perspective-1000').filter({ hasText: /Nebula Memory Vault/i });
    await card.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });

    const capsules = page.getByTestId('vault-capsule');
    await expect(capsules).toHaveCount(6);

    const symbols = await capsules.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-symbol')),
    );
    const firstSymbol = symbols[0];
    const differentIndex = symbols.findIndex((symbol) => symbol !== firstSymbol);
    expect(differentIndex, 'level 1 must contain a different symbol').toBeGreaterThan(0);

    // Flip two capsules that do not match
    await capsules.first().click();
    await capsules.nth(differentIndex).click();
    await expect(page.locator('[data-testid="vault-capsule"][data-face-up="true"]')).toHaveCount(2);

    // Both return face down and nothing is scored as a pair
    await expect(page.locator('[data-testid="vault-capsule"][data-face-up="true"]')).toHaveCount(0, {
      timeout: 5000,
    });
    await expect(page.locator('[data-testid="vault-capsule"][data-matched="true"]')).toHaveCount(0);

    // The deck is still fully playable: the message stays honest about misses
    await expect(page.getByText(/A mismatch is information/i)).toBeVisible();
  });

  test('should switch to two-player mode and pass the turn after a mismatch', async ({ pageWithAudio: page }) => {
    const card = page.locator('.perspective-1000').filter({ hasText: /Nebula Memory Vault/i });
    await card.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });

    // Solo mode shows a single accumulator and no turn indicator
    await expect(page.getByTestId('mode-1p')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('turn-indicator')).toHaveCount(0);

    // Switch to two players
    await page.getByTestId('mode-2p').click();
    await expect(page.getByTestId('mode-2p')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('turn-indicator')).toHaveText(/Player 1 turn/i);
    await expect(page.getByTestId('score-p1')).toContainText('0');
    await expect(page.getByTestId('score-p2')).toContainText('0');

    // Player 1 fails a pair: the turn passes only once the capsules re-seal
    const capsules = page.getByTestId('vault-capsule');
    await expect(capsules).toHaveCount(6);
    const symbols = await capsules.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-symbol')),
    );
    const differentIndex = symbols.findIndex((symbol) => symbol !== symbols[0]);
    expect(differentIndex, 'level 1 must contain a different symbol').toBeGreaterThan(0);

    await capsules.first().click();
    await capsules.nth(differentIndex).click();

    await expect(page.getByTestId('turn-indicator')).toHaveText(/Player 2 turn/i, { timeout: 5000 });
    await expect(page.getByTestId('score-p2')).toContainText('0');
  });

  test('should jump straight to any vault with the level selector and celebrate a match', async ({ pageWithAudio: page }) => {
    const card = page.locator('.perspective-1000').filter({ hasText: /Nebula Memory Vault/i });
    await card.locator('.backface-hidden').first().click({ position: { x: 80, y: 80 } });

    const capsules = page.getByTestId('vault-capsule');
    await expect(page.getByTestId('level-select-1')).toHaveAttribute('aria-pressed', 'true');

    // Direct jump to the densest vault (5 x 4 = 20 capsules)
    await page.getByTestId('level-select-4').click();
    await expect(page.getByText(/Vault 4\/4/i)).toBeVisible();
    await expect(page.getByTestId('level-select-4')).toHaveAttribute('aria-pressed', 'true');
    await expect(capsules).toHaveCount(20);

    // Back to the smallest vault to exercise the celebration on a known pair
    await page.getByTestId('level-select-1').click();
    await expect(capsules).toHaveCount(6);

    const symbols = await capsules.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-symbol')),
    );
    const firstSymbol = symbols[0];
    const twinIndex = symbols.findIndex((symbol, index) => index > 0 && symbol === firstSymbol);
    expect(twinIndex, 'level 1 must contain the twin of the first capsule').toBeGreaterThan(0);

    await capsules.first().click();
    await capsules.nth(twinIndex).click();

    // Attention effect: a localized score popup rises from the matched capsule
    await expect(page.getByTestId('score-popup')).toBeVisible();
    await expect(page.getByTestId('score-popup')).toHaveText(/^\+\d+$/);
    await expect(page.locator('[data-testid="vault-capsule"][data-matched="true"]')).toHaveCount(2);
  });
});

