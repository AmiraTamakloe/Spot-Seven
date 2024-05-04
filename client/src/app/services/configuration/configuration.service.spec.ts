/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';

import { GameSelectionService } from '@app/services/game-selection/game-selection.service';
import { SocketService } from '@app/services/socket/socket.service';
import { ConfigurationEvent } from '@common/model/events/configuration.events';
import { ConfigurationService } from './configuration.service';

describe('ConfigurationService', () => {
    let service: ConfigurationService;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let gameSelectionServiceSpy: jasmine.SpyObj<GameSelectionService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on', 'send']);
        gameSelectionServiceSpy = jasmine.createSpyObj('GameSelectionService', ['fetchGames']);

        TestBed.configureTestingModule({
            providers: [
                ConfigurationService,
                {
                    provide: SocketService,
                    useValue: socketServiceSpy,
                },
                {
                    provide: GameSelectionService,
                    useValue: gameSelectionServiceSpy,
                },
            ],
        });

        socketServiceSpy.on.and.callFake(((event: ConfigurationEvent, callback: () => void) => {
            if (event === ConfigurationEvent.ReinitializeWasDone) {
                callback();
            }
        }) as any);

        service = TestBed.inject(ConfigurationService);

        expect(gameSelectionServiceSpy.fetchGames).toHaveBeenCalled();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('reinitializeScores() should tell socketService to reset scores', () => {
        service.reinitializeScores('gameId');
        expect(socketServiceSpy.send).toHaveBeenCalledWith(ConfigurationEvent.ReinitializeScores, { gameId: 'gameId' });
    });

    it('reinitializeAllScores() should tell socketService to reset all scores', () => {
        service.reinitializeAllScores();
        expect(socketServiceSpy.send).toHaveBeenCalledWith(ConfigurationEvent.ReinitializeAllScores);
    });
});
