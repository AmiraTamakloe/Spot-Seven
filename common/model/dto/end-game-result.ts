import { Position } from '../message';

export interface EndGameResultDto {
    isWinner: boolean;
    isForfeit: boolean;
    recordBeaten?: Position;
}
