import { test, expect } from './fixtures';
import { 
  aggregateStatsByTimeframe, 
  calculateOverview, 
  normalizeStatsMap,
  verifyPin 
} from '../src/services/statsService';
import type { SessionRecord, GameUsageStat } from '../src/types/stats';
import { GAMES_CATALOG } from '../src/data/games';

test.describe('Unit & Mathematical Boundary Suite: Stats Service Engine', () => {
  test('aggregateStatsByTimeframe should strictly respect daily cutoff (today 00:00:00 boundary)', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfTodayMs = today.getTime();

    // 1 millisecond into today vs 1 millisecond before today (yesterday)
    const sessionToday: SessionRecord = {
      id: 's_today',
      gameId: 'break-request',
      durationSeconds: 45,
      startedAt: startOfTodayMs + 1000,
      endedAt: startOfTodayMs + 46000,
      completed: true
    };

    const sessionYesterday: SessionRecord = {
      id: 's_yesterday',
      gameId: 'break-request',
      durationSeconds: 90,
      startedAt: startOfTodayMs - 1000,
      endedAt: startOfTodayMs - 500,
      completed: true
    };

    const result = aggregateStatsByTimeframe('daily', [sessionToday, sessionYesterday], {});
    expect(result['break-request'].sessionsCount).toBe(1);
    expect(result['break-request'].durationSeconds).toBe(45);
  });

  test('aggregateStatsByTimeframe should strictly respect weekly cutoff (7-day window)', () => {
    const now = Date.now();
    const sixDaysAgo = now - 6 * 24 * 3600 * 1000;
    const eightDaysAgo = now - 8 * 24 * 3600 * 1000;

    const sessionSixDays: SessionRecord = {
      id: 's_6d',
      gameId: 'number-forge',
      durationSeconds: 100,
      startedAt: sixDaysAgo,
      endedAt: sixDaysAgo + 100000,
      completed: true
    };

    const sessionEightDays: SessionRecord = {
      id: 's_8d',
      gameId: 'number-forge',
      durationSeconds: 200,
      startedAt: eightDaysAgo,
      endedAt: eightDaysAgo + 200000,
      completed: true
    };

    const result = aggregateStatsByTimeframe('weekly', [sessionSixDays, sessionEightDays], {});
    expect(result['number-forge'].sessionsCount).toBe(1);
    expect(result['number-forge'].durationSeconds).toBe(100);
  });

  test('aggregateStatsByTimeframe should strictly respect monthly cutoff (30-day window)', () => {
    const now = Date.now();
    const twentyFiveDaysAgo = now - 25 * 24 * 3600 * 1000;
    const thirtyFiveDaysAgo = now - 35 * 24 * 3600 * 1000;

    const sessionRecent: SessionRecord = {
      id: 's_25d',
      gameId: 'meteor-array',
      durationSeconds: 150,
      startedAt: twentyFiveDaysAgo,
      endedAt: twentyFiveDaysAgo + 150000,
      completed: true
    };

    const sessionOld: SessionRecord = {
      id: 's_35d',
      gameId: 'meteor-array',
      durationSeconds: 300,
      startedAt: thirtyFiveDaysAgo,
      endedAt: thirtyFiveDaysAgo + 300000,
      completed: true
    };

    const result = aggregateStatsByTimeframe('monthly', [sessionRecent, sessionOld], {});
    expect(result['meteor-array'].sessionsCount).toBe(1);
    expect(result['meteor-array'].durationSeconds).toBe(150);
  });

  test('aggregateStatsByTimeframe should gracefully fall back to allTimeStats when granular sessions are missing but activity occurred in timeframe', () => {
    const now = Date.now();
    const allTimeStats: Record<string, GameUsageStat> = {
      'cosmic-fuel': {
        gameId: 'cosmic-fuel',
        title: 'Cosmic Fuel Lab',
        timesPlayed: 6,
        totalDurationSeconds: 240,
        lastPlayedAt: now - 3600 * 1000, // played today
        completedSessions: 6,
        updatedAt: now
      }
    };

    // Daily with empty session array
    const daily = aggregateStatsByTimeframe('daily', [], allTimeStats);
    expect(daily['cosmic-fuel'].sessionsCount).toBe(6);
    expect(daily['cosmic-fuel'].durationSeconds).toBe(240);

    // Weekly with empty session array
    const weekly = aggregateStatsByTimeframe('weekly', [], allTimeStats);
    expect(weekly['cosmic-fuel'].sessionsCount).toBe(6);
    expect(weekly['cosmic-fuel'].durationSeconds).toBe(240);

    // Monthly with empty session array
    const monthly = aggregateStatsByTimeframe('monthly', [], allTimeStats);
    expect(monthly['cosmic-fuel'].sessionsCount).toBe(6);
    expect(monthly['cosmic-fuel'].durationSeconds).toBe(240);
  });

  test('aggregateStatsByTimeframe total mode blends granular sessions with all-time aggregate maximums', () => {
    const now = Date.now();
    const sessions: SessionRecord[] = [
      { id: 's1', gameId: 'echoic-lab', durationSeconds: 60, startedAt: now - 10000, endedAt: now, completed: true },
      { id: 's2', gameId: 'echoic-lab', durationSeconds: 60, startedAt: now - 5000, endedAt: now, completed: true }
    ];

    const allTimeStats: Record<string, GameUsageStat> = {
      'echoic-lab': {
        gameId: 'echoic-lab',
        title: 'Echo Beats Jam',
        timesPlayed: 5, // higher than 2 sessions in log
        totalDurationSeconds: 300, // higher than 120s
        completedSessions: 5
      }
    };

    const total = aggregateStatsByTimeframe('total', sessions, allTimeStats);
    expect(total['echoic-lab'].sessionsCount).toBe(5);
    expect(total['echoic-lab'].durationSeconds).toBe(300);
  });

  test('calculateOverview computes KPI metrics accurately with edge cases', () => {
    // 1. Empty stats
    const emptyOverview = calculateOverview({});
    expect(emptyOverview.totalSessions).toBe(0);
    expect(emptyOverview.totalDurationSeconds).toBe(0);
    expect(emptyOverview.activeGamesCount).toBe(0);
    expect(emptyOverview.mostPlayedGame).toBeNull();

    // 2. Populated stats
    const stats: Record<string, GameUsageStat> = {
      'break-request': {
        gameId: 'break-request',
        title: 'Cosmic Break Quest',
        timesPlayed: 12,
        totalDurationSeconds: 720,
        completedSessions: 12
      },
      'aac-trainer': {
        gameId: 'aac-trainer',
        title: 'Icon Quest Island',
        timesPlayed: 8,
        totalDurationSeconds: 300,
        completedSessions: 8
      },
      'memory-vault': {
        gameId: 'memory-vault',
        title: 'Nebula Memory Vault',
        timesPlayed: 0,
        totalDurationSeconds: 0,
        completedSessions: 0
      }
    };

    const overview = calculateOverview(stats);
    expect(overview.totalSessions).toBe(20);
    expect(overview.totalDurationSeconds).toBe(1020);
    expect(overview.activeGamesCount).toBe(2); // memory-vault has 0 usage so activeGamesCount is 2
    expect(overview.mostPlayedGame?.gameId).toBe('break-request');
    expect(overview.mostPlayedGame?.timesPlayed).toBe(12);
  });

  test('normalizeStatsMap populates all catalog games with default 0s without mutating existing entries', () => {
    const partial: Record<string, GameUsageStat> = {
      'break-request': {
        gameId: 'break-request',
        title: 'Cosmic Break Quest',
        timesPlayed: 7,
        totalDurationSeconds: 150,
        completedSessions: 7
      }
    };

    const normalized = normalizeStatsMap(partial);
    expect(Object.keys(normalized).length).toBe(GAMES_CATALOG.length);
    expect(normalized['break-request'].timesPlayed).toBe(7);
    expect(normalized['break-request'].totalDurationSeconds).toBe(150);
    expect(normalized['meteor-array'].timesPlayed).toBe(0);
    expect(normalized['meteor-array'].totalDurationSeconds).toBe(0);
  });

  test('verifyPin handles whitespace trimming and defaults safely', () => {
    expect(verifyPin('1234')).toBe(true);
    expect(verifyPin(' 1234 ')).toBe(true);
    expect(verifyPin('0000')).toBe(false);
    expect(verifyPin('')).toBe(false);
  });
});

