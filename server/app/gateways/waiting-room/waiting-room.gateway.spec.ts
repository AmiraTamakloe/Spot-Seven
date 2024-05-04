/* eslint-disable max-lines */
import { defaultWaitingRoomWithThreePlayersInQueue } from '@app/samples/waiting-room';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server, Socket } from 'socket.io';
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { SocketAuthGuard } from '@app/authentication/ws-jwt-auth.guard';
// import { ClassicWaitingRoom, WaitingRoom } from '@app/interfaces/waiting-room/waiting-room.interface';
// import { defaultGame } from '@app/samples/game';
// import { ClassicWaitingRoom, WaitingRoom } from '@app/interfaces/waiting-room/waiting-room.interface';
// import { PlayerData } from '@app/model/schema/game-session';
// import { defaultGame } from '@app/samples/game';
// import { defaultDuoGameSession, defaultFirstPlayer, defaultSecondPlayer } from '@app/samples/game-session';
import { player1 } from '@app/samples/player';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { GameService } from '@app/services/game/game.service';
import { HintService } from '@app/services/hints/hint.service';
import { MessageFormatterService } from '@app/services/message-formatter/message-formatter.service';
import { ReplayService } from '@app/services/replay/replay.service';
import { WaitingRoomService } from '@app/services/waiting-room/waiting-room.service';
// import { CancelGameResponse } from '@common/cancel-game-responses';
import { GameMode } from '@common/game-mode';
// import { GameSessionEvent } from '@common/model/events/game-session.events';
// import { GameSheetState } from '@common/model/game';
// import { SessionType } from '@common/model/guess-result';
// import { WaitingRoomStatus } from '@common/model/waiting-room-status';
// import { GameSessionEvent } from '@common/game-session.events';
// import { GameSheetState } from '@common/model/game';
// import { SessionType } from '@common/model/guess-result';
// import { WaitingRoomStatus } from '@common/model/waiting-room-status';
import { Test, TestingModule } from '@nestjs/testing';
import { Subject } from 'rxjs';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { WaitingRoomGateway } from './waiting-room.gateway';
import { ChatService } from '@app/services/chat/chat.service';

