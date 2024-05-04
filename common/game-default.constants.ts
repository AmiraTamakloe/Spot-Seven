import { GameConstants } from "./game-constants";

export const PENALTY = 5;
export const WIN = 5;
export const INIT = 30;

export const defaultGameConstants: GameConstants = {
    initialTime: INIT,
    hintPenalty: PENALTY,
    differenceFoundBonus: WIN,
};