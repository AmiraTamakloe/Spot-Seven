import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameInfo } from '@app/interfaces/game-info';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { SocketService } from '@app/services/socket/socket.service';
import { GameMode } from '@common/game-mode';
import { ObserverGameSession, ObserversGameInfo } from '@common/interfaces/observer-game-session.interface';
import { ObserverEvent } from '@common/model/events/observer.events';

@Injectable({
    providedIn: 'root',
})
export class ObserverService {
    currentObserverGameSession?: ObserverGameSession;
    observersGameSessions: ObserverGameSession[] = [];

    constructor(private socketService: SocketService, private router: Router, private gameStartService: GameStartService) {
        this.socketService.executeOnSocketCreation({
            next: (isSocketCreated: boolean) => {
                if (isSocketCreated) {
                    this.setupEventListeners();
                }
            },
        });
    }

    fetchObservableGames() {
        this.socketService.send(ObserverEvent.FetchGameSessions);
    }

    setupEventListeners() {
        this.socketService.on(ObserverEvent.GameSessionsUpdate, (observersGameSessions: ObserverGameSession[]) => {
            this.observersGameSessions = observersGameSessions;
        });

        this.socketService.on(ObserverEvent.GameStart, (observersGameInfo: ObserversGameInfo) => {
            const observersGameSession = observersGameInfo.observersGameSession;
            this.currentObserverGameSession = observersGameSession;

            const gameInfo: GameInfo = {
                game: observersGameInfo.gameInfo.game,
                gameMode: observersGameInfo.observersGameSession.gameMode,
                username: '',
                initialTime: observersGameInfo.gameInfo.initialTime,
                hintPenalty: observersGameInfo.gameInfo.hintPenalty,
                differenceFoundBonus: observersGameInfo.gameInfo.differenceFoundBonus,
                otherPlayersUsername: observersGameInfo.gameInfo.usernames,
            };
            this.gameStartService.gameInfo = gameInfo;
            this.gameStartService.isObservingPlayer = true;
            this.gameStartService.observerGameSession = observersGameInfo.observersGameSession;

            if (observersGameSession.gameMode === GameMode.Classic || observersGameSession.gameMode === GameMode.ClassicTeam) {
                this.router.navigate(['/classic']);
            } else {
                this.router.navigate(['/time-limited']);
            }
        });
    }

    joinGameSession(gameSessionId: string) {
        this.socketService.send(ObserverEvent.StartObservingGameSession, gameSessionId);
    }
}
