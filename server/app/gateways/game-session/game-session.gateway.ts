/* eslint-disable max-lines */
// FIXME: remove disable
import { GATEWAY_CONFIGURATION_OBJECT } from '@app/gateways/gateway.constants';
import { ReplayInterceptor } from '@app/interceptors/replay/replay.interceptor';
import { ClassicSession } from '@app/model/classes/game-sessions/classic-session/classic-session';
import { Coordinate } from '@app/model/dto/coordinate.dto';
import { GameSession, PlayerData } from '@app/model/schema/game-session';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { GameService } from '@app/services/game/game.service';
import { HintService } from '@app/services/hints/hint.service';
import { WSValidationPipe } from '@app/validation-pipes/web-socket/web-socket.validation-pipe';
import { ObserverGameSession } from '@common/interfaces/observer-game-session.interface';
import { ConfigurationEvent } from '@common/model/events/configuration.events';
import { GameSessionEvent } from '@common/model/events/game-session.events';
import { ObserverEvent } from '@common/model/events/observer.events';
import { Guess } from '@common/model/guess';
import { GuessResult, ResultType } from '@common/model/guess-result';
import { Hint, HintType, RemainingHints } from '@common/model/hints';
import { ChatMessage } from '@common/model/message';
import { Injectable, Logger, UseInterceptors, UsePipes } from '@nestjs/common';
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
@UseInterceptors(ReplayInterceptor)
export class GameSessionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;
    private clients: Map<string, Socket>;

    constructor(private gameService: GameService, private hintService: HintService, private gameManagerService: GameManagerService) {
        this.clients = new Map();
        this.gameService.gameDeletedObservable.subscribe((deletedGameId: string) => {
            this.server.emit(ConfigurationEvent.GameWasDeleted, deletedGameId);
        });
    }

    @SubscribeMessage(GameSessionEvent.Message)
    message(@ConnectedSocket() socket: Socket, @MessageBody() message: ChatMessage): void {
        socket.broadcast.emit(GameSessionEvent.Message, message);
    }

    @SubscribeMessage(GameSessionEvent.UseHint)
    useHint(@ConnectedSocket() socket: Socket): Hint {
        const rooms = Array.from(socket.rooms.values());
        const gameSession = this.gameManagerService.getGameSession(rooms);

        const differences = this.gameManagerService.getRemainingDifferencesArray(gameSession).flat();
        const randomDifference = this.hintService.getRandomCoordinate(differences);

        const player = gameSession.players.get(socket.id);
        if (!player) {
            throw new WsException('There is no playerData in this game');
        }

        if (player.remainingHints === 0) {
            throw new WsException('You have no hints left');
        }

        gameSession.useHintMalus();

        let hintInfo: Hint;
        if (player.remainingHints === RemainingHints.OneHintLeft) {
            hintInfo = { position: randomDifference, hintType: HintType.Third };
        } else {
            hintInfo = this.hintService.calculateZone(player.remainingHints, randomDifference);
        }
        player.remainingHints--;
        return hintInfo;
    }

    @SubscribeMessage(GameSessionEvent.GuessDifference)
    async guessDifference(@ConnectedSocket() socket: Socket, @MessageBody() guess: Guess): Promise<GuessResult> {
        const coordinate = guess.coordinate;
        const gameSession = this.gameManagerService.getPlayerGameSession(socket.id);
        const observerGameSession = this.gameManagerService.getObserversGameSession(gameSession.roomId);

        const guessResult = await gameSession.manageClick(new Coordinate(coordinate.x, coordinate.y), socket.id);
        if (guessResult.type === ResultType.Failure) {
            return guessResult;
        }

        socket.to([gameSession.roomId, observerGameSession.observersRoomId]).emit(GameSessionEvent.DifferenceFound, guessResult);

        observerGameSession.currentDifferencesFound.push(guessResult);
        this.gameManagerService.updateObserverGameSession(observerGameSession);

        const winner = gameSession.getWinner(socket.id);
        if (winner) {
            if (gameSession instanceof ClassicSession) {
                await this.gameManagerService.manageClassicEndGame(gameSession, socket.id, this.server);
            } else {
                this.gameManagerService.manageTimeLimitedEndGame(gameSession, this.server, true);
            }
            this.updateGame(gameSession, socket);
        }

        return guessResult;
    }

    @SubscribeMessage(GameSessionEvent.RemainingDifferences)
    remainingDifferences(@ConnectedSocket() socket: Socket): Coordinate[][] {
        const gameSession = this.gameManagerService.getPlayerGameSession(socket.id);
        return this.gameManagerService.getRemainingDifferencesArray(gameSession);
    }

    @SubscribeMessage(GameSessionEvent.GiveUp)
    giveUp(@ConnectedSocket() socket: Socket): void {
        const gameSession = this.gameManagerService.getPlayerGameSession(socket.id);
        const observersGameSession = this.gameManagerService.getObserversGameSession(gameSession.roomId);

        const player: PlayerData | undefined = gameSession.players.get(socket.id);
        if (!player) {
            const observerFound = observersGameSession.currentObservers.find((foundPlayer) => foundPlayer.socketId === socket.id);
            if (observerFound) {
                this.handleObserverGivingUp(socket, observersGameSession, gameSession);
                return;
            }
        }

        if (!player) throw new WsException('Player is not in game');

        if (gameSession instanceof ClassicSession) {
            if (!gameSession.isMultiplayer()) {
                this.gameManagerService.manageClassicEndGame(gameSession, socket.id, this.server, socket.id);
                this.updateGame(gameSession, socket);
            } else {
                for (const id of gameSession.players.keys()) {
                    if (id !== socket.id) this.gameManagerService.manageClassicEndGame(gameSession, id, this.server, socket.id);
                }
                this.updateGame(gameSession, socket);
            }
            socket.to([gameSession.roomId, observersGameSession.observersRoomId]).emit(GameSessionEvent.EndGame, { isWinner: true, isForfeit: true });
        } else {
            if (gameSession.isMultiplayer()) {
                this.server
                    .to([gameSession.roomId, observersGameSession.observersRoomId])
                    .emit(GameSessionEvent.EndGame, { isWinner: false, isForfeit: true });
                this.gameManagerService.deletePlayerGameSession(socket.id);
                try {
                    this.gameManagerService.quitGameChat(socket.id, this.server, gameSession.chatId);
                } catch (error) {
                    Logger.error(error);
                }
            } else {
                socket.to(observersGameSession.observersRoomId).emit(GameSessionEvent.EndGame, { isWinner: true, isForfeit: true });
                this.updateGame(gameSession, socket);
            }
        }
    }

    handleConnection(socket: Socket) {
        this.clients.set(socket.id, socket);
    }

    handleDisconnect(socket: Socket) {
        if (this.gameManagerService.isPlayerInGameSession(socket.id)) {
            this.giveUp(socket);
        }
        this.gameManagerService.deleteGameSession(Array.from(socket.rooms.values()));
        this.gameManagerService.deletePlayerGameSession(socket.id);

        try {
            const chatId = this.gameManagerService.getPlayerGameSession(socket.id).chatId;
            this.gameManagerService.quitGameChat(socket.id, this.server, chatId);
        } catch (error) {
            Logger.error(error);
        }

        this.clients.delete(socket.id);
    }

    private handleObserverGivingUp(socket: Socket, observersGameSession: ObserverGameSession, gameSession: GameSession) {
        observersGameSession.currentObservers = observersGameSession.currentObservers.filter((player) => player.socketId !== socket.id);
        this.gameManagerService.deleteSocketGameSession(socket.id);
        this.gameManagerService.updateObserverGameSession(observersGameSession);
        socket.leave(observersGameSession.observersRoomId);

        const observersGameSessions = this.gameManagerService.getObserversGameSessions();
        this.server.emit(ObserverEvent.GameSessionsUpdate, observersGameSessions);

        this.server.to(gameSession.roomId).emit(ObserverEvent.ObserversSessionUpdate, observersGameSession);
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
