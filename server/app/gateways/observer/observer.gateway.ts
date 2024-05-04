import { GATEWAY_CONFIGURATION_OBJECT } from '@app/gateways/gateway.constants';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { UserService } from '@app/services/user/user.service';
import { WSValidationPipe } from '@app/validation-pipes/web-socket/web-socket.validation-pipe';
import { ObserverGameSession, ObserversGameInfo } from '@common/interfaces/observer-game-session.interface';
import { ObserverEvent } from '@common/model/events/observer.events';
import { GameInfo } from '@common/model/game-info';
import { Injectable, UsePipes } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(GATEWAY_CONFIGURATION_OBJECT)
@Injectable()
@UsePipes(new WSValidationPipe({ transform: true }))
@WebSocketGateway()
export class ObserverGateway implements OnGatewayConnection, OnGatewayConnection {
    @WebSocketServer()
    server!: Server;
    private clients: Map<string, Socket>;

    constructor(private gameManagerService: GameManagerService, private userService: UserService) {
        this.clients = new Map();
    }

    @SubscribeMessage(ObserverEvent.FetchGameSessions)
    fetchGameSessions(@ConnectedSocket() socket: Socket): void {
        const currentGameSessions = this.gameManagerService.getObserversGameSessions();
        this.server.to(socket.id).emit(ObserverEvent.GameSessionsUpdate, currentGameSessions);
    }

    @SubscribeMessage(ObserverEvent.StartObservingGameSession)
    startObservingSession(@ConnectedSocket() socket: Socket, @MessageBody() gameSessionId: string): void {
        const gameSession = this.gameManagerService.getGameSession([gameSessionId]);
        const observersGameSession: ObserverGameSession = this.gameManagerService.getObserversGameSession(gameSessionId);

        this.gameManagerService.setPlayerGameSession(socket.id, gameSession);
        socket.join(observersGameSession.observersRoomId);

        const username = this.userService.getUserNameFromSocketId(socket.id);
        if (!username) throw new WsException('No username found according to observer socket id');

        observersGameSession.currentObservers.push({ username, socketId: socket.id });
        this.gameManagerService.updateObserverGameSession(observersGameSession);
        this.server.emit(ObserverEvent.GameSessionsUpdate, this.gameManagerService.getObserversGameSessions());

        const gameInfo: GameInfo = this.gameManagerService.generateGameInfo(gameSession);
        const gameObserverInfo: ObserversGameInfo = { observersGameSession, gameInfo };

        this.server.to(socket.id).emit(ObserverEvent.GameStart, gameObserverInfo);
        this.server.to(gameSession.roomId).emit(ObserverEvent.ObserversSessionUpdate, observersGameSession);
    }

    handleConnection(socket: Socket) {
        this.clients.set(socket.id, socket);
    }
}
