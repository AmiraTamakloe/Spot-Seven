/* eslint-disable max-params */
export class StatisticDto {
    gamesPlayed: number;
    gamesWon: number;
    averageScore: number;
    averageTime: string;

    constructor(gamePlayed: number, gamesWon: number, averageScore: number, averageTime: string) {
        this.gamesPlayed = gamePlayed;
        this.gamesWon = gamesWon;
        this.averageScore = averageScore;
        this.averageTime = averageTime;
    }
}
