/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-magic-numbers */
// import { TimerEnd } from '@app/interfaces/timer-end/timer-end.interface';
// import { ClassicWaitingRoom, TimeLimitedWaitingRoom } from '@app/interfaces/waiting-room/waiting-room.interface';
// import { ClassicSession } from '@app/model/classes/game-sessions/classic-session/classic-session';
// import { TimeLimitedSession } from '@app/model/classes/game-sessions/time-limited-session/time-limited-session';
// import { CreateClassicGameSessionDto } from '@app/model/dto/game-session/create-classic-game-session.dto';
// import { CreateTimeLimitedGameSessionDto } from '@app/model/dto/game-session/create-time-limited-game-session.dto';
// import { GameSession, PlayerData } from '@app/model/schema/game-session';
// import { defaultDifferences } from '@app/samples/differences';
// import { defaultGame, defaultGames } from '@app/samples/game';
// import {
//     DEFAULT_GAME_CONSTANTS,
//     desfaultClassicGameSession,
//     defaultDifferenceSet,
//     defaultDuoGameSession,
//     defaultTimeLimitedCoopGameSession,
//     mockDifferenceService,
// } from '@app/samples/game-session';
// import { player1 } from '@app/samples/player';
// import { defaultEmptyWaitingRoom } from '@app/samples/waiting-room';
import { DifferencesService } from '@app/services/differences/differences.service';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameService } from '@app/services/game/game.service';
import { MessageFormatterService } from '@app/services/message-formatter/message-formatter.service';
import { ReplayService } from '@app/services/replay/replay.service';
import { WaitingRoomService } from '@app/services/waiting-room/waiting-room.service';
import { GameMode } from '@common/game-mode';
// import { GameSessionEvent } from '@common/model/events/game-session.events';
// import { ExistingGame, GameSheetState } from '@common/model/game';
// import { GameInfo } from '@common/model/game-info';
// import { Message, Position } from '@common/model/message';
// import { WaitingRoomStatus } from '@common/model/waiting-room-status';
// import { GameMode } from '@common/game-mode';
// import { GameSessionEvent } from '@common/game-session.events';
// import { ExistingGame, GameSheetState } from '@common/model/game';
// import { GameInfo } from '@common/model/game-info';
// import { Message, Position } from '@common/model/message';
// import { WaitingRoomStatus } from '@common/model/waiting-room-status';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
// import { Server, Socket } from 'socket.io';
import { ChatService } from '@app/services/chat/chat.service';
import { StatisticService } from '@app/services/statistics/statistic.service';
import { GameManagerService } from './game-manager.service';

