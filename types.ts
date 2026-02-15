
export interface ChassisPart {
  name: string;
  id: string;
  imageUrl: string;
}

export interface CardState extends ChassisPart {
  uniqueId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export enum GameStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  PLAYING = 'PLAYING',
  WON = 'WON'
}
