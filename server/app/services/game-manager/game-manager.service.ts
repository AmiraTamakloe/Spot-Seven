/* eslint-disable max-lines */
import { OBSERVERS_PREFIX } from '@app/constants/game-session.constants';
import { ClassicWaitingRoom, TimeLimitedWaitingRoom } from '@app/interfaces/waiting-room/waiting-room.interface';
import { ClassicSession } from '@app/model/classes/game-sessions/classic-session/classic-session';
import { SECOND_IN_MILLISECONDS } from '@app/model/classes/game-sessions/game-session.constants';
import { TimeLimitedSession } from '@app/model/classes/game-sessions/time-limited-session/time-limited-session';
import { Coordinate } from '@app/model/dto/coordinate.dto';
import { GameSession } from '@app/model/schema/game-session';
import { DifferencesService } from '@app/services/differences/differences.service';
import { GameConstantsService } from '@app/services/game-constants/game-constants.service';
import { GameHistoryService } from '@app/services/game-history/game-history.service';
import { GameService } from '@app/services/game/game.service';
import { MessageFormatterService } from '@app/services/message-formatter/message-formatter.service';
import { ReplayService } from '@app/services/replay/replay.service';
import { StatisticService } from '@app/services/statistics/statistic.service';
import { WaitingRoomService } from '@app/services/waiting-room/waiting-room.service';
import { GameMode } from '@common/game-mode';
import { ObserverGameSession } from '@common/interfaces/observer-game-session.interface';
import { EndGameResultDto } from '@common/model/dto/end-game-result';
import { GameSessionEvent } from '@common/model/events/game-session.events';
import { GameInfo } from '@common/model/game-info';
import { Position } from '@common/model/message';
import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { Server, Socket } from 'socket.io';
import { ChatService } from '@app/services/chat/chat.service';
import { ClassicTeamSession } from '@app/model/classes/game-sessions/classic-team-session/classic-team-session';

@Injectable()
export class GameManagerService {
    private roomIdToGameSession: Map<string, GameSession>;
    private roomIdToObserversGameSession: Map<string, ObserverGameSession>;

    // NOTE: For now, Observer socket id is in this map
    private socketIdToGameSession: Map<string, GameSession>;

    // eslint-disable-next-line max-params
    constructor(
        public differencesService: DifferencesService,
        private gameService: GameService,
        private messageFormatterService: MessageFormatterService,
        private gameConstantsService: GameConstantsService,
        private waitingRoomService: WaitingRoomService,
        private gameHistoryService: GameHistoryService,
        private replayService: ReplayService,
        private statisticsService: StatisticService,
        private chatService: ChatService,
    ) {
        this.roomIdToGameSession = new Map();
        this.roomIdToObserversGameSession = new Map();
        this.socketIdToGameSession = new Map();
    }

    setPlayerGameSession(socketId: string, gameSession: GameSession) {
        this.socketIdToGameSession.set(socketId, gameSession);
    }

    getObserversGameSessions() {
        return Array.from(this.roomIdToObserversGameSession.values());
    }

    getPlayerGameSession(socketId: string): GameSession {
        const gameSession = this.socketIdToGameSession.get(socketId);
        if (!gameSession) {
            throw new WsException('No gameSession attached to this socket');
        }
        return gameSession;
    }

    isPlayerInGameSession(socketId: string): boolean {
        const gameSession = this.socketIdToGameSession.get(socketId);
        return gameSession !== undefined;
    }

    deletePlayerGameSession(socketId: string) {
        const gameSession = this.socketIdToGameSession.get(socketId);
        if (!gameSession) {
            return;
        }
        if (gameSession.players.get(socketId)) {
            gameSession.players.delete(socketId);
        }

        this.socketIdToGameSession.delete(socketId);
    }

    quitGameChat(socketId: string, server: Server, chatId: string) {
        this.chatService.leaveGameChat(chatId, socketId, server);
    }

    deleteSocketGameSession(socketId: string) {
        this.socketIdToGameSession.delete(socketId);
    }

    getGameSession(roomIds: string[]): GameSession {
        for (const id of roomIds) {
            const gameSession = this.roomIdToGameSession.get(id);
            if (gameSession) {
                return gameSession;
            }
        }

        throw new WsException('No gameSession attached to this socket');
    }

