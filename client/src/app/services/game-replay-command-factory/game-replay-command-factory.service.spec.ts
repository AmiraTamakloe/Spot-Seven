import { TestBed } from '@angular/core/testing';

import { GameReplayCommandFactoryService } from './game-replay-command-factory.service';

describe('GameReplayCommandFactoryService', () => {
    let service: GameReplayCommandFactoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameReplayCommandFactoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
