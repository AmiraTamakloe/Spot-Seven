/* eslint-disable max-lines */
// FIXME: remove disable
import { GATEWAY_CONFIGURATION_OBJECT } from '@app/gateways/gateway.constants';
import { Player } from '@app/interfaces/player/player.interface';
import { ClassicTeamWaitingRoom, WaitingRoom } from '@app/interfaces/waiting-room/waiting-room.interface';
import { CreateClassicGameSessionDto } from '@app/model/dto/game-session/create-classic-game-session.dto';
import { CreateTimeLimitedGameSessionDto } from '@app/model/dto/game-session/create-time-limited-game-session.dto';
import { GameSession } from '@app/model/schema/game-session';
import { ChatService } from '@app/services/chat/chat.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { GameService } from '@app/services/game/game.service';
import { ReplayService } from '@app/services/replay/replay.service';
import { WaitingRoomService } from '@app/services/waiting-room/waiting-room.service';
import { WSValidationPipe } from '@app/validation-pipes/web-socket/web-socket.validation-pipe';
import { CancelGameResponse } from '@common/cancel-game-responses';
import { GameMode } from '@common/game-mode';
import { ClassicWaitingRoom } from '@common/interfaces/base-waiting-room.interface';
import { JoinWaitingRoomDto, WaitingRoomType } from '@common/model/dto/join-waiting-room.dto';
import { GameSessionEvent } from '@common/model/events/game-session.events';
import { ObserverEvent } from '@common/model/events/observer.events';
import { GameInfo } from '@common/model/game-info';
import { SessionType } from '@common/model/guess-result';
import { WaitingRoomStatus } from '@common/model/waiting-room-status';
import { Injectable, Logger, UsePipes } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(GATEWAY_CONFIGURATION_OBJECT)
@Injectable()
@UsePipes(new WSValidationPipe({ transform: true }))
export class WaitingRoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;
    private clients: Map<string, Socket>;

    // Used to inject the required services
    // eslint-disable-next-line max-params
    constructor(
        private waitingRoomService: WaitingRoomService,
        private gameService: GameService,
        private gameManagerService: GameManagerService,
        private replayService: ReplayService,
        private chatService: ChatService,
    ) {
        this.clients = new Map();
        this.gameService.gameDeletedObservable.subscribe((deletedGameId: string) => {
            this.informWaitingPlayersGameWasDeleted(deletedGameId);
        });
    }

    @SubscribeMessage(GameSessionEvent.StartWaitingRoom)
    async startWaitingRoom(
        @ConnectedSocket() socket: Socket,
        @MessageBody() createGameSessionDto: CreateTimeLimitedGameSessionDto | CreateClassicGameSessionDto,
    ): Promise<WaitingRoomStatus> {
        if (this.gameManagerService.isPlayerInGameSession(socket.id)) {
            throw new WsException('A game is already in progress');
        }

        if (this.waitingRoomService.isPlayerInWaitingRoom(socket.id)) {
            throw new WsException('You are already in a waiting room');
        }

        const player: Player = { socketId: socket.id, username: createGameSessionDto.username };
        switch (createGameSessionDto.gameMode) {
            case GameMode.Classic:
            case GameMode.ClassicTeam: {
                const waitingRoom = await this.waitingRoomService.createClassicWaitingRoom(createGameSessionDto, player);
                this.updateWaitingRooms(createGameSessionDto.gameId, waitingRoom.newRoom.friendsUserIdAllowed, socket.id);
                if (waitingRoom.chatGame?.socketId && waitingRoom.chatGame?.newChatData) {
                    this.chatService.alertSpecificUserNewChat(waitingRoom.chatGame?.socketId, this.server, waitingRoom.chatGame?.newChatData);
                }
                break;
            }
            case GameMode.TimeLimited:
            case GameMode.TimeLimitedImproved: {
                const waitingRoom = await this.waitingRoomService.createTimeLimitedWaitingRoom(player, createGameSessionDto);
                this.updateWaitingRooms(undefined, waitingRoom.newRoom.friendsUserIdAllowed, socket.id);
                if (waitingRoom.chatGame?.socketId && waitingRoom.chatGame?.newChatData) {
                    this.chatService.alertSpecificUserNewChat(waitingRoom.chatGame?.socketId, this.server, waitingRoom.chatGame?.newChatData);
                }
                break;
            }
            default:
                throw new WsException('Invalid game mode');
        }

        return WaitingRoomStatus.Created;
    }

    @SubscribeMessage(GameSessionEvent.JoinWaitingRoom)
    async joinWaitingRoom(@ConnectedSocket() socket: Socket, @MessageBody() joinWaitingRoomDto: JoinWaitingRoomDto): Promise<WaitingRoomStatus> {
        if (this.gameManagerService.isPlayerInGameSession(socket.id)) {
            throw new WsException('A game is already in progress');
        }

        if (this.waitingRoomService.isPlayerInWaitingRoom(socket.id)) {
            throw new WsException('You are already in a waiting room');
        }

        const waitingRoom: WaitingRoom = this.waitingRoomService.getWaitingRoomById(joinWaitingRoomDto.waitingRoomId);

        if (joinWaitingRoomDto.type === WaitingRoomType.Team) {
            this.waitingRoomService.joinTeamWaitingRoom(
                waitingRoom as ClassicTeamWaitingRoom,
                { socketId: socket.id, username: joinWaitingRoomDto.username },
                joinWaitingRoomDto.teamNumber,
            );
        } else {
            this.waitingRoomService.joinWaitingRoom(waitingRoom, { socketId: socket.id, username: joinWaitingRoomDto.username });
        }
        this.chatService.joinGameChat(waitingRoom.chatId, socket.id, this.server, joinWaitingRoomDto.username);

        if (waitingRoom.gameMode === GameMode.Classic || waitingRoom.gameMode === GameMode.ClassicTeam) {
            this.updateWaitingRooms(waitingRoom.game._id, waitingRoom.friendsUserIdAllowed, waitingRoom.creator.socketId);
        } else {
            this.updateWaitingRooms(undefined, waitingRoom.friendsUserIdAllowed, waitingRoom.creator.socketId);
        }
        return WaitingRoomStatus.Joined;
    }

    @SubscribeMessage(GameSessionEvent.LaunchGame)
    async launchGameSession(@ConnectedSocket() socket: Socket): Promise<void> {
        const waitingRoom = this.waitingRoomService.getPlayerWaitingRoom(socket.id);
        const creatorSocket = this.clients.get(waitingRoom.creator.socketId);
        if (creatorSocket === undefined || waitingRoom.waitingPlayers.length === 0) {
            this.waitingRoomService.clearRoom(waitingRoom.id, waitingRoom.sessionType);
            throw new WsException('Creator or Opponent socket not found');
        }

        let gameSession: GameSession;
        switch (waitingRoom.sessionType) {
            case SessionType.Classic:
                gameSession = await this.gameManagerService.createClassicSession(waitingRoom);
                break;
            case SessionType.TimeLimited:
                gameSession = await this.gameManagerService.createTimeLimitedSession(waitingRoom);
                break;
            default:
                throw new WsException('Invalid session type');
        }
        this.gameManagerService.setPlayerGameSession(creatorSocket.id, gameSession);
        gameSession.timer.timerEndedObservable.subscribe(async () => {
            if (waitingRoom.sessionType === SessionType.Classic) {
                await this.gameManagerService.manageClassicEndGame(gameSession, '', this.server);
            } else {
                await this.gameManagerService.manageTimeLimitedEndGame(gameSession, this.server, false);
            }
            this.updateGame(gameSession, socket);
        });

        for (const waitingPlayer of waitingRoom.waitingPlayers) {
            const waitingPlayerSocket = this.clients.get(waitingPlayer.socketId);
            this.gameManagerService.setPlayerGameSession(waitingPlayer.socketId, gameSession);
            if (waitingPlayerSocket) {
                waitingPlayerSocket.join(gameSession.roomId);
            }
        }

        creatorSocket.join(gameSession.roomId);
        this.server.to(gameSession.roomId).emit(GameSessionEvent.GameStart, this.gameManagerService.generateGameInfo(gameSession));
        switch (waitingRoom.gameMode) {
            case GameMode.Classic:
            case GameMode.ClassicTeam: {
                this.waitingRoomService.clearRoom(waitingRoom.id, waitingRoom.sessionType, gameSession.game._id);
                this.updateWaitingRooms(waitingRoom.game._id, waitingRoom.friendsUserIdAllowed, socket.id);
                break;
            }
            case GameMode.TimeLimited:
            case GameMode.TimeLimitedImproved: {
                this.waitingRoomService.clearRoom(waitingRoom.id, waitingRoom.sessionType);
                this.updateWaitingRooms(undefined, waitingRoom.friendsUserIdAllowed, socket.id);
                break;
            }
        }

        const gameInfo: GameInfo = this.gameManagerService.generateGameInfo(gameSession);
        this.server.to(gameSession.roomId).emit(GameSessionEvent.GameStart, gameInfo);
        this.replayService.saveGameEventForPlayersInRoom(
            (await this.server.in(gameSession.roomId).fetchSockets()).map((player) => player.id),
            GameSessionEvent.GameStart,
            null,
            gameInfo,
        );
        this.server.emit(ObserverEvent.GameSessionsUpdate, this.gameManagerService.getObserversGameSessions());
    }

    @SubscribeMessage(GameSessionEvent.PlayerLeftWaitingRoom)
    async leaveWaitingRoom(@ConnectedSocket() socket: Socket) {
        const room = this.waitingRoomService.getPlayerWaitingRoom(socket.id);
        this.removePlayer(socket.id);

        if (this.waitingRoomService.isRoomEmpty(room.waitingPlayers)) {
            this.server.to(room.creator.socketId).emit(GameSessionEvent.WaitingRoomEmpty, room);
        } else {
            this.server.to(room.creator.socketId).emit(GameSessionEvent.WaitingRoomReady, room);
        }
        this.chatService.leaveGameChat(room.chatId, socket.id, this.server);
        if (room.sessionType === SessionType.Classic) {
            await this.updateWaitingRooms(room.game._id, room.friendsUserIdAllowed, room.creator.socketId);
        } else {
            await this.updateWaitingRooms(undefined, room.friendsUserIdAllowed, room.creator.socketId);
        }
        this.updateWaitingRoomState(room.id, WaitingRoomStatus.Waiting);
    }

    @SubscribeMessage(GameSessionEvent.CancelWaitingRoom)
    async cancelWaitingRoom(@ConnectedSocket() socket: Socket, @MessageBody() gameId: string): Promise<void> {
        const room = this.waitingRoomService.getPlayerWaitingRoom(socket.id);
        this.removePlayer(socket.id);
        await this.chatService.deleteGameChat(room.chatId, this.server, socket);
        await this.updateWaitingRooms(gameId, room.friendsUserIdAllowed, socket.id);
    }

    @SubscribeMessage(GameSessionEvent.FetchWaitingRooms)
    async waitingRoomsUpdate(@ConnectedSocket() socket: Socket, @MessageBody() gameId: string): Promise<void> {
        this.fetchWaitingRooms(socket.id, gameId);
    }

    @SubscribeMessage(GameSessionEvent.RejectOpponent)
    rejectOpponent(@ConnectedSocket() socket: Socket, @MessageBody() { socketId }: { socketId: string }): void {
        const wasWaitingRoomDeleted = this.waitingRoomService.removePlayer(socketId);

        if (wasWaitingRoomDeleted) {
            throw new WsException('The game was canceled');
        }

        this.server.to(socketId).emit(GameSessionEvent.GameSessionCanceled, CancelGameResponse.CreatorRejected);

        const waitingRoom = this.waitingRoomService.getPlayerWaitingRoom(socket.id);

        this.findNewOpponent(waitingRoom);
    }

    @SubscribeMessage(GameSessionEvent.LeaveWaitingRoomPage)
    leaveWaitingRoomPage(@ConnectedSocket() socket: Socket) {
        const waitingRoom = this.waitingRoomService.getLeavingPlayerWaitingRoom(socket.id);
        if (!waitingRoom) return;

        if (waitingRoom.creator.socketId === socket.id) {
            if (waitingRoom.sessionType === SessionType.Classic) {
                this.cancelWaitingRoom(socket, (waitingRoom as ClassicWaitingRoom).game._id);
            } else {
                this.cancelWaitingRoom(socket, '');
            }
        } else {
            this.leaveWaitingRoom(socket);
        }
    }

    @SubscribeMessage(GameSessionEvent.VerifyFriendships)
    async verifyUserFriendships(@ConnectedSocket() socket: Socket) {
        const doesUserHaveFriends = await this.waitingRoomService.doesUserHaveFriends(socket.id);
        this.server.to(socket.id).emit(GameSessionEvent.VerifyFriendships, doesUserHaveFriends);
    }

    handleConnection(socket: Socket) {
        this.clients.set(socket.id, socket);
    }

    handleDisconnect(socket: Socket) {
        this.removePlayer(socket.id);
        this.clients.delete(socket.id);
    }

    private fetchWaitingRooms(socketId: string, gameId?: string) {
        if (this.waitingRoomService.isTimeLimitMode(gameId)) {
            const updatedWaitingRooms: WaitingRoom[] = this.waitingRoomService.getTimeLimitWaitingRooms();
            this.server.to(socketId).emit(GameSessionEvent.TimeLimitWaitingRoomsUpdate, updatedWaitingRooms);
        } else {
            const gameWaitingRooms = this.waitingRoomService.getAllClassicRoomsOfGame(gameId as string);
            this.server.to(socketId).emit(GameSessionEvent.ClassicWaitingRoomsUpdate, gameWaitingRooms);
        }
    }

    private informWaitingPlayersGameWasDeleted(gameId: string) {
        const waitingRoomsOfGame = this.waitingRoomService.getWaitingRoomsOfGame(gameId);

        if (!waitingRoomsOfGame) return;
        let playerSocketIds: string[];
        for (const waitingRoomInfo of waitingRoomsOfGame) {
            playerSocketIds = waitingRoomInfo[1].waitingPlayers.map((player: Player) => {
                return player.socketId;
            });
            this.server
                .to([...playerSocketIds, waitingRoomInfo[1].creator.socketId])
                .emit(GameSessionEvent.GameSessionCanceled, CancelGameResponse.GameDeleted);

            this.waitingRoomService.clearRoom(waitingRoomInfo[0], SessionType.Classic, gameId);
        }
    }

    private removePlayer(socketId: string) {
        let waitingRoom: WaitingRoom;
        try {
            waitingRoom = this.waitingRoomService.getPlayerWaitingRoom(socketId);
        } catch (e) {
            return;
        }
        const wasRoomDeleted = this.waitingRoomService.removePlayer(socketId);

        if (wasRoomDeleted) {
            waitingRoom.waitingPlayers.forEach((player: Player) => {
                this.server.to(player.socketId).emit(GameSessionEvent.GameSessionCanceled, CancelGameResponse.CreatorCanceled);
            });
        }
        if (waitingRoom.sessionType === SessionType.Classic) {
            this.updateWaitingRooms(waitingRoom.game._id, waitingRoom.friendsUserIdAllowed, socketId);
        } else {
            this.updateWaitingRooms(undefined, waitingRoom.friendsUserIdAllowed, socketId);
        }
    }

    private findNewOpponent(waitingRoom: WaitingRoom) {
        const newOpponent = waitingRoom.waitingPlayers[0];
        if (waitingRoom.waitingPlayers[0]) {
            this.server.to(waitingRoom.creator.socketId).emit(GameSessionEvent.NewOpponent, {
                username: newOpponent.username,
                socketId: newOpponent.socketId,
            });
        }
    }

    private async updateWaitingRooms(gameId?: string, friendsUserIdAllowed?: string[], socketId?: string) {
        if (this.waitingRoomService.isTimeLimitMode(gameId)) {
            const updatedWaitingRooms: WaitingRoom[] = this.waitingRoomService.getTimeLimitWaitingRooms();
            if (friendsUserIdAllowed !== undefined && socketId) {
                const friendsSocketIdAllowed = await this.waitingRoomService.getFriendsSocketId(friendsUserIdAllowed);
                friendsSocketIdAllowed.push(socketId);

                this.server.to(friendsSocketIdAllowed).emit(GameSessionEvent.TimeLimitWaitingRoomsUpdateFriends, updatedWaitingRooms);
            } else {
                this.server.emit(GameSessionEvent.TimeLimitWaitingRoomsUpdate, updatedWaitingRooms);
            }
        } else {
            const gameWaitingRooms = this.waitingRoomService.getAllClassicRoomsOfGame(gameId as string);

            if (friendsUserIdAllowed && socketId) {
                const friendsSocketIdAllowed = await this.waitingRoomService.getFriendsSocketId(friendsUserIdAllowed);
                friendsSocketIdAllowed.push(socketId);
                this.server.to(friendsSocketIdAllowed).emit(GameSessionEvent.ClassicWaitingRoomsUpdateFriends, gameWaitingRooms);
            } else {
                this.server.emit(GameSessionEvent.ClassicWaitingRoomsUpdate, gameWaitingRooms);
            }
        }
    }

    private updateWaitingRoomState(roomId: string, state: WaitingRoomStatus) {
        this.server.emit(GameSessionEvent.WaitingRoomStateUpdate, {
            waitingRoomId: roomId,
            updatedState: state,
        });
    }
    private cleanupGame(gameSession: GameSession) {
        this.gameManagerService.kickOutObservers(gameSession.roomId);
        this.gameManagerService.deleteGameSession([gameSession.roomId]);
        for (const player of gameSession.players.keys()) {
            const socket = this.clients.get(player);
            if (!socket) return;
            this.gameManagerService.deletePlayerGameSession(socket.id);
            try {
                this.gameManagerService.quitGameChat(socket.id, this.server, gameSession.chatId);
            } catch (error) {
                Logger.error(error);
            }
            socket.leave(gameSession.roomId);
        }
    }

    private updateGame(gameSession: GameSession, socket: Socket) {
        this.cleanupGame(gameSession);
        this.gameManagerService.deleteGameChat(gameSession.chatId, this.server, socket);
        const observersGameSessions = this.gameManagerService.getObserversGameSessions();
        this.server.emit(ObserverEvent.GameSessionsUpdate, observersGameSessions);
    }
}
