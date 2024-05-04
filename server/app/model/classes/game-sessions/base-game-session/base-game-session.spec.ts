/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-unused-vars */
import { ClassicWaitingRoom } from '@app/interfaces/waiting-room/waiting-room.interface';
import { Coordinate } from '@app/model/dto/coordinate.dto';
import { PlayerData } from '@app/model/schema/game-session';
import { defaultGame } from '@app/samples/game';
import { DEFAULT_GAME_CONSTANTS } from '@app/samples/game-session';
import { defaultWaitingRoomWithOnePlayerInQueue } from '@app/samples/waiting-room';
import { DifferencesService } from '@app/services/differences/differences.service';
import { GuessResult } from '@common/model/guess-result';
import { BaseGameSession } from './base-game-session';

export class BaseGameSessionStub extends BaseGameSession {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getWinner(playerId: string): string | null {
        throw new Error('Method not implemented.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async manageClick(coord: Coordinate, playerId: string): Promise<GuessResult> {
        throw new Error('Method not implemented.');
    }
    useHintMalus(): void {
        throw new Error('Method not implemented.');
    }
}

describe('BaseGameSession', () => {
    const differences = [[new Coordinate(1, 5), new Coordinate(2, 3)]];

    let baseGameSession: BaseGameSessionStub;
    const mockDifferenceService = {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        loadDifferences: async (_: string) => {
            return Promise.resolve(differences);
        },
    } as DifferencesService;

    beforeEach(() => {
        baseGameSession = new BaseGameSessionStub(mockDifferenceService, defaultWaitingRoomWithOnePlayerInQueue, DEFAULT_GAME_CONSTANTS);
        baseGameSession.game = defaultGame;
    });

    it('should be defined', () => {
        expect(baseGameSession).toBeDefined();
    });

    it('createRoomId() should return an id with the correct length', () => {
        const size = 20;
        expect(baseGameSession.createRoomId(size).length).toEqual(size);
    });

    it('addPlayer() from a waiting room should add players from waiting room', () => {
        baseGameSession['players'] = new Map<string, PlayerData>();

        const waitingRoom = {
            creator: { socketId: 'awuodaiowdbn', username: 'yes', differencesFound: 0, remainingHints: 3 },
            waitingPlayers: [{ socketId: '234ob', username: 'no', differencesFound: 0, remainingHints: 3 }],
        } as any as ClassicWaitingRoom;

        baseGameSession['addPlayers'](waitingRoom);
        expect(baseGameSession.players.keys()).toContain(waitingRoom.creator.socketId);
        expect(baseGameSession.players.keys()).toContain(waitingRoom.waitingPlayers[0].socketId);
    });
});