describe('WaitingRoomGateway', () => {
    const createMockSocket = (id: string): SinonStubbedInstance<Socket> => {
        socket = createStubInstance<Socket>(Socket);
        socket.to.returns(socket as any);
        socket.emit.returns(socket as any);
        Object.defineProperty(socket, 'id', { value: id, writable: true });
        Object.defineProperty(socket, 'rooms', { value: [id], writable: true });

        return socket;
    };

    const SOCKET_ID = player1.socketId;

    let gateway: WaitingRoomGateway;
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
    let replayService: SinonStubbedInstance<ReplayService>;
    let chatService: SinonStubbedInstance<ChatService>;

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
        replayService = createStubInstance<ReplayService>(ReplayService);
        chatService = createStubInstance<ChatService>(ChatService);
        serverSocket = createStubInstance<Server>(Server);
        serverSocket.to.returns(serverSocket as any);
        serverSocket.in.returns(serverSocket as any);
        serverSocket.emit.returns(serverSocket as any);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WaitingRoomGateway,
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
                    provide: ReplayService,
                    useValue: replayService,
                },
                {
                    provide: ChatService,
                    useValue: chatService,
                },
            ],
        }).compile();

        gateway = module.get<WaitingRoomGateway>(WaitingRoomGateway);
        gateway['server'] = serverSocket;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('startWaitingRoom should throw an exception if the player is already in a game', async () => {
        gameManagerService.isPlayerInGameSession.withArgs(SOCKET_ID).resolves(true);

        await expect(gateway.startWaitingRoom(socket, { gameId: 'noGame', username: player1.username, gameMode: GameMode.Classic })).rejects.toThrow(
            'A game is already in progress',
        );
    });

    // FIXME: this test should work but doesnt because we need to mock userService.getUser, but the mock doesnt work
    // it('startWaitingRoom should start a new coop game session when called with GameMode.TimeLimitedCoop', async () => {
    //     const createGameDto: CreateTimeLimitedGameSessionDto = {
    //         waitingRoomId: '',
    //         username: player1.username,
    //         gameMode: GameMode.TimeLimitedCoop,
    //     };

    //     waitingRoomService.addPlayer.withArgs(createGameDto, player1).resolves(true);
    //     const dto = new CreateTimeLimitedGameSessionDto(TIME_LIMITED_ID, player1.username, GameMode.TimeLimitedCoop);
    //     jest.spyOn(gateway['waitingRoomService'], 'getPlayerWaitingRoom').mockImplementation(() => {
    //         return defaultEmptyWaitingRoom;
    //     });

    //     await expect(gateway.startWaitingRoom(socket, dto)).resolves.toEqual(WaitingRoomStatus.Created);

    //     waitingRoomService.addPlayer.withArgs(createGameDto, player1).resolves(false);

    //     gameManagerService.createTimeLimitedCoopSession
    //         .withArgs(gateway.server, defaultWaitingRoomWithOnePlayerInQueue as TimeLimitedWaitingRoom)
    //         .resolves(defaultTimeLimitedCoopGameSession);

    //     jest.spyOn(gateway['waitingRoomService'], 'getPlayerWaitingRoom').mockImplementation(() => {
    //         return defaultWaitingRoomWithOnePlayerInQueue;
    //     });

    //     gateway['clients'] = new Map([
    //         [SOCKET_ID, socket],
    //         [player2.socketId, createMockSocket(player2.socketId)],
    //     ]);
    //     const result = await gateway.startWaitingRoom(socket, dto);

    //     expect(result).toEqual(WaitingRoomStatus.Joined);

    //     gateway['clients'] = new Map();

    //     expect(gateway.startWaitingRoom(socket, dto)).rejects.toThrow('Creator or Opponent socket not found');
    // });

    // it('rejectOpponent should inform the rejected player they have been rejected', () => {
    //     waitingRoomService.removePlayer.returns(false);
    //     waitingRoomService.getPlayerWaitingRoom.returns(defaultEmptyWaitingRoom);

    //     const rejectedPlayerId = player2.socketId;

    //     gateway.rejectOpponent(socket, { socketId: rejectedPlayerId });

    //     expect(serverSocket.to.calledWith(rejectedPlayerId)).toEqual(true);
    //     expect(serverSocket.emit.calledWith(GameSessionEvent.GameSessionCanceled, CancelGameResponse.CreatorRejected)).toEqual(true);
    //     expect(serverSocket.emit.calledWith(GameSessionEvent.NewOpponent)).toEqual(false);
    // });

    // it('rejectOpponent should inform the creator if the is a new opponent after the rejected one', () => {
    //     waitingRoomService.removePlayer.returns(false);
    //     const waitingRoom: WaitingRoom = {
    //         id: '123',
    //         gameMode: GameMode.Classic,
    //         sessionType: SessionType.Classic,
    //         creator: player1,
    //         waitingPlayers: [player3],
    //         game: defaultGame,
    //         joinState: WaitingRoomStatus.Joined,
    //     };
    //     waitingRoomService.getPlayerWaitingRoom.returns(waitingRoom);

    //     const rejectedPlayerId = player2.socketId;

    //     gateway.rejectOpponent(socket, { socketId: rejectedPlayerId });

    //     expect(serverSocket.to.calledWith(rejectedPlayerId)).toEqual(true);
    //     expect(serverSocket.emit.calledWith(GameSessionEvent.GameSessionCanceled, CancelGameResponse.CreatorRejected)).toEqual(true);
    //     expect(
    //         serverSocket.emit.calledWith(GameSessionEvent.NewOpponent, {
    //             socketId: player3.socketId,
    //             username: player3.username,
    //         }),
    //     ).toEqual(true);
    // });

    it('handleDisconnect() should remove references to the client', () => {
        waitingRoomService.getPlayerWaitingRoom.returns(defaultWaitingRoomWithThreePlayersInQueue);

        const socketRooms = new Set([socket.id]);

        const removePlayerSpy = jest.spyOn(gateway as any, 'removePlayer');
        const clientsSpy = jest.spyOn(gateway['clients'] as any, 'delete');

        Object.defineProperty(socket, 'rooms', { value: socketRooms });

        gateway.handleDisconnect(socket);
        expect(removePlayerSpy).toHaveBeenCalledWith(socket.id);
        expect(clientsSpy).toHaveBeenCalledWith(socket.id);
    });

    it('handleConnection should add the socket to the clients map', () => {
        const clientsSpy = jest.spyOn(gateway['clients'] as any, 'set');
        gateway.handleConnection(socket);
        expect(clientsSpy).toHaveBeenCalledWith(socket.id, socket);
    });

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
