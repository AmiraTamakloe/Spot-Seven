import { defaultDuelHighScores, defaultSoloHighScores } from '@app/constants/configuration.constants';
import { DuelHighScore } from '@app/model/database/duel-highscore.entity';
import { ExistingGame } from '@app/model/database/game.entity';
import { SoloHighScore } from '@app/model/database/solo-highscore.entity';
import { NewGameInfo } from '@app/model/schema/new-game-info';
import { PendingGame } from '@app/model/schema/pending-game';
import { TemporaryGame } from '@app/model/schema/temporary-game';
import { Difficulty } from '@common/model/difficulty';
import { defaultDifferences } from './differences';

export const defaultTemporaryGame = new TemporaryGame(3, Difficulty.Easy);
export const defaultPendingGame: PendingGame = {
    temporaryGame: defaultTemporaryGame,
    originalImageBase64: 'original',
    modifiedImageBase64: 'modified',
    differences: defaultDifferences,
};
export const defaultNewGameInfo: NewGameInfo = {
    name: 'mygame',
    differencesCount: 3,
    differencesFilename: 'differences.json',
    originalImageFilename: 'original.bmp',
    modifiedImageFilename: 'modified.bmp',
};
export const temporaryGameOneDifference = new TemporaryGame(0, Difficulty.Easy);
export const defaultGameId = 'abcdefabcdef1234567890aa';
export const defaultGame: ExistingGame = {
    ...defaultTemporaryGame,
    ...defaultNewGameInfo,
    _id: defaultGameId,
    soloHighScores: defaultSoloHighScores as SoloHighScore[],
    duelHighScores: defaultDuelHighScores as DuelHighScore[],
};

export const defaultGames: ExistingGame[] = [defaultGame, defaultGame, defaultGame];
