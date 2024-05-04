/* eslint-disable max-lines */
// import { defaultWaitingRoomWithThreePlayersInQueue } from '@app/samples/waiting-room';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server, Socket } from 'socket.io';
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { SocketAuthGuard } from '@app/authentication/ws-jwt-auth.guard';
import { ReplayInterceptor } from '@app/interceptors/replay/replay.interceptor';
// import { ClassicWaitingRoom } from '@app/interfaces/waiting-room/waiting-room.interface';
// import { Coordinate } from '@app/model/dto/coordinate.dto';
// import { CreateClassicGameSessionDto } from '@app/model/dto/game-session/create-classic-game-session.dto';
// import { PlayerData } from '@app/model/schema/game-session';
// import { defaultGame } from '@app/samples/game';
// import {
//     defaultClassicGameSession,
//     defaultDuoGameSession,
//     defaultFirstPlayer,
//     defaultSecondPlayer,
//     defaultSoloGameSession,
//     defaultTimeLimitedCoopGameSession,
// } from '@app/samples/game-session';
// import { DEFAULT_SOLO_GUESS_FAILURE_RESULT, DEFAULT_SOLO_GUESS_SUCCESS_RESULT } from '@app/samples/guess-results';
import { player1 } from '@app/samples/player';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { GameService } from '@app/services/game/game.service';
import { HintService } from '@app/services/hints/hint.service';
import { MessageFormatterService } from '@app/services/message-formatter/message-formatter.service';
import { ReplayService } from '@app/services/replay/replay.service';
import { WaitingRoomService } from '@app/services/waiting-room/waiting-room.service';
// import { CancelGameResponse } from '@common/cancel-game-responses';
// import { ImageArea } from '@common/enums/image-area';
// import { GameMode } from '@common/game-mode';
// import { GameSessionEvent } from '@common/game-session.events';
// import { GameSheetState } from '@common/model/game';
// import { FirstSecondHint, HintType } from '@common/model/hints';
// import { Message } from '@common/model/message';
import { GameMode } from '@common/game-mode';
import { ObserverGameSession } from '@common/interfaces/observer-game-session.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { Subject } from 'rxjs';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { GameSessionGateway } from './game-session.gateway';

