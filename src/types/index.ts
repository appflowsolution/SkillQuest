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
  category: string;
  genre: string;
  ribbon: string;
  ribbonColor: string;
  isAvailable: boolean;
}