describe('GameManagerService', () => {
    let service: GameManagerService;
    let gameService: SinonStubbedInstance<GameService>;
    let differenceService: SinonStubbedInstance<DifferencesService>;
    let messageFormatterService: SinonStubbedInstance<MessageFormatterService>;
    let gameConstantsService: SinonStubbedInstance<GameConstantsService>;
    let waitingRoomService: SinonStubbedInstance<WaitingRoomService>;
    let statisticService: SinonStubbedInstance<StatisticService>;
    let replayService: SinonStubbedInstance<ReplayService>;
    // let mockServer: Server;
    // let mockSocket: Socket;
    let gameHistoryService: GameHistoryService;
    let chatService: SinonStubbedInstance<ChatService>;

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        differenceService = createStubInstance(DifferencesService);
        messageFormatterService = createStubInstance(MessageFormatterService);
        gameConstantsService = createStubInstance(GameConstantsService);
        waitingRoomService = createStubInstance(WaitingRoomService);
        gameHistoryService = createStubInstance(GameHistoryService);
        replayService = createStubInstance(ReplayService);
        statisticService = createStubInstance(StatisticService);
        chatService = createStubInstance(ChatService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameManagerService,
                {
                    provide: DifferencesService,
                    useValue: differenceService,
                },
                {
                    provide: GameService,
                    useValue: gameService,
                },
                {
                    provide: MessageFormatterService,
                    useValue: messageFormatterService,
                },
                {
                    provide: GameConstantsService,
                    useValue: gameConstantsService,
                },
                {
                    provide: WaitingRoomService,
                    useValue: waitingRoomService,
                },
                {
                    provide: GameHistoryService,
                    useValue: gameHistoryService,
                },
                {
                    provide: ReplayService,
                    useValue: replayService,
                },
                {
                    provide: StatisticService,
                    useValue: statisticService,
                },
                {
                    provide: ChatService,
                    useValue: chatService,
                },
            ],
        }).compile();

        // mockServer = {
        //     to: jest.fn().mockReturnThis(),
        //     emit: jest.fn(),
        // } as unknown as Server;
        // mockSocket = {
        //     id: 'player1',
        //     join: jest.fn(),
        //     to: jest.fn().mockReturnThis(),
        //     emit: jest.fn(),
        // } as unknown as Socket;

        service = module.get<GameManagerService>(GameManagerService);

        jest.spyOn(service, 'getObserversGameSession').mockReturnValue({
            gameRoomId: '123',
            observersRoomId: 'observers:123',
            gameName: 'circles',
            gameMode: GameMode.Classic,
            currentObservers: [],
            currentDifferencesFound: [],
        });
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // it('setPlayerGameSession() should set the player session', () => {
    //     service.setPlayerGameSession('player1', 'game1' as unknown as GameSession);
    //     expect(service['socketIdToGameSession'].get('player1')).toEqual('game1');
    // });

    // it('isPlayerInGameSession() should return true if the player is in a game session', () => {
    //     service['socketIdToGameSession'].set('player1', 'game1' as unknown as GameSession);
    //     expect(service.isPlayerInGameSession('player1')).toEqual(true);
    //     expect(service.isPlayerInGameSession('player2')).toEqual(false);
    // });

    // it('deletePlayerGameSession() should delete the player session', () => {
    //     const origPlayer1 = defaultDuoGameSession.players.get(player1.socketId)!;
    //     service['socketIdToGameSession'].set(player1.socketId, defaultDuoGameSession);
    //     service.deletePlayerGameSession(player1.socketId);
    //     expect(service['socketIdToGameSession'].get(player1.socketId)).toBeUndefined();
    //     expect(defaultDuoGameSession.players.get(player1.socketId)).toBeUndefined();

    //     defaultDuoGameSession.players.set(player1.socketId, origPlayer1);
    // });

    // it('deletePlayerGameSession() should do nothing if the gameSession was not found', () => {
    //     service.deletePlayerGameSession('player1');
    //     expect(service['socketIdToGameSession'].get('player1')).toBeUndefined();
    // });

    // it('getPlayerGameSession() should return the player session or throw', () => {
    //     service['socketIdToGameSession'].set('player1', 'game1' as unknown as GameSession);
    //     expect(service.getPlayerGameSession('player1')).toEqual('game1');

    //     expect(() => service.getPlayerGameSession('player2')).toThrow();
    // });

    // it('getGameSession() should return the game session or throw', () => {
    //     service['roomIdToGameSession'].set('game1', 'game111' as unknown as GameSession);
    //     expect(service.getGameSession(['thing', 'game1'])).toEqual('game111');

    //     expect(() => service.getGameSession(['thing', 'game2'])).toThrow();
    // });

    // it('deleteGameSession() should delete the game session', () => {
    //     const deletePlayerGameSessionSpy = jest.spyOn(service, 'deletePlayerGameSession');

    //     service['roomIdToGameSession'].set('game1', 'game111' as unknown as GameSession);
    //     service.deleteGameSession(['thing', 'game1']);
    //     expect(service['roomIdToGameSession'].get('game1')).toBeUndefined();

    //     expect(deletePlayerGameSessionSpy).toHaveBeenCalledTimes(2);
    // });

    // it('createClassicSession() should create a new game session', async () => {
    //     gameConstantsService.getAll.resolves(DEFAULT_GAME_CONSTANTS);
    //     differenceService.loadDifferences.resolves(defaultDifferences);
    //     const result = await service.createClassicSession(defaultEmptyWaitingRoom as ClassicWaitingRoom);
    //     expect(result).toBeInstanceOf(ClassicSession);
    // });

    // it('createTimeLimitedSession() should create a new game session', async () => {
    //     gameConstantsService.getAll.resolves(DEFAULT_GAME_CONSTANTS);
    //     gameService.getGames.resolves(defaultGames);
    //     gameService.generateGameWithXDifferences.resolves({ newGame: defaultGame, differencesKeptIndexes: [0] });
    //     differenceService.loadDifferences.resolves(defaultDifferences);
    //     jest.spyOn(service, 'createGameHistory').mockImplementation();
    //     jest.spyOn(TimeLimitedSession.prototype, 'getRandomGame').mockResolvedValue(defaultGame);
    //     const result = await service.createTimeLimitedSession(defaultEmptyWaitingRoom as TimeLimitedWaitingRoom);
    //     expect(result).toBeInstanceOf(TimeLimitedSession);
    //     result['timer'].stopTimer(false);
    // });

    // it('manageClassicEndGame() should send endGame event', async () => {
    //     mockServer = {
    //         to: jest.fn().mockReturnThis(),
    //         emit: jest.fn(),
    //     } as unknown as Server;

    //     const gameSession = new ClassicSession(mockDifferenceService, defaultEmptyWaitingRoom as ClassicWaitingRoom, DEFAULT_GAME_CONSTANTS);
    //     gameSession.startedTime = 0;
    //     jest.spyOn(gameHistoryService, 'createGameHistory').mockImplementation();
    //     jest.spyOn(service, 'createGameHistory').mockImplementation();

    //     const firstPlayerId = [...gameSession.players.keys()][0];

    //     await service.manageClassicEndGame(gameSession, firstPlayerId, mockServer as unknown as Server);

    //     expect(mockServer.to).toHaveBeenCalledWith(firstPlayerId);
    //     expect(mockServer.emit).toHaveBeenCalledWith(GameSessionEvent.EndGame, {
    //         isWinner: true,
    //         isForfeit: false,
    //         recordBeaten: undefined,
    //     });
    // });

    // it('manageEndGame() should save score if player arrived first', async () => {
    //     const gameSession = new ClassicSession(mockDifferenceService, defaultEmptyWaitingRoom as ClassicWaitingRoom, DEFAULT_GAME_CONSTANTS);
    //     gameSession.startedTime = 500;

    //     jest.spyOn(Date, 'now').mockReturnValue(501);

    //     const firstPlayerId = [...gameSession.players.keys()][0];

    //     messageFormatterService.createRecordBeatenMessage.returns('lolilol' as unknown as Message);
    //     jest.spyOn(gameHistoryService, 'createGameHistory').mockImplementation();
    //     jest.spyOn(service, 'createGameHistory').mockImplementation();
    //     await service.manageClassicEndGame(gameSession, firstPlayerId, mockServer as unknown as Server);

    //     expect(mockServer.emit).toHaveBeenCalledWith(GameSessionEvent.Message, 'lolilol');

    //     expect(mockServer.to).toHaveBeenCalledWith(firstPlayerId);
    //     expect(mockServer.emit).toHaveBeenCalledWith(GameSessionEvent.EndGame, {
    //         isWinner: true,
    //         isForfeit: false,
    //         recordBeaten: Position.First,
    //     });
    //     expect(gameService.updateGame.called).toEqual(true);
    // });

    // it('manageEndGame() should throw if the player is not in the game session', async () => {
    //     await expect(service.manageClassicEndGame(defaultDuoGameSession, 'player3', mockServer as unknown as Server)).rejects.toThrow();
    // });

    // it('generateGameInfo() should generate a gameInfo from the game session', () => {
    //     const gameSession = {
    //         game: 'game' as unknown as ExistingGame,
    //         players: new Map([
    //             ['player1', { username: 'player1' } as PlayerData],
    //             ['player2', { username: 'player2' } as PlayerData],
    //         ]),
    //     } as GameSession;
    //     const gameInfo = service.generateGameInfo(gameSession);
    //     expect(gameInfo).toMatchObject({
    //         game: 'game',
    //         usernames: ['player1', 'player2'],
    //     });
    // });

    // it('getRemainingDifferencesArray', () => {
    //     const gameSession = {
    //         differences: defaultDifferenceSet,
    //     } as GameSession;
    //     const remainingDifferences = service.getRemainingDifferencesArray(gameSession);
    //     expect(remainingDifferences).toEqual(defaultDifferences);
    // });

    // it('createSoloSession() should create a new classic game session when asked', async () => {
    //     const createGameSessionDto = new CreateClassicGameSessionDto('gameId', 'player1', GameMode.ClassicSolo);

    //     gameService.getGame.resolves(defaultGame);
    //     jest.spyOn(service, 'createClassicSession').mockResolvedValue(defaultClassicGameSession);
    //     const setPlayerGameSession = jest.spyOn(service, 'setPlayerGameSession');
    //     jest.spyOn(service, 'generateGameInfo').mockReturnValue('mygameinfo' as unknown as GameInfo);

    //     const waitingRoomStatus = await service.createSoloSession(mockServer, mockSocket, createGameSessionDto);

    //     expect(waitingRoomStatus).toEqual(WaitingRoomStatus.Created);
    //     expect(setPlayerGameSession).toHaveBeenCalledWith('player1', defaultClassicGameSession);
    //     expect(mockSocket.join).toHaveBeenCalledWith(defaultClassicGameSession.roomId);
    //     expect(mockServer.to).toHaveBeenCalledWith('player1');
    //     expect(mockServer.emit).toHaveBeenCalledWith(GameSessionEvent.GameStart, 'mygameinfo');
    // });

    // it('createSoloSession() should create a new time limited game session when asked', async () => {
    //     const createGameSessionDto = new CreateTimeLimitedGameSessionDto('123', 'player1', GameMode.TimeLimitedSolo);

    //     jest.spyOn(service, 'createTimeLimitedSession').mockResolvedValue(defaultTimeLimitedCoopGameSession);
    //     const setPlayerGameSession = jest.spyOn(service, 'setPlayerGameSession');
    //     jest.spyOn(service, 'generateGameInfo').mockReturnValue('mygameinfo' as unknown as GameInfo);

    //     const waitingRoomStatus = await service.createSoloSession(mockServer, mockSocket, createGameSessionDto);

    //     expect(waitingRoomStatus).toEqual(WaitingRoomStatus.Created);
    //     expect(setPlayerGameSession).toHaveBeenCalledWith('player1', defaultTimeLimitedCoopGameSession);
    //     expect(mockSocket.join).toHaveBeenCalledWith(defaultTimeLimitedCoopGameSession.roomId);
    //     expect(mockServer.to).toHaveBeenCalledWith('player1');
    //     expect(mockServer.emit).toHaveBeenCalledWith(GameSessionEvent.GameStart, 'mygameinfo');
    // });

    // it('createClassicOneVersusOneSession() should create a new classic game session when asked', async () => {
    //     const createGameSessionDto = new CreateClassicGameSessionDto(defaultGame._id, player1.username, GameMode.ClassicOneVersusOne);

    //     gameService.getGame.resolves(defaultGame);
    //     waitingRoomService.addPlayer.resolves(true);

    //     const result = await service.createClassicOneVersusOneSession(mockServer, mockSocket, createGameSessionDto);

    //     expect(result).toEqual(WaitingRoomStatus.Created);
    //     expect(mockServer.emit).toHaveBeenCalledWith(GameSessionEvent.GameStateChanged, {
    //         _id: defaultGame._id,
    //         sheetState: GameSheetState.Joinable,
    //     });
    // });

    // FIXME: this test should pass, we need to fix it once waiting room + game functionality connected
    // it('createClassicOneVersusOneSession() should return WaitingRoomStatus.Joined if the waiting room existed', async () => {
    //     const gameRoom = new Map([[defaultEmptyWaitingRoom.id, defaultEmptyWaitingRoom]]);

    //     waitingRoomService['gameIdToRooms'] = new Map();
    //     waitingRoomService['gameIdToRooms'].set(defaultGame._id as string, gameRoom);
    //     waitingRoomService['socketIdToRoom'] = new Map();
    //     waitingRoomService['socketIdToRoom'].set(player1.socketId, defaultEmptyWaitingRoom);

    //     const createGameSessionDto = new CreateClassicGameSessionDto(defaultGame._id, player2.username, GameMode.ClassicOneVersusOne);

    //     gameService.getGame.resolves(defaultGame);
    //     waitingRoomService.getPlayerWaitingRoom.returns(defaultWaitingRoomWithOnePlayerInQueue);
    //     waitingRoomService.addPlayer.resolves(false);

    //     waitingRoomService.getClassicGameWaitingRoom.returns(defaultWaitingRoomWithOnePlayerInQueue);
    //     // @ts-except-error ignore because id need to be tested
    //     Object.defineProperty(mockSocket, 'id', { value: player2.socketId });
    //     // mockSocket['id'] = player2.socketId;

    //     const result = await service.createClassicOneVersusOneSession(mockServer, mockSocket, createGameSessionDto);

    //     expect(result).toEqual(WaitingRoomStatus.Joined);
    //     expect(
    //         waitingRoomService.addPlayer.calledWith(
    //             '',
    //             defaultGame._id,
    //             { socketId: mockSocket.id, username: 'player1' },
    //             GameMode.ClassicOneVersusOne,
    //         ),
    //     ).toEqual(true);
    //     expect(mockServer.to).toHaveBeenCalledWith(defaultEmptyWaitingRoom.creator.socketId);
    //     expect(mockServer.emit).toHaveBeenCalledWith(GameSessionEvent.NewOpponent, {
    //         username: 'player1',
    //         socketId: mockSocket.id,
    //     });
    // });

    // it('createTimeLimitedCoopSession() should create a new time limited game session when asked', async () => {
    //     const gameSession = {
    //         timer: {
    //             timerEndedObservable: {
    //                 subscribe: (observer: any) => {
    //                     observer.next({
    //                         roomId: 'lololol',
    //                         isEndgame: true,
    //                     } as TimerEnd);
    //                 },
    //             },
    //         },
    //     } as unknown as TimeLimitedSession;
    //     const createTimeLimitedSessionSpy = jest.spyOn(service, 'createTimeLimitedSession').mockResolvedValue(gameSession);
    //     jest.spyOn(service, 'createGameHistory').mockImplementation();
    //     const result = await service.createTimeLimitedCoopSession(mockServer, defaultEmptyWaitingRoom as TimeLimitedWaitingRoom);

    //     expect(result).toEqual(gameSession);
    //     expect(createTimeLimitedSessionSpy).toHaveBeenCalledWith(defaultEmptyWaitingRoom);

    //     expect(mockServer.to).toHaveBeenCalledWith('lololol');
    //     expect(mockServer.emit).toHaveBeenCalledWith(GameSessionEvent.EndGame, {
    //         isWinner: false,
    //         isForfeit: false,
    //     });
    // });
});
