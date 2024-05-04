/* eslint-disable max-lines */
import { MAX_WAITING_ROOM_PLAYERS, MIN_WAITING_ROOM_PLAYERS, TIME_LIMITED_ID } from '@app/constants/waiting-room.constants';
import { Player } from '@app/interfaces/player/player.interface';
import { ClassicTeamWaitingRoom, TimeLimitedWaitingRoom, WaitingRoom } from '@app/interfaces/waiting-room/waiting-room.interface';
import { User } from '@app/model/database/user.entity';
import { CreateClassicGameSessionDto } from '@app/model/dto/game-session/create-classic-game-session.dto';
import { CreateTimeLimitedGameSessionDto } from '@app/model/dto/game-session/create-time-limited-game-session.dto';
import { ChatService } from '@app/services/chat/chat.service';
import { FriendshipService } from '@app/services/friendship/friendship.service';
import { GameService } from '@app/services/game/game.service';
import { UserService } from '@app/services/user/user.service';
import { FriendsGameType } from '@common/enums/friends-game-type';
import { GameMode } from '@common/game-mode';
import { ChatGame } from '@common/interfaces/chat/chat.interface';
import { ClassicGameWaitingRooms } from '@common/interfaces/classic-game-waiting-rooms.interface';
import { SessionType } from '@common/model/guess-result';
import { WaitingRoomStatus } from '@common/model/waiting-room-status';
import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { isEmpty } from 'class-validator';
import { randomUUID } from 'crypto';

@Injectable()
export class WaitingRoomService {
    private roomIdToRooms: Map<string, WaitingRoom> = new Map();
    private gameIdToRooms: Map<string, Map<string, WaitingRoom>> = new Map();
    private socketIdToRoom: Map<string, WaitingRoom> = new Map();
    private timeLimitRooms: Map<string, WaitingRoom> = new Map();

    // eslint-disable-next-line max-params
    constructor(
        private gameService: GameService,
        private friendshipService: FriendshipService,
        private userService: UserService,
        private chatService: ChatService,
    ) {}

    async createClassicWaitingRoom(
        createGameSessionDto: CreateClassicGameSessionDto,
        player: Player,
    ): Promise<{ newRoom: WaitingRoom; chatGame: ChatGame | undefined }> {
        if (this.socketIdToRoom.get(player.socketId)) {
            throw new WsException('Player already in a waiting room');
        }

        if (!this.gameIdToRooms.get(createGameSessionDto.gameId)) {
            this.gameIdToRooms.set(createGameSessionDto.gameId, new Map());
        }
        const game = await this.gameService.getGame(createGameSessionDto.gameId);

        if (!game) {
            throw new WsException('Game not found');
        }

        let friendsUserIdAllowed: string[] | undefined;
        if (createGameSessionDto.friendsGameType !== undefined) {
            friendsUserIdAllowed = await this.getFriendsUsers(player.username, createGameSessionDto.friendsGameType);
        }

        const roomId: string = randomUUID();
        let newRoom: WaitingRoom;
        if (createGameSessionDto.gameMode === GameMode.ClassicTeam) {
            newRoom = {
                id: roomId,
                gameMode: createGameSessionDto.gameMode,
                creator: player,
                waitingPlayers: [],
                game,
                sessionType: SessionType.Classic,
                joinState: WaitingRoomStatus.Created,
                friendsGameType: createGameSessionDto.friendsGameType,
                friendsUserIdAllowed,
                teams: new Array<Player[]>(),
                chatId: '',
            };
            newRoom.teams.push([player]);
            newRoom.teams.push([]);
            newRoom.teams.push([]);
        } else {
            newRoom = {
                id: roomId,
                gameMode: createGameSessionDto.gameMode,
                creator: player,
                waitingPlayers: [],
                game,
                sessionType: SessionType.Classic,
                joinState: WaitingRoomStatus.Created,
                friendsGameType: createGameSessionDto.friendsGameType,
                friendsUserIdAllowed,
                chatId: '',
            };
        }
        this.gameIdToRooms.get(createGameSessionDto.gameId)?.set(roomId, newRoom);
        this.roomIdToRooms.set(roomId, newRoom);
        this.socketIdToRoom.set(player.socketId, newRoom);
        const chatGame = await this.chatService.createGameChat(player.username, game.name);
        if (chatGame) {
            newRoom.chatId = chatGame.newChatData.chatId;
        }
        return { newRoom, chatGame };
    }

