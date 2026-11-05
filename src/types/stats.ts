import { GameId, WorldSector } from './index';

export type TimeframeFilter = 'daily' | 'weekly' | 'monthly' | 'total';
export type MetricFilter = 'sessions' | 'time';

export interface GameUsageStat {
  gameId: GameId;
  title: string;
  timesPlayed: number;
  totalDurationSeconds: number;
  lastPlayedAt: number; // UNIX timestamp ms
  highScore?: number;
  completedSessions: number;
  updatedAt: number;
}

export interface SessionRecord {
  id: string;
  gameId: GameId;
  durationSeconds: number;
  startedAt: number;
  endedAt: number;
  score?: number;
  completed: boolean;
}

export interface SkillQuestSettings {
  pin: string; // Stored PIN (default '1234')
  updatedAt: number;
}

export interface StatsOverview {
  totalSessions: number;
  totalDurationSeconds: number;
  mostPlayedGame: {
    gameId: GameId;
    title: string;
    timesPlayed: number;
  } | null;
  activeGamesCount: number;
}

export interface GameChartData {
  gameId: GameId;
  title: string;
  shortTitle: string;
  sector: WorldSector;
  skillCode: string;
  skillName: string;
  sessionsCount: number;
  durationSeconds: number;
  durationMinutes: number;
  percentage: number;
}
