import { Difficulty } from '@common/model/difficulty';

export class TemporaryGame {
    detectionRadius: number;

    difficulty: Difficulty;

    creationTimestamp: number;

    constructor(detectionRadius: number, difficulty: Difficulty, creationTimestamp: number = Date.now()) {
        this.detectionRadius = detectionRadius;
        this.difficulty = difficulty;
        this.creationTimestamp = creationTimestamp;
    }
}
