import { Difficulty } from './difficulty';
import { HighScore } from './high-score';

export interface Game {
    _id?: string;
    name: string;
    difficulty: Difficulty;
    differencesCount: number;
    originalImageFilename: string;
    modifiedImageFilename: string;
    soloHighScores: HighScore[];
    duelHighScores: HighScore[];
}

export type ExistingGame = Game & { _id: string };

export enum GameSheetState {
    Creatable = 'creatable',
    Joinable = 'joinable',
}

export interface JoinableGame {
    _id: string;
    sheetState: GameSheetState;
}
