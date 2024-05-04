/* eslint-disable @typescript-eslint/no-magic-numbers */
import { SocketAuthGuard } from '@app/authentication/ws-jwt-auth.guard';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { CreateTemporaryGameDto } from '@app/model/dto/game/create-temporary-game.dto';
import { defaultBitmap } from '@app/samples/bitmap';
import { defaultDifferences } from '@app/samples/differences';
import { defaultPendingGame } from '@app/samples/game';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { BitmapService } from '@app/services/bitmap/bitmap.service';
import { DifferencesService } from '@app/services/differences/differences.service';
import { GameService } from '@app/services/game/game.service';
import { Difficulty } from '@common/model/difficulty';
import { GameCreateEvent } from '@common/model/events/game-create.events';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server, Socket } from 'socket.io';
import { GameCreateGateway } from './game-create.gateway';

describe('GameCreateGateway', () => {
    let gateway: GameCreateGateway;
    let gameService: SinonStubbedInstance<GameService>;
    let bitmapService: SinonStubbedInstance<BitmapService>;
    let differencesService: SinonStubbedInstance<DifferencesService>;
    let socket: SinonStubbedInstance<Socket>;
    let serverSocket: SinonStubbedInstance<Server>;
    let socketAuthGuard: SinonStubbedInstance<SocketAuthGuard>;
    let authenticationService: SinonStubbedInstance<AuthenticationService>;

    beforeEach(async () => {
        gameService = createStubInstance<GameService>(GameService);
        bitmapService = createStubInstance<BitmapService>(BitmapService);
        differencesService = createStubInstance<DifferencesService>(DifferencesService);
        socket = createStubInstance<Socket>(Socket);
        Object.defineProperty(socket, 'id', { value: '123456' });
        serverSocket = createStubInstance<Server>(Server);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serverSocket.emit.returns(serverSocket as any);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameCreateGateway,
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
                    provide: SocketAuthGuard,
                    useValue: socketAuthGuard,
                },
                {
                    provide: AuthenticationService,
                    useValue: authenticationService,
                },
            ],
        }).compile();

        gateway = module.get<GameCreateGateway>(GameCreateGateway);
        gateway['server'] = serverSocket;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('createTemporaryGame() should create a new temporary game', async () => {
        bitmapService.decodeImages.resolves({ leftImage: defaultBitmap, rightImage: defaultBitmap });
        differencesService.findDifferences.returns(defaultDifferences);
        differencesService.computeDifficulty.returns(Difficulty.Easy);
        differencesService.getDifferencesImage.returns(defaultDifferences.flat());

        const createTemporaryGameDto = new CreateTemporaryGameDto('left', 'right', 3);

        expect(await gateway.createTemporaryGame(socket, createTemporaryGameDto)).toEqual({
            valid: true,
            differencesCount: 3,
            differencesImage: defaultDifferences.flat(),
        });
        expect(bitmapService.decodeImages.calledWith('left', 'right')).toBeTruthy();
        expect(differencesService.findDifferences.calledWith(defaultBitmap, defaultBitmap)).toBeTruthy();
        expect(differencesService.computeDifficulty.calledWith(defaultDifferences)).toBeTruthy();
        expect(differencesService.getDifferencesImage.calledWith(defaultDifferences)).toBeTruthy();
        expect(gameService.createTemporaryGame.calledOnce).toBeTruthy();
    });

    it('createTemporaryGame() should return an error if the difficulty is not valid', async () => {
        bitmapService.decodeImages.resolves({ leftImage: defaultBitmap, rightImage: defaultBitmap });
        differencesService.findDifferences.returns(defaultDifferences);
        differencesService.computeDifficulty.returns(Difficulty.Invalid);
        differencesService.getDifferencesImage.returns(defaultDifferences.flat());

        const createTemporaryGameDto = new CreateTemporaryGameDto('left', 'right', 3);

        expect(await gateway.createTemporaryGame(socket, createTemporaryGameDto)).toEqual({
            valid: false,
            differencesCount: defaultDifferences.length,
            differencesImage: defaultDifferences.flat(),
        });

        expect(gameService.createTemporaryGame.notCalled).toBeTruthy();
    });

    it('createGame() should create a new game', async () => {
        gameService.getTemporaryGame.returns(undefined);
        const createGameDto = new CreateGameDto("c'est ma nem");

        await expect(gateway.createGame(socket, createGameDto)).rejects.toThrow('No temporary game was created');
        expect(gameService.createGame.notCalled).toBeTruthy();
        expect(gameService.getTemporaryGame.calledWith(socket.id)).toBeTruthy();

        gameService.getTemporaryGame.returns(defaultPendingGame);
        expect(await gateway.createGame(socket, createGameDto)).toEqual('Game created');
        expect(gameService.createGame.calledWith(defaultPendingGame, createGameDto.name)).toBeTruthy();
        expect(gameService.deleteTemporaryGame.calledWith(socket.id)).toBeTruthy();
        expect(serverSocket.emit.calledWith(GameCreateEvent.GameWasCreated));
    });

    it('handleDisconnect() should delete the temporary game', () => {
        gateway.handleDisconnect(socket);
        expect(gameService.deleteTemporaryGame.calledWith(socket.id)).toBeTruthy();
    });
});
