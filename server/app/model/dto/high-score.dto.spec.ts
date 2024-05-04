import { HighScore } from './high-score.dto';

describe('HighScore', () => {
    it('constructor should construct', () => {
        const highScore: HighScore = { playerName: 'romain', time: 120 };
        expect(new HighScore(highScore.playerName, highScore.time)).toEqual(highScore);
    });
});
