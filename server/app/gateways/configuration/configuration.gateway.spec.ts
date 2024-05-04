/* eslint-disable @typescript-eslint/no-explicit-any */
import { SocketAuthGuard } from '@app/authentication/ws-jwt-auth.guard';
import { defaultDuelHighScores, defaultSoloHighScores } from '@app/constants/configuration.constants';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { GameService } from '@app/services/game/game.service';
import { ConfigurationEvent } from '@common/model/events/configuration.events';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server } from 'socket.io';
import { ConfigurationGateway } from './configuration.gateway';

describe('ConfigurationGateway', () => {
    let gateway: ConfigurationGateway;
    let gameServiceSpy: SinonStubbedInstance<GameService>;
    let serverSocket: SinonStubbedInstance<Server>;
    let socketAuthGuard: SinonStubbedInstance<SocketAuthGuard>;
    let authenticationService: SinonStubbedInstance<AuthenticationService>;

    beforeEach(async () => {
        serverSocket = createStubInstance<Server>(Server);
        serverSocket.emit.returns(serverSocket as any);

        gameServiceSpy = createStubInstance<GameService>(GameService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ConfigurationGateway,
                { provide: GameService, useValue: gameServiceSpy },
                {
                    provide: SocketAuthGuard,
                    useValue: socketAuthGuard,
                },
                { provide: AuthenticationService, useValue: authenticationService },
            ],
        }).compile();

        gateway = module.get<ConfigurationGateway>(ConfigurationGateway);
        gateway['server'] = serverSocket;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('reinitializeScore should reinitialize the scores to the default values', async () => {
        const gameId = '123456';
        await gateway.reinitializeScore({ gameId });
        expect(gameServiceSpy.updateGame.calledWith(gameId, false, defaultSoloHighScores)).toBe(true);
        expect(gameServiceSpy.updateGame.calledWith(gameId, true, defaultDuelHighScores)).toBe(true);
        expect(serverSocket.emit.calledWith(ConfigurationEvent.ReinitializeWasDone)).toBe(true);
    });

    it('reinitializeScore should reinitialize the scores to the default values', async () => {
        const games = [{ _id: '123456' }, { _id: '09876' }] as any;
        gameServiceSpy.getGames.resolves(games);

        await gateway.reinitializeAllScore();

        for (const game of games) {
            expect(gameServiceSpy.updateGame.calledWith(game._id, false, defaultSoloHighScores)).toBe(true);
            expect(gameServiceSpy.updateGame.calledWith(game._id, true, defaultDuelHighScores)).toBe(true);
        }

        expect(serverSocket.emit.calledWith(ConfigurationEvent.ReinitializeWasDone)).toBe(true);
    });
});
