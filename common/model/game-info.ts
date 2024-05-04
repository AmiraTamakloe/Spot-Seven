import { ExistingGame } from './game';

export interface GameInfo {
    sessionId: string;
    game: ExistingGame;
    initialTime: number;
    hintPenalty: number;
    differenceFoundBonus: number;
    usernames: string[];
}
