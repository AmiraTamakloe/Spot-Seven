/* eslint-disable @typescript-eslint/no-magic-numbers */
import { History } from '@app/model/database/game-history.entity';
import { GameMode } from '@common/game-mode';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Repository } from 'typeorm';
import { GameHistoryService } from './game-history.service';

describe('GameHistoryService', () => {
    let service: GameHistoryService;
    let historyRepositoryMock: SinonStubbedInstance<Repository<History>>;

    beforeEach(async () => {
        historyRepositoryMock = createStubInstance(Repository<History>) as SinonStubbedInstance<Repository<History>>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameHistoryService,
                {
                    provide: getRepositoryToken(History),
                    useValue: historyRepositoryMock,
                },
            ],
        }).compile();

        service = module.get<GameHistoryService>(GameHistoryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getHistory should get history', async () => {
        const findSpy = jest.spyOn(historyRepositoryMock, 'find');
        await service.getHistory();
        expect(findSpy).toHaveBeenCalled();
    });

    it('deleteHistory, should delete all histories', async () => {
        const clearSpy = jest.spyOn(historyRepositoryMock, 'clear');
        await service.deleteHistory();
        expect(clearSpy).toHaveBeenCalled();
    });

    it('createGameHistory should create a game history', async () => {
        const saveSpy = jest.spyOn(historyRepositoryMock, 'save');
        const history = {
            gameStart: Date.now(),
            gameTime: 20,
            gameMode: GameMode.Classic,
            players: ['tester'],
        };

        await service.createGameHistory(history);
        expect(saveSpy).toHaveBeenCalled();
    });
});
