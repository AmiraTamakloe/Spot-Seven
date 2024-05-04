/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClassicWaitingRoom, TimeLimitedWaitingRoom } from '@app/interfaces/waiting-room/waiting-room.interface';
import { ClassicSession } from '@app/model/classes/game-sessions/classic-session/classic-session';
import { TimeLimitedSession } from '@app/model/classes/game-sessions/time-limited-session/time-limited-session';
import { Coordinate } from '@app/model/dto/coordinate.dto';
import { PlayerCreationInfo } from '@app/model/schema/game-session';
import { DifferencesService } from '@app/services/differences/differences.service';
import { GameConstants } from '@common/game-constants';
import { INIT, PENALTY, WIN } from '@common/game-default.constants';
import { GameMode } from '@common/game-mode';
import { defaultGames } from './game';
import { defaultEmptyWaitingRoom, defaultWaitingRoomWithOnePlayerInQueue } from './waiting-room';
import { GameService } from '@app/services/game/game.service';
import { ExistingGame } from '@common/model/game';
import { Game } from '@app/model/database/game.entity';
/* eslint-disable @typescript-eslint/no-magic-numbers */
export const differences = [[new Coordinate(1, 5)], [new Coordinate(2, 3)]];
export const firstDifference = new Set(['1,5', '2,3']);
export const secondDifference = new Set(['0,0']);
export const thirdDifference = new Set(['1,9']);

export const defaultFirstPlayer: PlayerCreationInfo = { playerId: 'abc', username: 'First User Name' };
export const defaultSecondPlayer: PlayerCreationInfo = { playerId: 'def', username: 'Second User Name' };

export const defaultDifferenceSet = [firstDifference, secondDifference, thirdDifference];

export const mockDifferenceService = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    loadDifferences: async (_: string) => {
        return Promise.resolve(differences);
    },
} as DifferencesService;

export const mockGameService = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    generateGameWithXDifferences: async (game: ExistingGame | Game, originalDifferences: Set<string>[], numberOfDifferences: number) => {
        return Promise.resolve();
    },
} as unknown as GameService;

export const DEFAULT_GAME_CONSTANTS: GameConstants = {
    initialTime: INIT,
    hintPenalty: PENALTY,
    differenceFoundBonus: WIN,
};

export const defaultSoloGameSession = new ClassicSession(
    mockDifferenceService,
    defaultEmptyWaitingRoom as ClassicWaitingRoom,
    DEFAULT_GAME_CONSTANTS,
);
export const defaultClassicGameSession = new ClassicSession(
    mockDifferenceService,
    defaultEmptyWaitingRoom as ClassicWaitingRoom,
    DEFAULT_GAME_CONSTANTS,
);

export const defaultDuoGameSession = new ClassicSession(
    mockDifferenceService,
    defaultWaitingRoomWithOnePlayerInQueue as ClassicWaitingRoom,
    DEFAULT_GAME_CONSTANTS,
);
export const defaultClassicDuoGameSession = defaultDuoGameSession;

export const defaultTimeLimitedCoopGameSession = new TimeLimitedSession(
    mockGameService,
    mockDifferenceService,
    defaultWaitingRoomWithOnePlayerInQueue as TimeLimitedWaitingRoom,
    defaultGames,
    DEFAULT_GAME_CONSTANTS,
    false,
);
defaultTimeLimitedCoopGameSession['timer'].stopTimer(false);

export const mockHistory = [
    {
        id: '123',
        gameStart: Date.now(),
        gameTime: 5,
        gameMode: GameMode.Classic,
        players: ['player'],
    },
    {
        id: '456',
        gameStart: Date.now(),
        gameTime: 5,
        gameMode: GameMode.ClassicTeam,
        players: ['player', 'player'],
        isWinner: 0,
        hasAbandonned: 1,
    },
    {
        id: '789',
        gameStart: Date.now(),
        gameTime: 5,
        gameMode: GameMode.TimeLimited,
        players: ['player', 'player'],
        isWinner: 0,
        hasAbandonned: 0,
    },
    {
        id: '012',
        gameStart: Date.now(),
        gameTime: 5,
        gameMode: GameMode.TimeLimitedImproved,
        players: ['player'],
        isWinner: 0,
        hasAbandonned: 0,
    },
];
