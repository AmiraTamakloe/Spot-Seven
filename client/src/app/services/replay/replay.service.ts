import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GameInfo } from '@app/interfaces/game-info';
import { GameReplayCommand } from '@app/interfaces/game-replay-command';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { GameReplayCommandFactoryService } from '@app/services/game-replay-command-factory/game-replay-command-factory.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { ModalService } from '@app/services/modal/modal.service';
import { ReplayDto } from '@common/model/dto/replay';
import { GameSessionEvent } from '@common/model/events/game-session.events';
import { ReplayEventDto } from '@common/model/events/replay.events';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ReplayService {
    private readonly baseUrl: string = environment.serverUrl;

    // Needed services
    // eslint-disable-next-line max-params
    constructor(
        private readonly http: HttpClient,
        private readonly modalService: ModalService,
        private readonly gameStartService: GameStartService,
        private readonly gameReplayCommandFactory: GameReplayCommandFactoryService,
    ) {}

    constructAfterGameReplay(classicModeService: ClassicModeService): Observable<GameReplayCommand[]> {
        return this.getAfterGameReplay().pipe(
            map((replayEvents: ReplayEventDto[]) => this.gameReplayCommandFactory.transformReplayEventsToCommands(replayEvents, classicModeService)),
        );
    }

    viewReplay(id: string, classicModeService: ClassicModeService) {
        this.http
            .get<ReplayEventDto[]>(`${this.baseUrl}/replays/${id}`)
            .pipe(catchError(this.handleError<void>('viewReplay')))
            .subscribe((events: ReplayEventDto[] | void) => {
                if (!events) {
                    this.modalService.createInformationModal('Erreur', 'Impossible de charger la partie');
                    return;
                }

                const gameInfo = this.extractGameInfoFromReplay(events);

                if (!gameInfo) {
                    this.modalService.createInformationModal('Erreur', 'Impossible de charger la partie');
                    return;
                }

                const replayCommands = this.gameReplayCommandFactory.transformReplayEventsToCommands(events, classicModeService);

                this.gameStartService.startReplay(replayCommands, gameInfo);
            });
    }

    saveAfterGameReplay(): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/replays/gameReplay`, {}).pipe(catchError(this.handleError<void>('saveReplay')));
    }

    deleteAfterGameReplay(): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/replays/gameReplay`).pipe(catchError(this.handleError<void>('deleteAfterGameReplay')));
    }

    getUserReplays(): Observable<ReplayDto[]> {
        return this.http.get<ReplayDto[]>(`${this.baseUrl}/replays`).pipe(catchError(this.handleError<ReplayDto[]>('getUserReplays')));
    }

    getPublicReplays(): Observable<ReplayDto[]> {
        return this.http.get<ReplayDto[]>(`${this.baseUrl}/replays/all`).pipe(catchError(this.handleError<ReplayDto[]>('getPublicReplays')));
    }

    toggleVisibility(id: string): Observable<void> {
        return this.http.patch<void>(`${this.baseUrl}/replays/${id}`, {}).pipe(catchError(this.handleError<void>('toggleVisibility')));
    }

    deleteReplay(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/replays/${id}`).pipe(catchError(this.handleError<void>('deleteReplay')));
    }

    private extractGameInfoFromReplay(events: ReplayEventDto[]): GameInfo | null {
        const startGameEvent = events.at(0);

        if (startGameEvent?.event !== GameSessionEvent.GameStart) {
            return null;
        }

        return startGameEvent.response as unknown as GameInfo;
    }

    private getAfterGameReplay() {
        return this.http
            .get<ReplayEventDto[]>(`${this.baseUrl}/replays/gameReplay`)
            .pipe(catchError(this.handleError<ReplayEventDto[]>('getAfterGameReplay')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
