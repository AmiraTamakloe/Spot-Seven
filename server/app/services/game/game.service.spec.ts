import { Game } from '@app/model/database/game.entity';
import { defaultGame, defaultGames, defaultPendingGame } from '@app/samples/game';
import { BitmapService } from '@app/services/bitmap/bitmap.service';
import { DifferencesService } from '@app/services/differences/differences.service';
import { HighScoreService } from '@app/services/high-score/high-score.service';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Repository } from 'typeorm';
import { GameService } from './game.service';
import { FileService } from '@app/services/file/file.service';

describe('GameService', () => {
    let service: GameService;
    let gameRepoMock: SinonStubbedInstance<Repository<Game>>;
    let bitmapService: SinonStubbedInstance<BitmapService>;
    let differencesService: SinonStubbedInstance<DifferencesService>;
    let highScoreService: SinonStubbedInstance<HighScoreService>;
    let fileService: SinonStubbedInstance<FileService>;

    beforeEach(async () => {
        bitmapService = createStubInstance(BitmapService);
        differencesService = createStubInstance(DifferencesService);
        gameRepoMock = createStubInstance(Repository<Game>) as SinonStubbedInstance<Repository<Game>>;
        highScoreService = createStubInstance(HighScoreService);
        fileService = createStubInstance(FileService);

        const module = await Test.createTestingModule({
            providers: [
                GameService,
                { provide: BitmapService, useValue: bitmapService },
                { provide: DifferencesService, useValue: differencesService },
                { provide: getRepositoryToken(Game), useValue: gameRepoMock },
                { provide: HighScoreService, useValue: highScoreService },
                { provide: FileService, useValue: fileService },
            ],
        }).compile();

        service = module.get<GameService>(GameService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(gameRepoMock).toBeDefined();
    });

    it('getTemporaryGame() should return a temporary game by id', async () => {
        service['pendingGames'].set('1234', defaultPendingGame);
        expect(service.getTemporaryGame('1234')).toEqual(defaultPendingGame);
    });

    it('getTemporaryGame() should return undefined if the temporary game does not exist', async () => {
        expect(service.getTemporaryGame('5678')).toBe(undefined);
    });

    it('createTemporaryGame() should create a new temporary game', async () => {
        service.createTemporaryGame('1234', defaultPendingGame);
        expect(service['pendingGames'].get('1234')).toEqual(defaultPendingGame);
    });

    it('deleteTemporaryGame() should delete a temporary game', async () => {
        service['pendingGames'].set('1234', defaultPendingGame);
        service.deleteTemporaryGame('1234');
        expect(service['pendingGames'].get('1234')).toBe(undefined);
    });

    it('getGames() should return all games', async () => {
        gameRepoMock.find.resolves(defaultGames);

        expect((await service.getGames()).length).toEqual(3);
    });

    it('createGame() should create a new game', async () => {
        const createSpy = jest.spyOn(gameRepoMock, 'create');
        const saveSpy = jest.spyOn(gameRepoMock, 'save');

        bitmapService.saveImage.resolves('1234.bmp');
        differencesService.saveDifferences.resolves('1234.json');

        await service.createGame(defaultPendingGame, 'thisgame');

        expect(createSpy).toHaveBeenCalled();
        expect(saveSpy).toBeCalled();
        expect(bitmapService.saveImage.calledWith(defaultPendingGame.originalImageBase64)).toBe(true);
        expect(bitmapService.saveImage.calledWith(defaultPendingGame.modifiedImageBase64)).toBe(true);
        expect(differencesService.saveDifferences.calledWith(defaultPendingGame.differences)).toBe(true);
    });

    it('getGame() should return a game by id', async () => {
        gameRepoMock.findOne.resolves(defaultGame);
        expect((await service.getGame(defaultGame._id))?._id).toEqual(defaultGame._id);
    });

    it('getGame() should return undefined if game does not exist', async () => {
        expect(await service.getGame('012345678901234567891234')).toBe(undefined);
    });

    it('deleteGame() should delete the game', async () => {
        const mockBuilder = {
            delete: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            execute: jest.fn().mockImplementation(() => null),
        };
        const getGameSpy = jest.spyOn(service, 'getGame').mockImplementation(async () => defaultGame);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryBuilderSpy = jest.spyOn(gameRepoMock, 'createQueryBuilder').mockReturnValue(mockBuilder as unknown as any);

        await service.deleteGame(defaultGame._id);

        expect(getGameSpy).toBeCalledWith(defaultGame._id);
        expect(queryBuilderSpy).toBeCalled();
    });

    it('deleteAllGames() should delete all the games', async () => {
        const deleteSpy = jest.spyOn(gameRepoMock, 'delete');

        await service.deleteAllGames();
        expect(deleteSpy).toBeCalledWith({});
    });

    it('deleteGame() should throw an error if game does not exist', async () => {
        const getGameSpy = jest.spyOn(service, 'getGame').mockImplementation(async () => null);

        await expect(service.deleteGame('012345678901234567891234')).rejects.toThrow();
        expect(getGameSpy).toBeCalledWith('012345678901234567891234');
    });
});
