// import { defaultGame } from '@app/samples/game';
// import { player1, player2, player3, player4 } from '@app/samples/player';
// import {
//     defaultEmptyWaitingRoom,
//     defaultWaitingRoomWithOnePlayerInQueue,
//     defaultWaitingRoomWithThreePlayersInQueue,
//     defaultWaitingRoomWithTwoPlayersInQueue,
// } from '@app/samples/waiting-room';
import { FriendshipService } from '@app/services/friendship/friendship.service';
import { GameService } from '@app/services/game/game.service';
import { UserService } from '@app/services/user/user.service';
// import { GameMode } from '@common/game-mode';
// import { CreateClassicGameSessionDto } from '@common/model/dto/create-game-session';
// import { SessionType } from '@common/model/guess-result';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { WaitingRoomService } from './waiting-room.service';
import { ChatService } from '@app/services/chat/chat.service';
describe('WaitingRoomService', () => {
    let service: WaitingRoomService;
    let gameServiceStub: SinonStubbedInstance<GameService>;
    let friendshipServiceStub: SinonStubbedInstance<FriendshipService>;
    let userServiceStub: SinonStubbedInstance<UserService>;
    let chatServiceStub: SinonStubbedInstance<ChatService>;
    beforeEach(async () => {
        gameServiceStub = createStubInstance(GameService);
        friendshipServiceStub = createStubInstance(FriendshipService);
        userServiceStub = createStubInstance(UserService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WaitingRoomService,
                { provide: GameService, useValue: gameServiceStub },
                { provide: FriendshipService, useValue: friendshipServiceStub },
                { provide: UserService, useValue: userServiceStub },
                { provide: ChatService, useValue: chatServiceStub },
            ],
        }).compile();

        service = module.get<WaitingRoomService>(WaitingRoomService);
        service['gameIdToRooms'] = new Map();
        service['socketIdToRoom'] = new Map();
        jest.mock('crypto', () => ({
            ...jest.requireActual('crypto'),
            generateUuid: jest.fn(() => ''),
        }));
        jest.spyOn(userServiceStub, 'getUser').mockResolvedValue({
            username: 'bob',
            _id: '2',
            saltedHashedPassword: '',
            email: '',
            avatar: '',
            sentFriendRequests: [],
            receivedFriendRequests: [],
            friends: [],
            replays: [],
            messages: [],
            chats: [],
            ownedChats: [],
        });
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // it('getGameWaitingRoom should return the correct waiting room', () => {
    //     expect(service.getClassicGameWaitingRoom(defaultGame._id as string, '123')).toBeUndefined();

    //     const roomIdOne = '1';
    //     const roomIdTwo = '2';
    //     const roomIdThree = '3';

    //     const currentGameId = '123';

    //     const gameRooms = new Map([
    //         [defaultGame._id, defaultEmptyWaitingRoom],
    //         [roomIdOne, defaultWaitingRoomWithOnePlayerInQueue],
    //         [roomIdTwo, defaultWaitingRoomWithTwoPlayersInQueue],
    //         [roomIdThree, defaultWaitingRoomWithThreePlayersInQueue],
    //     ]);

    //     (service['gameIdToRooms'] as unknown) = new Map([[currentGameId, gameRooms]]);

    //     expect(service.getClassicGameWaitingRoom(currentGameId, roomIdOne)).toEqual(defaultWaitingRoomWithOnePlayerInQueue);
    //     expect(service.getClassicGameWaitingRoom(currentGameId, roomIdTwo)).toEqual(defaultWaitingRoomWithTwoPlayersInQueue);
    //     expect(service.getClassicGameWaitingRoom(currentGameId, roomIdThree)).toEqual(defaultWaitingRoomWithThreePlayersInQueue);
    // });

    // it('clearRoom should delete the waiting room and delete the waiting room associated to the players waiting', () => {
    //     const roomId = '123';
    //     const gameRooms = new Map([[defaultGame._id as string, defaultEmptyWaitingRoom]]);
    //     service['gameIdToRooms'].set(roomId, gameRooms);
    //     service['socketIdToRoom'].set(player1.socketId, defaultEmptyWaitingRoom);

    //     service.clearRoom(roomId, SessionType.Classic, defaultGame._id as string);

    //     expect(service['gameIdToRooms'].get(defaultGame._id as string)?.get(roomId)).toBeUndefined();
    // });

    // it('clearRoom called with a gameId that does not exist should not delete anything', () => {
    //     const gameIdMapDeleteSpy = jest.spyOn(service['gameIdToRooms'], 'delete');
    //     const socketIdMapDeleteSpy = jest.spyOn(service['socketIdToRoom'], 'delete');

    //     service.clearRoom('hasNoWaitingRoom', SessionType.Classic);

    //     expect(gameIdMapDeleteSpy).not.toHaveBeenCalled();
    //     expect(socketIdMapDeleteSpy).not.toHaveBeenCalled();
    // });

    // it("addPlayer should create a new waiting room if there isn't already one and return true", async () => {
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     jest.spyOn(gameServiceStub, 'getGame').mockResolvedValue(defaultGame);

    //     const addPlayerSpy = jest.spyOn(service, 'joinWaitingR');
    //     const createGameDto: CreateClassicGameSessionDto = {
    //         username: player1.username,
    //         gameId: defaultGame._id,
    //         gameMode: GameMode.Classic,
    //     };
    //     const wasRoomCreated = await service.addPlayer(createGameDto, player1);

    //     expect(wasRoomCreated).toEqual(true);
    //     expect(addPlayerSpy).toHaveBeenCalled();
    // });

    // it('addPlayer should add the player at the end of the queue', async () => {
    //     const gameRooms = new Map([[defaultWaitingRoomWithOnePlayerInQueue.id, defaultWaitingRoomWithOnePlayerInQueue]]);
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     gameServiceStub.getGame.resolves(defaultGame as any);
    //     service['gameIdToRooms'].set(defaultGame._id as string, gameRooms);
    //     service['socketIdToRoom'].set(player1.socketId, defaultWaitingRoomWithOnePlayerInQueue);
    //     service['socketIdToRoom'].set(player2.socketId, defaultWaitingRoomWithOnePlayerInQueue);

    //     const createGameDto: CreateClassicGameSessionDto = {
    //         waitingRoomId: defaultWaitingRoomWithOnePlayerInQueue.id,
    //         username: player3.username,
    //         gameId: defaultGame._id,
    //         gameMode: GameMode.ClassicOneVersusOne,
    //     };
    //     await service.addPlayer(createGameDto, player3);

    //     expect(service['socketIdToRoom'].get(player3.socketId)).toEqual(defaultWaitingRoomWithTwoPlayersInQueue);
    // });

    // it('removePlayer called with the room creator should delete the waiting room and return true', () => {
    //     const gameRoom = new Map([[defaultEmptyWaitingRoom.id, defaultEmptyWaitingRoom]]);

    //     service['gameIdToRooms'].set(defaultGame._id as string, gameRoom);
    //     service['socketIdToRoom'].set(player1.socketId, defaultEmptyWaitingRoom);

    //     const clearRoomSpy = jest.spyOn(service, 'clearRoom');

    //     const wasRoomDeleted = service.removePlayer(player1.socketId);

    //     expect(wasRoomDeleted).toEqual(true);
    //     expect(clearRoomSpy).toHaveBeenCalledWith(defaultEmptyWaitingRoom.id, SessionType.Classic, defaultGame._id);
    //     expect(service['gameIdToRooms'].get(defaultGame._id as string)?.get(defaultEmptyWaitingRoom.id)).toBeUndefined();
    //     expect(service['socketIdToRoom'].get(player1.socketId)).toBeUndefined();
    // });

    // it('removePlayer should remove the player from the queue and shift the players added after them towards the start of the queue', () => {
    //     const gameRoom = new Map([[defaultGame._id as string, defaultWaitingRoomWithThreePlayersInQueue]]);
    //     service['gameIdToRooms'].set(defaultGame._id as string, gameRoom);
    //     service['socketIdToRoom'].set(player2.socketId, defaultWaitingRoomWithThreePlayersInQueue);

    //     const wasRoomDeleted = service.removePlayer(player2.socketId);

    //     expect(wasRoomDeleted).toEqual(false);
    //     expect(service['socketIdToRoom'].get(player2.socketId)).toBeUndefined();
    //     expect(service['gameIdToRooms'].get(defaultGame._id as string)?.get(defaultGame._id as string)?
    //              .waitingPlayers).toEqual([player3, player4]);

    // });

    // it('removePlayer called with a player that is not in a waiting room should return false', () => {
    //     const wasRoomDeleted = service.removePlayer('notInRoom');

    //     expect(wasRoomDeleted).toEqual(false);
    // });

    // it('getPlayerWaitingRoom should return the waiting room of the player', () => {
    //     service['socketIdToRoom'].set(player1.socketId, defaultEmptyWaitingRoom);

    //     expect(service.getPlayerWaitingRoom(player1.socketId)).toEqual(defaultEmptyWaitingRoom);
    // });

    // it('getPlayerWaitingRoom should throw error if the requested player is not in a waiting room', () => {
    //     expect(() => service.getPlayerWaitingRoom('notInRoom')).toThrowError();
    // });
});
