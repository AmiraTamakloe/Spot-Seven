import { defaultGames } from '@app/samples/game';
import { BitmapService } from '@app/services/bitmap/bitmap.service';
import { DifferencesService } from '@app/services/differences/differences.service';
import { GameService } from '@app/services/game/game.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { GameController } from './game.controller';
import { AccessAuthGuard } from '@app/authentication/access.guard';
import { AuthenticationService } from '@app/services/authentication/authentication.service';

describe('GameController', () => {
    let controller: GameController;
    let gameService: SinonStubbedInstance<GameService>;
    let bitmapService: SinonStubbedInstance<BitmapService>;
    let differencesService: SinonStubbedInstance<DifferencesService>;
    let accessAuthGuard: SinonStubbedInstance<AccessAuthGuard>;
    let authenticationService: SinonStubbedInstance<AuthenticationService>;

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        bitmapService = createStubInstance(BitmapService);
        differencesService = createStubInstance(DifferencesService);

        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [
                {
                    provide: GameService,
                    useValue: gameService,
                },
                {
                    provide: BitmapService,
                    useValue: bitmapService,
                },
                {
                    provide: DifferencesService,
                    useValue: differencesService,
                },
                {
                    provide: AccessAuthGuard,
                    useValue: accessAuthGuard,
                },
                {
                    provide: AuthenticationService,
                    useValue: authenticationService,
                },
            ],
        }).compile();

        controller = module.get<GameController>(GameController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('getGames() should return games', async () => {
        const games = defaultGames;
        gameService.getGames.resolves(games);

        expect(await controller.getGames()).toEqual(games);
    });

    it('deleteGame() should delete game', async () => {
        const gameServiceSpy = jest.spyOn(gameService, 'deleteGame');
        const gameId = 'hello';
        await controller.deleteGame(gameId);
        expect(gameServiceSpy).toHaveBeenCalledWith(gameId);
    });

    it('should delete all games and return no content', async () => {
        const gameServiceSpy = jest.spyOn(gameService, 'deleteAllGames');
        await controller.deleteAllGame();
        expect(gameServiceSpy).toHaveBeenCalled();
    });
});
