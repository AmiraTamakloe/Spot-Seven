export type ConstantName = keyof GameConstants;

export interface GameConstants {
    initialTime: number;
    hintPenalty: number;
    differenceFoundBonus: number;
}