describe('GameSessionGateway', () => {
    const createMockSocket = (id: string): SinonStubbedInstance<Socket> => {
        socket = createStubInstance<Socket>(Socket);
        socket.to.returns(socket as any);
        socket.emit.returns(socket as any);
        Object.defineProperty(socket, 'id', { value: id, writable: true });
        Object.defineProperty(socket, 'rooms', { value: [id], writable: true });

        return socket;
    };

    const SOCKET_ID = player1.socketId;
    // const CREATE_CLASSIC_SOLO_DTO: CreateClassicGameSessionDto = {
    //     gameId: defaultGame._id.toString(),
    //     username: player1.username,
    //     gameMode: GameMode.Classic,
    // };

    let gateway: GameSessionGateway;
    let gameService: SinonStubbedInstance<GameService>;
    let socket: SinonStubbedInstance<Socket>;
    let serverSocket: SinonStubbedInstance<Server>;
    let messageFormatterService: SinonStubbedInstance<MessageFormatterService>;
    let waitingRoomService: SinonStubbedInstance<WaitingRoomService>;
    let gameManagerService: SinonStubbedInstance<GameManagerService>;
    let hintService: SinonStubbedInstance<HintService>;
    let gameServiceDeletedGameSubject: Subject<string>;
    let socketAuthGuard: SinonStubbedInstance<SocketAuthGuard>;
    let authenticationService: SinonStubbedInstance<AuthenticationService>;
    let replayInterceptor: SinonStubbedInstance<ReplayInterceptor>;

    beforeEach(async () => {
        gameService = createStubInstance<GameService>(GameService);
        gameServiceDeletedGameSubject = new Subject();
        gameService['gameDeletedSubject'] = gameServiceDeletedGameSubject;
        messageFormatterService = createStubInstance<MessageFormatterService>(MessageFormatterService);
        waitingRoomService = createStubInstance<WaitingRoomService>(WaitingRoomService);
        gameManagerService = createStubInstance<GameManagerService>(GameManagerService);
        hintService = createStubInstance<HintService>(HintService);
        socketAuthGuard = createStubInstance<SocketAuthGuard>(SocketAuthGuard);
        socket = createMockSocket(SOCKET_ID);
        authenticationService = createStubInstance<AuthenticationService>(AuthenticationService);
        replayInterceptor = createStubInstance(ReplayInterceptor);

        serverSocket = createStubInstance<Server>(Server);
        serverSocket.to.returns(serverSocket as any);
        serverSocket.in.returns(serverSocket as any);
        serverSocket.emit.returns(serverSocket as any);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameSessionGateway,
                {
                    provide: GameService,
                    useValue: gameService,
                },
                {
                    provide: MessageFormatterService,
                    useValue: messageFormatterService,
                },
                {
                    provide: WaitingRoomService,
                    useValue: waitingRoomService,
                },
                {
                    provide: GameManagerService,
                    useValue: gameManagerService,
                },
                {
                    provide: HintService,
                    useValue: hintService,
                },
                {
                    provide: SocketAuthGuard,
                    useValue: socketAuthGuard,
                },
                {
                    provide: AuthenticationService,
                    useValue: authenticationService,
                },
                {
                    provide: ReplayInterceptor,
                    useValue: replayInterceptor,
                },
                {
                    provide: ReplayService,
                    useValue: createStubInstance(ReplayService),
                },
            ],
        }).compile();

        gateway = module.get<GameSessionGateway>(GameSessionGateway);
        gateway['server'] = serverSocket;
        const observerSession: ObserverGameSession = {
            currentDifferencesFound: [],
            gameMode: GameMode.Classic,
            gameRoomId: '',
            gameName: '',
            observersRoomId: '',
            currentObservers: [],
        };
        jest.spyOn(gameManagerService, 'getObserversGameSession').mockReturnValue(observerSession);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    // it('startGameSession should throw an exception if the player is already in a game', async () => {
    //     gameManagerService.isPlayerInGameSession.withArgs(SOCKET_ID).resolves(true);

    //     await expect(
    //         gateway.startGameSession(socket, { gameId: 'noGame', username: player1.username, gameMode: GameMode.ClassicSolo }),
    //     ).rejects.toThrow('A game is already in progress');
    // });

    // it('startGameSession should start a new solo game session when called with GameMode.ClassicSolo or GameMode.TimeLimitedSolo', async () => {
    //     await gateway.startGameSession(socket, CREATE_CLASSIC_SOLO_DTO);
    //     expect(gameManagerService.createSoloSession.calledWith(gateway.server, socket, CREATE_CLASSIC_SOLO_DTO)).toEqual(true);
    // });

    // it('useHint() should return a new hint', () => {
    //     const coord = new Coordinate(0, 0);
    //     gameManagerService.getGameSession.withArgs([SOCKET_ID]).returns(defaultClassicGameSession);
    //     gameManagerService.getRemainingDifferencesArray.withArgs(defaultClassicGameSession).returns([[coord]]);
    //     hintService.getRandomCoordinate.withArgs([coord]).returns(coord);
    //     messageFormatterService.createUsedHintMessage.returns('message' as unknown as Message);

    //     const hint: FirstSecondHint = {
    //         zone: new Coordinate(0, 0),
    //         hintType: HintType.FirstSecond,
    //     };

    //     hintService.calculateZone.withArgs(3, coord).returns(hint);

    //     [...defaultClassicGameSession.players.values()][0].remainingHints = 3;

    //     expect(gateway.useHint(socket)).toEqual(hint);

    //     [...defaultClassicGameSession.players.values()][0].remainingHints = 1;

    //     expect(gateway.useHint(socket)).toEqual({
    //         position: coord,
    //         hintType: HintType.Third,
    //     });
    // });

    // it('useHint() should throw if the player has no more hints', () => {
    //     gameManagerService.getGameSession.withArgs([SOCKET_ID]).returns(defaultClassicGameSession);
    //     gameManagerService.getRemainingDifferencesArray.withArgs(defaultClassicGameSession).returns([[]]);
    //     hintService.getRandomCoordinate.withArgs([]).returns(new Coordinate(1, 2));

    //     [...defaultClassicGameSession.players.values()][0].remainingHints = 0;

    //     expect(() => {
    //         gateway.useHint(socket);
    //     }).toThrow('You have no hints left');
    // });

    // it('useHint() should throw if the player is not found', () => {
    //     const mySocket = createMockSocket(player3.socketId);
    //     gameManagerService.getGameSession.withArgs([player3.socketId]).returns(defaultClassicGameSession);
    //     gameManagerService.getRemainingDifferencesArray.withArgs(defaultClassicGameSession).returns([[]]);
    //     hintService.getRandomCoordinate.withArgs([]).returns(new Coordinate(1, 2));

    //     expect(() => {
    //         gateway.useHint(mySocket);
    //     }).toThrow('There is no playerData in this game');
    // });

    // it('remainingDifferences() should return the remaining differences', () => {
    //     const coordinates = [[new Coordinate(0, 0), new Coordinate(0, 1)]];
    //     gameManagerService.getPlayerGameSession.returns(defaultSoloGameSession);
    //     gameManagerService.getRemainingDifferencesArray.returns(coordinates);
    //     expect(gateway.remainingDifferences(socket)).toEqual(coordinates);
    // });

    // it('giveUp() should send EndGame event in classic mode', () => {
    //     const player: PlayerData = {
    //         username: defaultFirstPlayer.username,
    //         differencesFound: 0,
    //         remainingHints: 3,
    //     };
    //     gameManagerService.getPlayerGameSession.returns(defaultDuoGameSession);
    //     defaultDuoGameSession.players.set(defaultFirstPlayer.playerId, player);
    //     Object.defineProperty(socket, 'id', { value: defaultFirstPlayer.playerId });

    //     gateway.giveUp(socket);
    //     expect(socket.to.calledWith(defaultDuoGameSession.roomId)).toEqual(true);
    //     expect(socket.emit.calledWith(GameSessionEvent.EndGame)).toEqual(true);
    // });

    // it('giveUp() should cleanup game or send EndGame dependending on players left in time limited mode', () => {
    //     const player: PlayerData = {
    //         username: defaultFirstPlayer.username,
    //         differencesFound: 0,
    //         remainingHints: 3,
    //     };
    //     gameManagerService.getPlayerGameSession.returns(defaultTimeLimitedCoopGameSession);
    //     defaultTimeLimitedCoopGameSession.players = new Map();
    //     defaultTimeLimitedCoopGameSession.players.set(defaultFirstPlayer.playerId, player);
    //     Object.defineProperty(socket, 'id', { value: defaultFirstPlayer.playerId });
    //     // create spy on cleanup method of gateway
    //     const cleanupGameSpy = jest.spyOn<any, any>(gateway, 'cleanupGame');

    //     gateway.giveUp(socket);
    //     expect(cleanupGameSpy).toHaveBeenCalled();

    //     defaultTimeLimitedCoopGameSession.players.set(defaultSecondPlayer.playerId, player);

    //     gateway.giveUp(socket);

    //     expect(serverSocket.to.calledWith(defaultTimeLimitedCoopGameSession.roomId)).toEqual(true);
    //     expect(serverSocket.emit.calledWith(GameSessionEvent.EndGame, { isWinner: false, isForfeit: true })).toEqual(true);
    // });

    // it('giveUp() should throw if no game in progress', () => {
    //     gameManagerService.getPlayerGameSession.throws(new Error('No game in progress'));
    //     expect(() => gateway.giveUp(socket)).toThrow('No game in progress');
    // });

    // it('giveUp() should throw if the player is not found', () => {
    //     const mySocket = createMockSocket(player3.socketId);
    //     gameManagerService.getPlayerGameSession.returns(defaultDuoGameSession);
    //     expect(() => gateway.giveUp(mySocket)).toThrow('Player is not in game');
    // });

    // it('guessDifference() should return Success if difference clicked', async () => {
    //     gameManagerService.getPlayerGameSession.returns(defaultSoloGameSession);
    //     const manageClickSpy = jest
    //         .spyOn(defaultSoloGameSession, 'manageClick')
    //         .mockImplementation(async () => Promise.resolve(DEFAULT_SOLO_GUESS_SUCCESS_RESULT));

    //     expect(await gateway.guessDifference(socket, { imageArea: ImageArea.ORIGINAL, coordinate: { x: 0, y: 0 } })).toEqual(
    //         DEFAULT_SOLO_GUESS_SUCCESS_RESULT,
    //     );
    //     expect(manageClickSpy).toHaveBeenCalled();
    // });

    // it('guessDifference() should return Failure if no difference clicked', async () => {
    //     gameManagerService.getPlayerGameSession.returns(defaultSoloGameSession);
    //     const manageClickSpy = jest
    //         .spyOn(defaultSoloGameSession, 'manageClick')
    //         .mockImplementation(async () => Promise.resolve(DEFAULT_SOLO_GUESS_FAILURE_RESULT));
    //     expect(await gateway.guessDifference(socket, { imageArea: ImageArea.ORIGINAL, coordinate: new Coordinate(100, 100) })).toEqual(
    //         DEFAULT_SOLO_GUESS_FAILURE_RESULT,
    //     );
    //     expect(manageClickSpy).toHaveBeenCalled();
    // });

    // it('guessDifference() should call gameManager.manageEndGame if there is a winner in classic mode', async () => {
    //     gameManagerService.getPlayerGameSession.returns(defaultDuoGameSession);
    //     const manageClickSpy = jest
    //         .spyOn(defaultDuoGameSession, 'manageClick')
    //         .mockImplementation(async () => Promise.resolve(DEFAULT_SOLO_GUESS_SUCCESS_RESULT));
    //     jest.spyOn(defaultDuoGameSession, 'getWinner').mockImplementation(() => defaultFirstPlayer.playerId);
    //     gateway.guessDifference(socket, { imageArea: ImageArea.MODIFIED, coordinate: new Coordinate(1, 5) });
    //     expect(manageClickSpy).toHaveBeenCalled();
    // });

    // it('handleDisconnect() should remove references to the client', () => {
    //     waitingRoomService.getPlayerWaitingRoom.returns(defaultWaitingRoomWithThreePlayersInQueue);

    //     const socketRooms = new Set([socket.id]);

    //     const removePlayerSpy = jest.spyOn(gateway as any, 'removePlayer');
    //     const clientsSpy = jest.spyOn(gateway['clients'] as any, 'delete');

    //     Object.defineProperty(socket, 'rooms', { value: socketRooms });

    //     gateway.handleDisconnect(socket);
    //     expect(gameManagerService.deleteGameSession.calledOnceWith([socket.id])).toEqual(true);
    //     expect(removePlayerSpy).toHaveBeenCalledWith(socket.id);
    //     expect(clientsSpy).toHaveBeenCalledWith(socket.id);
    // });

    // it('handleConnection should add the socket to the clients map', () => {
    //     const clientsSpy = jest.spyOn(gateway['clients'] as any, 'set');
    //     gateway.handleConnection(socket);
    //     expect(clientsSpy).toHaveBeenCalledWith(socket.id, socket);
    // });

    // it('cleanupGame should delete the game session and remove the players from the game session room', () => {
    //     const opponentSocket = createMockSocket(defaultSecondPlayer.playerId);
    //     const playerSocket = createMockSocket(defaultFirstPlayer.playerId);
    //     gameManagerService.deleteGameSession.returns(undefined);
    //     const firstPlayer: PlayerData = {
    //         username: defaultFirstPlayer.username,
    //         differencesFound: 0,
    //         remainingHints: 3,
    //     };
    //     const secondPlayer: PlayerData = {
    //         username: defaultSecondPlayer.username,
    //         differencesFound: 0,
    //         remainingHints: 3,
    //     };

    //     defaultDuoGameSession.players = new Map();
    //     defaultDuoGameSession.players.set(opponentSocket.id, secondPlayer);
    //     defaultDuoGameSession.players.set(playerSocket.id, firstPlayer);
    //     gateway['clients'].clear();
    //     gateway['clients'].set(opponentSocket.id, playerSocket);
    //     gateway['clients'].set(playerSocket.id, opponentSocket);

    //     gateway['cleanupGame'](defaultDuoGameSession);

    //     expect(gameManagerService.deleteGameSession.calledWith([defaultDuoGameSession.roomId])).toEqual(true);
    //     expect(opponentSocket.leave.calledWith(defaultDuoGameSession.roomId)).toEqual(true);
    // });

    // it('removePlayer should call inform the waiting players if the waiting room was deleted', () => {
    //     waitingRoomService.getPlayerWaitingRoom.returns(defaultWaitingRoomWithThreePlayersInQueue);
    //     waitingRoomService.removePlayer.withArgs(defaultWaitingRoomWithThreePlayersInQueue.creator.socketId).returns(true);

    //     gateway['removePlayer'](defaultWaitingRoomWithThreePlayersInQueue.creator.socketId);

    //     expect(waitingRoomService.removePlayer.calledWith(defaultWaitingRoomWithThreePlayersInQueue.creator.socketId)).toEqual(true);
    //     expect(serverSocket.emit.calledWith(GameSessionEvent.GameSessionCanceled, CancelGameResponse.CreatorCanceled)).toEqual(true);
    //     expect(
    //         serverSocket.emit.calledWith(GameSessionEvent.GameStateChanged, {
    //             _id: (defaultWaitingRoomWithThreePlayersInQueue as ClassicWaitingRoom).game._id,
    //             sheetState: GameSheetState.Creatable,
    //         }),
    //     ).toEqual(true);
    //     expect(serverSocket.emit.callCount).toEqual(defaultWaitingRoomWithThreePlayersInQueue.waitingPlayers.length + 1);
    // });
});
