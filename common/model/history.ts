import { GameMode } from '../game-mode';

export interface History {
    gameStart: number;
    gameTime: number;
    gameMode: GameMode;
    players: string[];
    isWinner?: number;
    hasAbandonned?: number;
}