    async createTimeLimitedWaitingRoom(
        player: Player,
        createGameSessionDto: CreateTimeLimitedGameSessionDto,
    ): Promise<{ newRoom: WaitingRoom; chatGame: ChatGame | undefined }> {
        if (this.socketIdToRoom.get(player.socketId)) {
            throw new WsException('Player already in a waiting room');
        }

        let friendsUserIdAllowed: string[] | undefined;
        if (createGameSessionDto.friendsGameType !== undefined) {
            friendsUserIdAllowed = await this.getFriendsUsers(player.username, createGameSessionDto.friendsGameType);
        }

        const roomId: string = randomUUID();
        const newRoom: TimeLimitedWaitingRoom = {
            id: roomId,
            gameMode: createGameSessionDto.gameMode,
            creator: player,
            waitingPlayers: [],
            sessionType: SessionType.TimeLimited,
            joinState: WaitingRoomStatus.Created,
            friendsGameType: createGameSessionDto.friendsGameType,
            friendsUserIdAllowed,
            chatId: '',
        };
        this.timeLimitRooms.set(roomId, newRoom);
        this.roomIdToRooms.set(roomId, newRoom);
        this.socketIdToRoom.set(player.socketId, newRoom);
        const chatGame = await this.chatService.createGameChat(player.username, 'Time Limited Game');
        if (chatGame) {
            newRoom.chatId = chatGame.newChatData.chatId;
        }
        return { newRoom, chatGame };
    }

    isPlayerInWaitingRoom(socketId: string): boolean {
        return this.socketIdToRoom.has(socketId);
    }

    joinWaitingRoom(waitingRoom: WaitingRoom, player: Player) {
        if (waitingRoom.joinState === WaitingRoomStatus.Full) {
            throw new WsException('Waiting room is full');
        }

        waitingRoom.waitingPlayers.push(player);
        this.socketIdToRoom.set(player.socketId, waitingRoom);
        waitingRoom.joinState = this.isRoomJoinable(waitingRoom.gameMode, waitingRoom.waitingPlayers)
            ? WaitingRoomStatus.Waiting
            : WaitingRoomStatus.Full;
    }

    joinTeamWaitingRoom(waitingRoom: ClassicTeamWaitingRoom, player: Player, teamNumber: number) {
        if (waitingRoom.joinState === WaitingRoomStatus.Full) {
            throw new WsException('Waiting room is full');
        }

        if (teamNumber < 0 || teamNumber > 2 || waitingRoom.teams[teamNumber].length === 2) {
            throw new WsException('Cannot join this team');
        }

        waitingRoom.waitingPlayers.push(player);
        waitingRoom.teams[teamNumber].push(player);
        this.socketIdToRoom.set(player.socketId, waitingRoom);
        waitingRoom.joinState = this.isRoomJoinable(waitingRoom.gameMode, waitingRoom.waitingPlayers)
            ? WaitingRoomStatus.Waiting
            : WaitingRoomStatus.Full;
    }

    removePlayer(socketId: string): boolean {
        const waitingRoom = this.socketIdToRoom.get(socketId);

        if (!waitingRoom) {
            return false;
        }

        if (socketId === waitingRoom.creator.socketId) {
            let gameId;
            if (waitingRoom.sessionType === SessionType.Classic) {
                gameId = waitingRoom.game._id.toString();
                this.clearRoom(waitingRoom.id, SessionType.Classic, gameId);
            } else {
                this.clearRoom(waitingRoom.id, SessionType.TimeLimited);
            }
            return true;
        }

        const playerToRemoveIndex = waitingRoom.waitingPlayers.findIndex((player) => {
            return player.socketId === socketId;
        });

        waitingRoom.waitingPlayers.splice(playerToRemoveIndex, 1);
        if (waitingRoom.gameMode === GameMode.ClassicTeam) {
            for (const team of waitingRoom.teams.values()) {
                for (const [index, player] of team.entries()) {
                    if (player.socketId === socketId) {
                        team.splice(index);
                    }
                }
            }
        }
        waitingRoom.joinState = WaitingRoomStatus.Waiting;
        if (waitingRoom.sessionType === SessionType.Classic) {
            this.gameIdToRooms.get(waitingRoom.game._id)?.set(waitingRoom.id, waitingRoom);
        } else {
            this.timeLimitRooms.set(waitingRoom.id, waitingRoom);
        }

        this.socketIdToRoom.delete(socketId);

        return false;
    }

    isRoomReady(waitingPlayers: Player[]) {
        return waitingPlayers.length >= MIN_WAITING_ROOM_PLAYERS && waitingPlayers.length <= MAX_WAITING_ROOM_PLAYERS;
    }

    isRoomJoinable(gameMode: GameMode, waitingPlayers: Player[]) {
        if (gameMode !== GameMode.ClassicTeam) {
            return waitingPlayers.length >= MIN_WAITING_ROOM_PLAYERS && waitingPlayers.length < MAX_WAITING_ROOM_PLAYERS;
        }
        // TODO: Replace magic number
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return waitingPlayers.length >= 0 && waitingPlayers.length < 8;
    }

    isRoomEmpty(waitingPlayers: Player[]) {
        return waitingPlayers.length === 0;
    }

    isTimeLimitMode(gameId: string | undefined) {
        return !gameId || gameId === TIME_LIMITED_ID;
    }

    getGameClassicWaitingRooms() {
        return this.gameIdToRooms;
    }

    getWaitingRoomById(waitingRoomId: string): WaitingRoom {
        const waitingRoom = this.roomIdToRooms.get(waitingRoomId);
        if (waitingRoom === undefined) {
            throw new WsException('Waiting room not found');
        }

        return waitingRoom;
    }

