import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  increment, 
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import type { GameId } from '../types';
import type { GameUsageStat, SessionRecord, StatsOverview, TimeframeFilter } from '../types/stats';
import { GAMES_CATALOG } from '../data/games';

const STATS_COLLECTION = 'skillquest_game_stats';
const SESSIONS_COLLECTION = 'skillquest_sessions';
const SETTINGS_COLLECTION = 'skillquest_settings';
const LOCAL_STORAGE_KEY = 'skillquest_game_stats_cache_v1';
const SESSIONS_LOCAL_STORAGE_KEY = 'skillquest_sessions_history_v1';
const PIN_STORAGE_KEY = 'skillquest_auth_pin_v1';
const DEFAULT_PIN = '1234';

// In-memory cache synced with localStorage
function getLocalCache(): Record<string, GameUsageStat> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore JSON parse errors
  }
  return {};
}

function setLocalCache(stats: Record<string, GameUsageStat>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage quota errors
  }
}

function getLocalSessionsCache(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(SESSIONS_LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore JSON parse errors
  }
  return [];
}

function setLocalSessionsCache(sessions: SessionRecord[]) {
  try {
    localStorage.setItem(SESSIONS_LOCAL_STORAGE_KEY, JSON.stringify(sessions.slice(0, 500)));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Ensures all games in the catalog exist in the stats map with default 0 counters.
 */
export function normalizeStatsMap(incoming: Record<string, GameUsageStat>): Record<string, GameUsageStat> {
  const result: Record<string, GameUsageStat> = { ...incoming };
  for (const game of GAMES_CATALOG) {
    if (!result[game.id]) {
      result[game.id] = {
        gameId: game.id,
        title: game.title,
        timesPlayed: 0,
        totalDurationSeconds: 0,
        lastPlayedAt: 0,
        completedSessions: 0,
        updatedAt: Date.now()
      };
    }
  }
  return result;
}

/**
 * Fetch stats from Firestore with local cache fallback.
 */
export async function getGameStats(): Promise<Record<string, GameUsageStat>> {
  const local = getLocalCache();
  try {
    const colRef = collection(db, STATS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const remote: Record<string, GameUsageStat> = {};

    snapshot.forEach((d) => {
      remote[d.id] = d.data() as GameUsageStat;
    });

    // If remote is empty, Firestore has 0 documents (e.g. freshly reset). Do not resurrect from local.
    const merged = snapshot.empty 
      ? normalizeStatsMap({}) 
      : normalizeStatsMap({ ...local, ...remote });
    setLocalCache(merged);
    return merged;
  } catch (err) {
    console.warn('[StatsService] Firestore fetch failed, using local cache:', err);
    return normalizeStatsMap(local);
  }
}

/**
 * Fetch all historical session logs with local fallback.
 */
export async function getSessionHistory(): Promise<SessionRecord[]> {
  const local = getLocalSessionsCache();
  try {
    const colRef = collection(db, SESSIONS_COLLECTION);
    const snapshot = await getDocs(colRef);
    const remote: SessionRecord[] = [];

    snapshot.forEach((d) => {
      remote.push(d.data() as SessionRecord);
    });

    // If remote has 0 sessions (e.g. after reset), do not resurrect from local cache
    if (snapshot.empty) {
      setLocalSessionsCache([]);
      return [];
    }

    const map = new Map<string, SessionRecord>();
    for (const s of local) map.set(s.id, s);
    for (const s of remote) map.set(s.id, s);
    const merged = Array.from(map.values()).sort((a, b) => b.startedAt - a.startedAt);
    setLocalSessionsCache(merged);
    return merged;
  } catch (err) {
    console.warn('[StatsService] Firestore session fetch failed:', err);
    return local;
  }
}

/**
 * Heartbeat recording: called periodically (every 60s) during active gameplay.
 * Flushes elapsed seconds since last flush to avoid data loss on unexpected exits.
 */
export async function recordHeartbeat(gameId: GameId, elapsedSeconds: number) {
  const roundedSeconds = Math.max(0, Math.round(elapsedSeconds));
  if (roundedSeconds <= 0) return;
  const now = Date.now();
  const game = GAMES_CATALOG.find(g => g.id === gameId);
  const title = game?.title || gameId;

  // 1. Update local cache immediately
  const local = getLocalCache();
  const current = local[gameId] || {
    gameId,
    title,
    timesPlayed: 1,
    totalDurationSeconds: 0,
    lastPlayedAt: now,
    completedSessions: 0,
    updatedAt: now
  };
  current.totalDurationSeconds = (current.totalDurationSeconds || 0) + roundedSeconds;
  current.lastPlayedAt = now;
  current.updatedAt = now;
  local[gameId] = current;
  setLocalCache(local);

  // 2. Sync to Firestore (non-blocking)
  try {
    const docRef = doc(db, STATS_COLLECTION, gameId);
    await setDoc(docRef, {
      gameId,
      title,
      totalDurationSeconds: increment(roundedSeconds),
      lastPlayedAt: now,
      updatedAt: now
    }, { merge: true });
  } catch (err) {
    console.warn('[StatsService] Heartbeat sync to Firestore failed:', err);
  }
}

/**
 * Session Exit recording: called when returning to dashboard or completing a mission.
 */
export async function recordSessionExit(
  gameId: GameId, 
  unflushedSeconds: number,
  totalSessionSeconds: number, 
  score?: number,
  completed: boolean = true
) {
  const now = Date.now();
  const game = GAMES_CATALOG.find(g => g.id === gameId);
  const title = game?.title || gameId;
  const additionalSeconds = Math.max(0, Math.round(unflushedSeconds));

  // 1. Local cache update
  const local = getLocalCache();
  const current = local[gameId] || {
    gameId,
    title,
    timesPlayed: 0,
    totalDurationSeconds: 0,
    lastPlayedAt: now,
    completedSessions: 0,
    updatedAt: now
  };

  current.timesPlayed = (current.timesPlayed || 0) + 1;
  current.totalDurationSeconds = (current.totalDurationSeconds || 0) + additionalSeconds;
  if (completed) {
    current.completedSessions = (current.completedSessions || 0) + 1;
  }
  if (score !== undefined && (current.highScore === undefined || score > current.highScore)) {
    current.highScore = score;
  }
  current.lastPlayedAt = now;
  current.updatedAt = now;
  local[gameId] = current;
  setLocalCache(local);

  // Also append session to local sessions cache
  const sessionId = `${gameId}_${now}_${Math.random().toString(36).substring(2, 7)}`;
  const sessionRecord: SessionRecord = {
    id: sessionId,
    gameId,
    durationSeconds: Math.max(1, Math.round(totalSessionSeconds)),
    startedAt: now - Math.round(totalSessionSeconds * 1000),
    endedAt: now,
    completed
  };
  if (typeof score === 'number') {
    sessionRecord.score = score;
  }
  const sessionsLocal = getLocalSessionsCache();
  sessionsLocal.unshift(sessionRecord);
  setLocalSessionsCache(sessionsLocal);

  // 2. Firestore update
  try {
    const docRef = doc(db, STATS_COLLECTION, gameId);
    const updatePayload: Record<string, any> = {
      gameId,
      title,
      timesPlayed: increment(1),
      totalDurationSeconds: increment(additionalSeconds),
      lastPlayedAt: now,
      updatedAt: now
    };
    if (completed) {
      updatePayload.completedSessions = increment(1);
    }
    if (score !== undefined) {
      const existingDoc = await getDoc(docRef);
      const existingData = existingDoc.exists() ? (existingDoc.data() as GameUsageStat) : null;
      if (!existingData?.highScore || score > existingData.highScore) {
        updatePayload.highScore = score;
      }
    }
    await setDoc(docRef, updatePayload, { merge: true });

    // 3. Save individual session log
    const sessionDocRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await setDoc(sessionDocRef, sessionRecord);
  } catch (err) {
    console.warn('[StatsService] Session exit sync failed:', err);
  }
}

/**
 * Aggregates statistics by timeframe (daily, weekly, monthly, total).
 */
export function aggregateStatsByTimeframe(
  timeframe: TimeframeFilter,
  sessions: SessionRecord[],
  allTimeStats: Record<string, GameUsageStat>
): Record<string, { sessionsCount: number; durationSeconds: number }> {
  const now = Date.now();
  let cutoffTimestamp = 0;

  if (timeframe === 'daily') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    cutoffTimestamp = today.getTime();
  } else if (timeframe === 'weekly') {
    cutoffTimestamp = now - 7 * 24 * 3600 * 1000;
  } else if (timeframe === 'monthly') {
    cutoffTimestamp = now - 30 * 24 * 3600 * 1000;
  } else {
    cutoffTimestamp = 0;
  }

  const result: Record<string, { sessionsCount: number; durationSeconds: number }> = {};
  for (const game of GAMES_CATALOG) {
    result[game.id] = { sessionsCount: 0, durationSeconds: 0 };
  }

  const filtered = sessions.filter(s => s.startedAt >= cutoffTimestamp);
  for (const s of filtered) {
    if (result[s.gameId]) {
      result[s.gameId].sessionsCount += 1;
      result[s.gameId].durationSeconds += s.durationSeconds || 0;
    }
  }

  // If timeframe is total, blend with allTimeStats to account for aggregated counters
  if (timeframe === 'total') {
    for (const game of GAMES_CATALOG) {
      const allTime = allTimeStats[game.id];
      if (allTime) {
        result[game.id].sessionsCount = Math.max(result[game.id].sessionsCount, allTime.timesPlayed || 0);
        result[game.id].durationSeconds = Math.max(result[game.id].durationSeconds, allTime.totalDurationSeconds || 0);
      }
    }
  } else {
    // For daily, weekly, and monthly: if individual session documents are absent or empty
    // but allTimeStats has activity within this timeframe window, gracefully fall back
    for (const game of GAMES_CATALOG) {
      const allTime = allTimeStats[game.id];
      if (allTime && allTime.lastPlayedAt && allTime.lastPlayedAt >= cutoffTimestamp) {
        if (result[game.id].sessionsCount === 0 && (allTime.timesPlayed || 0) > 0) {
          result[game.id].sessionsCount = allTime.timesPlayed || 0;
          result[game.id].durationSeconds = allTime.totalDurationSeconds || 0;
        }
      }
    }
  }

  return result;
}

/**
 * Calculates high-level summary KPIs.
 */
export function calculateOverview(stats: Record<string, GameUsageStat>): StatsOverview {
  let totalSessions = 0;
  let totalDurationSeconds = 0;
  let mostPlayed: { gameId: GameId; title: string; timesPlayed: number } | null = null;
  let activeGamesCount = 0;

  for (const item of Object.values(stats)) {
    if (item.timesPlayed > 0 || item.totalDurationSeconds > 0) {
      activeGamesCount++;
      totalSessions += item.timesPlayed || 0;
      totalDurationSeconds += item.totalDurationSeconds || 0;

      if (!mostPlayed || (item.timesPlayed || 0) > mostPlayed.timesPlayed) {
        mostPlayed = {
          gameId: item.gameId,
          title: item.title,
          timesPlayed: item.timesPlayed || 0
        };
      }
    }
  }

  return {
    totalSessions,
    totalDurationSeconds,
    mostPlayedGame: mostPlayed,
    activeGamesCount
  };
}

/**
 * Reset all stats (local cache and remote Firestore docs).
 */
export async function resetAllStats(): Promise<void> {
  try {
    const statsCol = collection(db, STATS_COLLECTION);
    const statsSnap = await getDocs(statsCol);
    if (!statsSnap.empty) {
      const batch = writeBatch(db);
      statsSnap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    const sessionsCol = collection(db, SESSIONS_COLLECTION);
    const sessionsSnap = await getDocs(sessionsCol);
    if (!sessionsSnap.empty) {
      const batch = writeBatch(db);
      sessionsSnap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (err) {
    console.warn('[StatsService] Remote reset failed:', err);
  } finally {
    setLocalCache(normalizeStatsMap({}));
    setLocalSessionsCache([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(SESSIONS_LOCAL_STORAGE_KEY);
  }
}

/**
 * PIN Management
 */
export function getSavedPin(): string {
  try {
    const pin = localStorage.getItem(PIN_STORAGE_KEY);
    if (pin && pin.trim().length > 0) return pin;
  } catch {
    // fallback
  }
  return DEFAULT_PIN;
}

export function verifyPin(inputPin: string): boolean {
  return inputPin.trim() === getSavedPin().trim();
}

export async function changePin(newPin: string): Promise<boolean> {
  if (!newPin || newPin.trim().length < 4) return false;
  try {
    localStorage.setItem(PIN_STORAGE_KEY, newPin.trim());
    const settingsDoc = doc(db, SETTINGS_COLLECTION, 'auth');
    await setDoc(settingsDoc, {
      pin: newPin.trim(),
      updatedAt: Date.now()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('[StatsService] PIN change remote sync failed:', err);
    return true;
  }
}

/**
 * Clinical Export utilities
 */
export function exportStatsJSON(stats: Record<string, GameUsageStat>, sessions: SessionRecord[]) {
  const payload = {
    exportedAt: new Date().toISOString(),
    aggregated: stats,
    sessionsHistory: sessions
  };
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
  const anchor = document.createElement('a');
  anchor.setAttribute("href", dataStr);
  anchor.setAttribute("download", `skillquest_clinical_stats_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function exportStatsCSV(stats: Record<string, GameUsageStat>) {
  const headers = ["ID", "Game Title", "Times Played", "Total Minutes", "Last Played", "Completed Sessions", "High Score"];
  const rows = Object.values(stats).map(item => [
    item.gameId,
    `"${item.title.replace(/"/g, '""')}"`,
    item.timesPlayed || 0,
    (item.totalDurationSeconds / 60).toFixed(1),
    item.lastPlayedAt ? new Date(item.lastPlayedAt).toLocaleString() : 'Never',
    item.completedSessions || 0,
    item.highScore ?? 'N/A'
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const anchor = document.createElement('a');
  anchor.setAttribute("href", encodeURI(csvContent));
  anchor.setAttribute("download", `skillquest_clinical_stats_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
