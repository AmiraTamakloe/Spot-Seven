import { HighScore as HighScoreInterface } from '@common/model/high-score';

export class HighScore implements HighScoreInterface {
    playerName: string;
    time: number;

    constructor(playerName: string, time: number) {
        this.playerName = playerName;
        this.time = time;
    }
}
