import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constants } from '@app/interfaces/game-constants';
import { GameConstants } from '@common/game-constants';
import { ExistingGame } from '@common/model/game';
import { History } from '@common/model/history';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    getAllGames(): Observable<ExistingGame[]> {
        return this.http.get<ExistingGame[]>(`${this.baseUrl}/game`).pipe(catchError(this.handleError<ExistingGame[]>('getAllGames')));
    }

    deleteGame(gameId: string) {
        return this.http.delete(`${this.baseUrl}/game/${gameId}`);
    }

    deleteAllGames() {
        return this.http.delete(`${this.baseUrl}/game/`);
    }

    updateConstant(gameConstant: Constants['constantType'], newValue: number): Observable<GameConstants> {
        return this.http
            .patch(`${this.baseUrl}/configuration/constants/${gameConstant}`, { value: newValue })
            .pipe(map((response: unknown) => response as GameConstants));
    }

    getAllConstants(): Observable<GameConstants> {
        return this.http.get(`${this.baseUrl}/configuration/constants`).pipe(map((response: unknown) => response as GameConstants));
    }

    resetAllConstants(): Observable<GameConstants> {
        return this.http.put(`${this.baseUrl}/configuration/constants/reset`, null).pipe(map((response: unknown) => response as GameConstants));
    }

    getHistory(): Observable<History[]> {
        return this.http.get<History[]>(`${this.baseUrl}/configuration/history`).pipe(catchError(this.handleError<History[]>('getHistory')));
    }

    deleteHistory() {
        return this.http.delete(`${this.baseUrl}/configuration/history`);
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