    getObserversGameSession(gameSessionRoomId: string) {
        const observersGameSession = this.roomIdToObserversGameSession.get(gameSessionRoomId);
        if (observersGameSession) return observersGameSession;

        throw new WsException('No observers game session was found for this game session room id');
    }

    deleteGameSession(roomIds: string[]): void {
        for (const id of roomIds) {
            if (this.roomIdToGameSession.get(id)) {
                this.roomIdToGameSession.delete(id);
                this.roomIdToObserversGameSession.delete(id);
            }
        }
    }

    async deleteGameChat(chatId: string, server: Server, socket: Socket) {
        await this.chatService.deleteGameChat(chatId, server, socket);
    }

    kickOutObservers(gameSessionId: string) {
        const observerGameSession = this.roomIdToObserversGameSession.get(gameSessionId);
        if (!observerGameSession) return;
        for (const observer of observerGameSession.currentObservers) {
            this.deletePlayerGameSession(observer.socketId);
        }
        this.roomIdToObserversGameSession.delete(observerGameSession.gameRoomId);
    }

    setObserverGameSession(gameSession: ClassicSession | TimeLimitedSession, gameMode: GameMode) {
        const observerGameSession: ObserverGameSession = {
            gameRoomId: gameSession.roomId,
            observersRoomId: OBSERVERS_PREFIX + gameSession.roomId,
            gameName: gameSession.game ? gameSession.game.name : '',
            gameMode,
            currentObservers: [],
            currentDifferencesFound: [],
        };
        this.roomIdToObserversGameSession.set(gameSession.roomId, observerGameSession);
    }

    updateObserverGameSession(updatedObserverGameSession: ObserverGameSession) {
        this.roomIdToObserversGameSession.set(updatedObserverGameSession.gameRoomId, updatedObserverGameSession);
    }

    async createClassicSession(waitingRoom: ClassicWaitingRoom): Promise<ClassicSession> {
        const gameConstants = await this.gameConstantsService.getAll();
        let gameSession: ClassicSession;
        if (waitingRoom.gameMode === GameMode.Classic) {
            gameSession = new ClassicSession(this.differencesService, waitingRoom, gameConstants);
        } else {
            gameSession = new ClassicTeamSession(this.differencesService, waitingRoom, gameConstants);
        }
        this.roomIdToGameSession.set(gameSession.roomId, gameSession);
        this.setObserverGameSession(gameSession, waitingRoom.gameMode);
        return gameSession;
    }

    async createTimeLimitedSession(waitingRoom: TimeLimitedWaitingRoom): Promise<TimeLimitedSession> {
        const games = await this.gameService.getGames();
        const gameConstants = await this.gameConstantsService.getAll();
        const gameSession = new TimeLimitedSession(
            this.gameService,
            this.differencesService,
            waitingRoom,
            games,
            gameConstants,
            waitingRoom.gameMode === GameMode.TimeLimitedImproved,
        );
        await gameSession.getRandomGame();
        const gameMode: GameMode = GameMode.TimeLimited;

        this.roomIdToGameSession.set(gameSession.roomId, gameSession);
        this.setObserverGameSession(gameSession, gameMode);

        return gameSession;
    }

    async manageTimeLimitedEndGame(gameSession: GameSession, server: Server, isWinning: boolean) {
        const timerScoreMil = Date.now() - gameSession.startedTime;
        const timeScore = Math.floor(timerScoreMil / SECOND_IN_MILLISECONDS);
        if (gameSession && gameSession.players) {
            // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
            gameSession.players.forEach((playerData, socketId) => {
                if (playerData && timeScore) {
                    this.statisticsService.createStatisticEntry(playerData.username, timeScore, true, playerData.differencesFound);
                }
            });
        }
        const observerGameSession = this.getObserversGameSession(gameSession.roomId);

        server
            .to([gameSession.roomId, observerGameSession.observersRoomId])
            .emit(GameSessionEvent.EndGame, { isWinner: isWinning, isForfeit: false });
        await this.createGameHistory(gameSession, timeScore, '');
    }

