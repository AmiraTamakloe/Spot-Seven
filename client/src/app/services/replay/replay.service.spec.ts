import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GameReplayCommandFactoryService } from '@app/services/game-replay-command-factory/game-replay-command-factory.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { ModalService } from '@app/services/modal/modal.service';
import { ReplayService } from './replay.service';

describe('ReplayService', () => {
    let service: ReplayService;
    let modalServiceSpy: jasmine.SpyObj<ModalService>;
    let gameStartServiceSpy: jasmine.SpyObj<GameStartService>;
    let commandFactorySpy: jasmine.SpyObj<GameReplayCommandFactoryService>;

    beforeEach(() => {
        modalServiceSpy = jasmine.createSpyObj('ModalService', ['createInformationModal']);
        gameStartServiceSpy = jasmine.createSpyObj('GameStartService', ['startReplay']);
        commandFactorySpy = jasmine.createSpyObj('GameReplayCommandFactoryService', ['transformReplayEventsToCommands']);

        TestBed.configureTestingModule({
            providers: [
                { provide: ModalService, useValue: modalServiceSpy },
                { provide: GameStartService, useValue: gameStartServiceSpy },
                { provide: GameReplayCommandFactoryService, useValue: commandFactorySpy },
            ],
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(ReplayService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