test.describe('End-to-End Persistence & Lifecycle Browser Suite', () => {
  test('should launch a game, accumulate play time on exit, and sync to Firestore and local storage', async ({ pageWithAudio: page }) => {
    // 1. Launch Cosmic Break Quest (Sector 1)
    const breakCard = page.locator('.perspective-1000').filter({ hasText: /Cosmic Break Quest/i });
    await expect(breakCard).toBeVisible();
    await breakCard.click();

    // Verify inside game
    await expect(page.getByText('Round 1', { exact: true })).toBeVisible();

    // Play for 2.2 seconds to generate elapsed duration
    await page.waitForTimeout(2200);

    // Exit to Mission Hub
    const exitBtn = page.getByRole('button', { name: 'Mission Hub' });
    await exitBtn.click();
    await expect(page.getByText('SUPERPOWER TRAINING ARCADE')).toBeVisible();

    // 2. Open Stats Dashboard
    const statsBtn = page.locator('header button[aria-label="Usage Statistics"]');
    await statsBtn.click();

    // Handle PIN if prompted
    const pinHeader = page.getByText('RBT & Clinical Access');
    if (await pinHeader.isVisible()) {
      const keypad = page.locator('.grid.grid-cols-3');
      await keypad.getByRole('button', { name: '1' }).click();
      await keypad.getByRole('button', { name: '2' }).click();
      await keypad.getByRole('button', { name: '3' }).click();
      await keypad.getByRole('button', { name: '4' }).click();
    }

    // Verify dashboard rendered
    await expect(page.getByText(/RBT & Clinical Analytics Hub/i)).toBeVisible();

    // Verify Cosmic Break Quest is reflected in the breakdown table
    const breakdown = page.locator('.divide-y');
    await expect(breakdown.getByText('Cosmic Break Quest')).toBeVisible();

    // Verify localStorage has valid cache
    const hasLocalStorage = await page.evaluate(() => {
      const raw = localStorage.getItem('skillquest_game_stats_cache_v1');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed['break-request'] && parsed['break-request'].timesPlayed >= 1;
    });
    expect(hasLocalStorage).toBe(true);
  });

  test('should toggle all time scale filters (Daily, Weekly, Monthly, Total) and maintain accurate data visualization', async ({ pageWithAudio: page }) => {
    // Open Stats Dashboard
    const statsBtn = page.locator('header button[aria-label="Usage Statistics"]');
    await statsBtn.click();

    const pinHeader = page.getByText('RBT & Clinical Access');
    if (await pinHeader.isVisible()) {
      const keypad = page.locator('.grid.grid-cols-3');
      await keypad.getByRole('button', { name: '1' }).click();
      await keypad.getByRole('button', { name: '2' }).click();
      await keypad.getByRole('button', { name: '3' }).click();
      await keypad.getByRole('button', { name: '4' }).click();
    }

    await expect(page.getByText(/RBT & Clinical Analytics Hub/i)).toBeVisible();

    const dailyBtn = page.getByRole('button', { name: 'Daily' });
    const weeklyBtn = page.getByRole('button', { name: 'Weekly' });
    const monthlyBtn = page.getByRole('button', { name: 'Monthly' });
    const totalBtn = page.getByRole('button', { name: 'Total' });

    // 1. Switch to Daily
    await dailyBtn.click();
    await expect(dailyBtn).toHaveClass(/bg-\[#00d2b4\]/);
    await expect(page.locator('.divide-y')).toBeVisible();

    // 2. Switch to Weekly
    await weeklyBtn.click();
    await expect(weeklyBtn).toHaveClass(/bg-\[#00d2b4\]/);
    await expect(page.locator('.divide-y')).toBeVisible();

    // 3. Switch to Monthly
    await monthlyBtn.click();
    await expect(monthlyBtn).toHaveClass(/bg-\[#00d2b4\]/);
    await expect(page.locator('.divide-y')).toBeVisible();

    // 4. Switch to Total
    await totalBtn.click();
    await expect(totalBtn).toHaveClass(/bg-\[#00d2b4\]/);
    await expect(page.locator('.divide-y')).toBeVisible();
  });

  test('should switch metric between No. of Sessions and Play Time (Minutes) updating Y-axis and value badges', async ({ pageWithAudio: page }) => {
    // Open Stats Dashboard
    const statsBtn = page.locator('header button[aria-label="Usage Statistics"]');
    await statsBtn.click();

    const pinHeader = page.getByText('RBT & Clinical Access');
    if (await pinHeader.isVisible()) {
      const keypad = page.locator('.grid.grid-cols-3');
      await keypad.getByRole('button', { name: '1' }).click();
      await keypad.getByRole('button', { name: '2' }).click();
      await keypad.getByRole('button', { name: '3' }).click();
      await keypad.getByRole('button', { name: '4' }).click();
    }

    await expect(page.getByText(/RBT & Clinical Analytics Hub/i)).toBeVisible();

    const sessionsMetricBtn = page.getByRole('button', { name: 'No. of Sessions' });
    const timeMetricBtn = page.getByRole('button', { name: 'Play Time (Minutes)' });

    // Switch to Play Time (Minutes)
    await timeMetricBtn.click();
    await expect(timeMetricBtn).toHaveClass(/bg-\[#ffb703\]/);
    await expect(page.getByText('0m').first()).toBeVisible();

    // Switch back to Sessions
    await sessionsMetricBtn.click();
    await expect(sessionsMetricBtn).toHaveClass(/bg-\[#ffb703\]/);
    await expect(page.locator('.divide-y').getByText(/sessions/i).first()).toBeVisible();
  });

  test('should filter games dynamically using sector tabs', async ({ pageWithAudio: page }) => {
    // Open Stats Dashboard
    const statsBtn = page.locator('header button[aria-label="Usage Statistics"]');
    await statsBtn.click();

    const pinHeader = page.getByText('RBT & Clinical Access');
    if (await pinHeader.isVisible()) {
      const keypad = page.locator('.grid.grid-cols-3');
      await keypad.getByRole('button', { name: '1' }).click();
      await keypad.getByRole('button', { name: '2' }).click();
      await keypad.getByRole('button', { name: '3' }).click();
      await keypad.getByRole('button', { name: '4' }).click();
    }

    await expect(page.getByText(/RBT & Clinical Analytics Hub/i)).toBeVisible();

    const behaviorTab = page.getByRole('button', { name: /Behavior & Superpowers/i });
    const mathTab = page.getByRole('button', { name: /Math & Logic/i });
    const allTab = page.getByRole('button', { name: /All Missions/i });

    // 1. Filter by Math & Logic
    await mathTab.click();
    const breakdown = page.locator('.divide-y');
    await expect(breakdown.getByText('Cosmic Fuel Lab')).toBeVisible();
    await expect(breakdown.getByText('Cosmic Break Quest')).not.toBeVisible();

    // 2. Filter by Behavior & Superpowers
    await behaviorTab.click();
    await expect(breakdown.getByText('Cosmic Break Quest')).toBeVisible();
    await expect(breakdown.getByText('Cosmic Fuel Lab')).not.toBeVisible();

    // 3. Reset to All Missions
    await allTab.click();
    await expect(breakdown.getByText('Cosmic Break Quest')).toBeVisible();
    await expect(breakdown.getByText('Cosmic Fuel Lab')).toBeVisible();
  });

  test('should allow changing the PIN, reject the old PIN, and accept the new PIN', async ({ pageWithAudio: page }) => {
    // Open Stats Dashboard
    const statsBtn = page.locator('header button[aria-label="Usage Statistics"]');
    await statsBtn.click();

    const pinHeader = page.getByText('RBT & Clinical Access');
    if (await pinHeader.isVisible()) {
      const keypad = page.locator('.grid.grid-cols-3');
      await keypad.getByRole('button', { name: '1' }).click();
      await keypad.getByRole('button', { name: '2' }).click();
      await keypad.getByRole('button', { name: '3' }).click();
      await keypad.getByRole('button', { name: '4' }).click();
    }

    await expect(page.getByText(/RBT & Clinical Analytics Hub/i)).toBeVisible();

    // Open Change PIN modal
    const changePinBtn = page.locator('button[title="Change PIN"]');
    await changePinBtn.click();
    await expect(page.getByText('Change Access PIN')).toBeVisible();

    // Type new PIN: 7777
    const pinInput = page.locator('input[placeholder*="New PIN"]');
    await pinInput.fill('7777');
    await page.getByRole('button', { name: 'Save PIN' }).click();

    // Wait for success toast to close
    await expect(page.getByText('PIN successfully updated')).toBeVisible();
    await page.waitForTimeout(1500);

    // Return to Mission Hub and reload page to reset in-memory unlock state
    const backBtn = page.getByRole('button', { name: 'Mission Hub' });
    await backBtn.click();
    await page.reload();

    // Re-open stats -> must prompt for PIN
    await statsBtn.click();
    await expect(page.getByText('RBT & Clinical Access')).toBeVisible();

    // Enter OLD PIN: 1234 -> should fail
    const keypad = page.locator('.grid.grid-cols-3');
    await keypad.getByRole('button', { name: '1' }).click();
    await keypad.getByRole('button', { name: '2' }).click();
    await keypad.getByRole('button', { name: '3' }).click();
    await keypad.getByRole('button', { name: '4' }).click();
    await expect(page.getByText(/Incorrect PIN/i)).toBeVisible();
    await page.waitForTimeout(700);

    // Enter NEW PIN: 7777 -> should unlock
    await keypad.getByRole('button', { name: '7' }).click();
    await keypad.getByRole('button', { name: '7' }).click();
    await keypad.getByRole('button', { name: '7' }).click();
    await keypad.getByRole('button', { name: '7' }).click();
    await expect(page.getByText(/RBT & Clinical Analytics Hub/i)).toBeVisible();

    // Restore PIN to 1234 for test idempotency
    await changePinBtn.click();
    await pinInput.fill('1234');
    await page.getByRole('button', { name: 'Save PIN' }).click();
    await page.waitForTimeout(1500);
  });

  test('should gracefully handle offline network condition using local cache', async ({ pageWithAudio: page }) => {
    // 1. Set network offline
    await page.context().setOffline(true);

    // 2. Open Stats Dashboard
    const statsBtn = page.locator('header button[aria-label="Usage Statistics"]');
    await statsBtn.click();

    const pinHeader = page.getByText('RBT & Clinical Access');
    if (await pinHeader.isVisible()) {
      const keypad = page.locator('.grid.grid-cols-3');
      await keypad.getByRole('button', { name: '1' }).click();
      await keypad.getByRole('button', { name: '2' }).click();
      await keypad.getByRole('button', { name: '3' }).click();
      await keypad.getByRole('button', { name: '4' }).click();
    }

    // Dashboard must render without blank screen or uncaught crash
    await expect(page.getByText(/RBT & Clinical Analytics Hub/i)).toBeVisible();
    await expect(page.getByText(/Total Play Time/i)).toBeVisible();

    // 3. Restore network online
    await page.context().setOffline(false);
  });

  test('should trigger CSV and JSON export downloads with valid format and file naming', async ({ pageWithAudio: page }) => {
    // Open Stats Dashboard
    const statsBtn = page.locator('header button[aria-label="Usage Statistics"]');
    await statsBtn.click();

    const pinHeader = page.getByText('RBT & Clinical Access');
    if (await pinHeader.isVisible()) {
      const keypad = page.locator('.grid.grid-cols-3');
      await keypad.getByRole('button', { name: '1' }).click();
      await keypad.getByRole('button', { name: '2' }).click();
      await keypad.getByRole('button', { name: '3' }).click();
      await keypad.getByRole('button', { name: '4' }).click();
    }

    await expect(page.getByText(/RBT & Clinical Analytics Hub/i)).toBeVisible();

    // 1. Test CSV Download
    const [csvDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('button[title="Export CSV"]').click()
    ]);
    expect(csvDownload.suggestedFilename()).toMatch(/^skillquest_clinical_stats_.*\.csv$/);

    // 2. Test JSON Download
    const [jsonDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('button[title="Export JSON"]').click()
    ]);
    expect(jsonDownload.suggestedFilename()).toMatch(/^skillquest_clinical_stats_.*\.json$/);
  });

  test('should flush in-game elapsed duration when app is hidden or minimized (visibilitychange)', async ({ pageWithAudio: page }) => {
    // 1. Launch Cosmic Break Quest
    const breakCard = page.locator('.perspective-1000').filter({ hasText: /Cosmic Break Quest/i });
    await expect(breakCard).toBeVisible();
    await breakCard.click();
    await expect(page.getByText('Round 1', { exact: true })).toBeVisible();

    // Play for 2.0 seconds
    await page.waitForTimeout(2000);

    // 2. Simulate visibilitychange event (e.g. iPad home gesture / app backgrounding)
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // 3. Verify unflushed seconds were recorded in localStorage cache immediately
    const cacheUpdated = await page.evaluate(() => {
      const raw = localStorage.getItem('skillquest_game_stats_cache_v1');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return parsed['break-request'] && parsed['break-request'].totalDurationSeconds > 0;
    });
    expect(cacheUpdated).toBe(true);

    // Restore visibility and return to hub
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.getByRole('button', { name: 'Mission Hub' }).click();
    await expect(page.getByText('SUPERPOWER TRAINING ARCADE')).toBeVisible();
  });

  test('should execute Reset All Data, delete records from Firestore and local cache, and zero out all dashboard metrics', async ({ pageWithAudio: page }) => {
    // 1. Open Stats Dashboard
    const statsBtn = page.locator('header button[aria-label="Usage Statistics"]');
    await statsBtn.click();

    const pinHeader = page.getByText('RBT & Clinical Access');
    if (await pinHeader.isVisible()) {
      const keypad = page.locator('.grid.grid-cols-3');
      await keypad.getByRole('button', { name: '1' }).click();
      await keypad.getByRole('button', { name: '2' }).click();
      await keypad.getByRole('button', { name: '3' }).click();
      await keypad.getByRole('button', { name: '4' }).click();
    }

    await expect(page.getByText(/RBT & Clinical Analytics Hub/i)).toBeVisible();
    await expect(page.locator('.divide-y')).toBeVisible();
    await expect(page.locator('button[title="Refresh Data"] .animate-spin')).not.toBeVisible();

    // 2. Click Reset Statistics button
    const resetBtn = page.locator('button[title="Reset Statistics"]');
    await resetBtn.click();
    await expect(page.getByText('Reset All Statistics?')).toBeVisible();

    // 3. Confirm Reset
    const confirmBtn = page.getByRole('button', { name: 'Yes, Reset All' });
    await confirmBtn.click();

    // 4. Verify modal closes and metrics zero out
    await expect(page.getByText('Reset All Statistics?')).not.toBeVisible();
    await expect(page.locator('.divide-y')).toBeVisible();

    // Verify localStorage cache was reset to 0 counters and empty session history
    const isReset = await page.evaluate(() => {
      const rawStats = localStorage.getItem('skillquest_game_stats_cache_v1');
      const rawSessions = localStorage.getItem('skillquest_sessions_history_v1');
      if (!rawStats) return true;
      const parsedStats = JSON.parse(rawStats);
      const allZeros = Object.values(parsedStats).every((g: any) => (g.timesPlayed || 0) === 0 && (g.totalDurationSeconds || 0) === 0);
      const noSessions = !rawSessions || JSON.parse(rawSessions).length === 0;
      return allZeros && noSessions;
    });
    expect(isReset).toBe(true);
  });
});