    // eslint-disable-next-line max-params
    async manageClassicEndGame(gameSession: GameSession, winnerId: string, server: Server, playerGivingUpId?: string): Promise<void> {
        const game = gameSession.game;
        if (winnerId === '') {
            let maxScore = -1;
            for (const [playerId, eachPlayerData] of gameSession.players) {
                if (eachPlayerData.differencesFound > maxScore) {
                    maxScore = eachPlayerData.differencesFound;
                    winnerId = playerId;
                }
            }
        }
        const playerData = gameSession.players.get(winnerId);

        if (!playerData) {
            throw new WsException('No player at this socket id somehow');
        }

        // FIXME: Add bonus/malus to the time score.
        const timeScoreMil = Date.now() - gameSession.startedTime;
        const timeScore = Math.floor(timeScoreMil / SECOND_IN_MILLISECONDS);

        if (playerGivingUpId) {
            const playerGivingUpData = gameSession.players.get(playerGivingUpId);
            if (playerGivingUpData && timeScore) {
                await this.statisticsService.createStatisticEntry(playerGivingUpData.username, timeScore, false, playerGivingUpData.differencesFound);
            }
            await this.createGameHistory(gameSession, timeScore, winnerId, playerGivingUpId);
            return;
        }

        const highScores = gameSession.isMultiplayer() ? game.duelHighScores : game.soloHighScores;
        let position: Position | undefined;
        // FIXME: Entries
        for (const [index, highScore] of highScores.entries()) {
            if (timeScore < highScore.time) {
                highScores.splice(index, 0, {
                    playerName: playerData.username,
                    time: timeScore,
                });
                highScores.pop();
                await this.gameService.updateGame(game._id as string, gameSession.isMultiplayer(), highScores);

                position = [Position.First, Position.Second, Position.Third][index];
                break;
            }
        }

        const observerGameSession = this.getObserversGameSession(gameSession.roomId);
        server.to(observerGameSession.observersRoomId).emit(GameSessionEvent.EndGame, { isWinner: false, isForfeit: false });
        for (const socketId of gameSession.players.keys()) {
            const endGameResult: EndGameResultDto = { isWinner: winnerId === socketId, isForfeit: false };
            if (winnerId === socketId) endGameResult.recordBeaten = position;
            server.to(socketId).emit(GameSessionEvent.EndGame, endGameResult);
            this.replayService.saveGameEvent(socketId, GameSessionEvent.EndGame, null, endGameResult);
        }
        if (gameSession && gameSession.players) {
            gameSession.players.forEach((playerDataValues, socketId) => {
                const isWinner = winnerId === socketId;
                if (playerData && timeScore && isWinner) {
                    this.statisticsService.createStatisticEntry(playerDataValues.username, timeScore, isWinner, playerDataValues.differencesFound);
                }
            });
        }

        await this.createGameHistory(gameSession, timeScore, winnerId);
    }

    generateGameInfo(gameSession: GameSession): GameInfo {
        return {
            sessionId: randomUUID(),
            game: gameSession.game,
            initialTime: gameSession.initialTime,
            hintPenalty: gameSession.hintPenalty,
            differenceFoundBonus: gameSession.differenceFoundBonus,
            usernames: [...gameSession.players.values()].map((player) => player.username),
        };
    }

    getRemainingDifferencesArray(gameSession: GameSession): Coordinate[][] {
        return gameSession.differences.map((hashSet) => [...hashSet].map((hash) => Coordinate.fromHash(hash)));
    }

    // eslint-disable-next-line max-params
    async createGameHistory(gameSession: GameSession, timeScore: number, winnerId: string, playerGaveUpId?: string): Promise<void> {
        const playerNames = [...gameSession.players.values()].map((player) => player.username);

        const winner = gameSession.players.get(winnerId);
        const isWinnerIndex = winner ? playerNames.indexOf(winner.username) : undefined;

        let hasAbandonnedIndex;
        if (playerGaveUpId) {
            const playerGaveUp = gameSession.players.get(playerGaveUpId);
            hasAbandonnedIndex = playerGaveUp ? playerNames.indexOf(playerGaveUp.username) : undefined;
        }

        let gameMode;
        if (gameSession instanceof ClassicSession) {
            gameMode = gameSession.isMultiplayer() ? GameMode.Classic : GameMode.ClassicTeam;
        } else {
            gameMode = gameSession.isMultiplayer() ? GameMode.TimeLimited : GameMode.TimeLimitedImproved;
        }

        await this.gameHistoryService.createGameHistory({
            gameStart: gameSession.startedTime,
            gameTime: timeScore,
            gameMode,
            players: playerNames,
            isWinner: gameSession.isMultiplayer() ? isWinnerIndex : undefined,
            hasAbandonned: hasAbandonnedIndex,
        });
    }
}
