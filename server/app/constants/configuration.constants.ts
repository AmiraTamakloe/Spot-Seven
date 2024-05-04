import { HighScore } from '@app/model/dto/high-score.dto';

export const defaultSoloHighScores: HighScore[] = [
    { playerName: 'Canada', time: 60 },
    { playerName: 'Ontario', time: 85 },
    { playerName: 'Alberta', time: 300 },
];

export const defaultDuelHighScores: HighScore[] = [
    { playerName: 'Montréal', time: 55 },
    { playerName: 'Québec', time: 120 },
    { playerName: "Val-d'Or", time: 204 },
];