    getWaitingRoomsOfGame(gameId: string): Map<string, WaitingRoom> | undefined {
        return this.gameIdToRooms.get(gameId);
    }

    getTimeLimitWaitingRooms(): WaitingRoom[] {
        const waitingRooms: WaitingRoom[] = Array.from(this.timeLimitRooms.values());
        return waitingRooms;
    }

    async getFriendsSocketId(friendsUserIdAllowed: string[]) {
        const friendsSocketIdAllowed: string[] = [];

        for (const userId of friendsUserIdAllowed) {
            const user = await this.userService.getUserById(userId);
            if (!user) {
                throw new WsException('Friends user not found');
            }
            const socketId = this.userService.getUserConnectionData(user.username)?.socket;
            friendsSocketIdAllowed.push(socketId as string);
        }
        return friendsSocketIdAllowed;
    }

    async isUserAllowedInRoom(waitingRoom: WaitingRoom, currentSocketId: string) {
        const username = this.userService.getUserNameFromSocketId(currentSocketId);
        if (!username) {
            throw new WsException('Username not found according to socket id in Waiting Rooms update');
        }
        const user = await this.userService.getUser(username);
        if (!user) {
            throw new WsException('User not found according to username in Waiting Rooms update');
        }
        if (waitingRoom.friendsGameType && !isEmpty(waitingRoom.friendsUserIdAllowed)) {
            if (waitingRoom.friendsUserIdAllowed?.includes(user._id)) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

    getClassicGameWaitingRoom(gameId: string, waitingRoomId?: string): WaitingRoom | undefined {
        if (!this.gameIdToRooms.get(gameId)) return;
        if (!waitingRoomId) return;
        return this.gameIdToRooms.get(gameId)?.get(waitingRoomId);
    }

    getLimitGameWaitingRoom(waitingRoomId?: string): WaitingRoom | undefined {
        if (!waitingRoomId) return;
        return this.timeLimitRooms.get(waitingRoomId);
    }

    getPlayerWaitingRoom(socketId: string): WaitingRoom {
        const waitingRoom = this.socketIdToRoom.get(socketId);
        if (!waitingRoom) {
            throw new WsException('Player is not in a waiting room');
        }
        return waitingRoom;
    }

    getLeavingPlayerWaitingRoom(socketId: string): WaitingRoom | undefined {
        const waitingRoom = this.socketIdToRoom.get(socketId);
        return waitingRoom;
    }

    getAllClassicRoomsOfGame(gameId: string): ClassicGameWaitingRooms {
        const waitingRoomsOfGameMap = this.getWaitingRoomsOfGame(gameId);
        let waitingRoomsOfGame: WaitingRoom[];
        if (!waitingRoomsOfGameMap) {
            waitingRoomsOfGame = [];
        } else {
            waitingRoomsOfGame = Array.from(waitingRoomsOfGameMap.values());
        }

        return {
            gameId,
            rooms: waitingRoomsOfGame,
        };
    }

    clearRoom(roomId: string, sessionType: SessionType, gameId?: string): void {
        let waitingRoom;
        if (sessionType === SessionType.Classic) {
            if (!gameId) return;
            waitingRoom = this.getClassicGameWaitingRoom(gameId, roomId);
        } else {
            waitingRoom = this.timeLimitRooms.get(roomId);
        }

        if (!waitingRoom) {
            return;
        }

        if (sessionType === SessionType.Classic && gameId) {
            this.gameIdToRooms.get(gameId)?.delete(roomId);
        } else {
            this.timeLimitRooms.delete(roomId);
        }

        this.socketIdToRoom.delete(waitingRoom.creator.socketId);

        waitingRoom.waitingPlayers.forEach((player) => {
            this.socketIdToRoom.delete(player.socketId);
        });
    }

    async doesUserHaveFriends(socketId: string): Promise<boolean> {
        const username = this.userService.getUserNameFromSocketId(socketId);
        if (!username) {
            throw new WsException('User name not found');
        }

        const user = await this.userService.getUser(username);
        if (!user) {
            throw new WsException('User not found');
        }

        const friendsUserAllowed: User[] = await this.friendshipService.getFriendGameUsers(user._id);
        return friendsUserAllowed.length !== 0;
    }

    private async getFriendsUsers(username: string, friendsGameType: FriendsGameType): Promise<string[]> {
        let friendsUserAllowed: User[] = [];
        const creator = await this.userService.getUser(username);
        if (!creator) {
            throw new WsException('Creator user not found');
        }

        const creatorUserId = creator._id;

        if (friendsGameType === FriendsGameType.FriendsOnly) {
            friendsUserAllowed = await this.friendshipService.getFriendGameUsers(creatorUserId);
        } else {
            friendsUserAllowed = await this.friendshipService.friendOfFriendGameUsers(creatorUserId);
        }

        const friendsUserIdAllowed: string[] = friendsUserAllowed.map((user) => {
            return user._id;
        });

        return friendsUserIdAllowed;
    }
}
