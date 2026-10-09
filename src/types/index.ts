export type GameId = 
  | 'break-request'
  | 'more-time'
  | 'turn-taking'
  | 'aac-trainer'
  | 'request-help'
  | 'echoic-lab';

export interface GameMetadata {
  id: GameId;
  number: number;
  title: string;
  subtitle: string;
  skillName: string;
  skillCode: string;
  baseline: string;
  currentMastery: string;
  targetGoal: string;
  colorTheme: {
    accent: string;
    bgGlow: string;
    border: string;
    badge: string;
  };
  iconName: string;
  isAvailable: boolean;
}

export interface TrialLog {
  id: string;
  gameId: GameId;
  timestamp: number;
  type: 'independent' | 'prompted' | 'refusal';
  notes?: string;
}

export interface SessionStats {
  totalBreaksRequested: number;
  independentBreaks: number;
  promptedBreaks: number;
  breakTimeSpentSeconds: number;
  gemsCompleted: number;
}
