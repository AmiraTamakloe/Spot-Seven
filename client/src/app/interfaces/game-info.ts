import { GameMode } from '@common/game-mode';
import { ExistingGame } from '@common/model/game';

export interface GameInfo {
    game: ExistingGame;
    username: string;
    otherPlayersUsername?: string[];
    gameMode: GameMode;
    initialTime: number;
    hintPenalty: number;
    differenceFoundBonus: number;
}
