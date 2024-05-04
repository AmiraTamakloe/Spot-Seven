import { HttpClient, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Constants } from '@app/interfaces/game-constants';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameConstants } from '@common/game-constants';
import { GameMode } from '@common/game-mode';
import { Difficulty } from '@common/model/difficulty';
import { ExistingGame } from '@common/model/game';
import { History } from '@common/model/history';
import { of } from 'rxjs';

describe('CommunicationService', () => {
    const allGamesMock: ExistingGame[] = [
        {
            _id: '1',
            name: 'Object Oriented Programming',
            difficulty: Difficulty.Easy,
            differencesCount: 5,
            originalImageFilename: 'strings',
            modifiedImageFilename: 'string',
            soloHighScores: [],
            duelHighScores: [],
        },
        {
            _id: '2',
            name: 'Game 2',
            difficulty: Difficulty.Easy,
            differencesCount: 5,
            originalImageFilename: 'string',
            modifiedImageFilename: 'string',
            soloHighScores: [],
            duelHighScores: [],
        },
    ];

    const historyMock: History[] = [
        {
            gameStart: Date.now(),
            gameTime: 5,
            gameMode: GameMode.Classic,
            players: ['player'],
        },
        {
            gameStart: Date.now(),
            gameTime: 5,
            gameMode: GameMode.ClassicTeam,
            players: ['player'],
            isWinner: 0,
            hasAbandonned: 1,
        },
    ];

    let httpMock: HttpTestingController;
    let service: CommunicationService;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getAllGames should return all games', () => {
        service.getAllGames().subscribe((games: ExistingGame[]) => {
            expect(games).toEqual(allGamesMock);
        });

        const req = httpMock.expectOne(`${baseUrl}/game`);

        expect(req.request.method).toEqual('GET');

        req.flush(allGamesMock);
    });

    it('should handle an http error safely', () => {
        service.getAllGames().subscribe({
            next: (games: ExistingGame[]) => {
                expect(games).toBeUndefined();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game`);
        expect(req.request.method).toBe('GET');
        req.error(new ProgressEvent('Random error occurred'));
    });

    it('deleteGame should return no content on success', () => {
        const deleteGameResponse: HttpResponse<unknown> = new HttpResponse({ status: HttpStatusCode.NoContent });
        const id = 'BestGameEver';
        service.deleteGame(id).subscribe({
            next: (object) => {
                expect(object).toEqual(deleteGameResponse);
            },
        });
        const req = httpMock.expectOne(`${baseUrl}/game/${id}`);

        expect(req.request.method).toEqual('DELETE');

        req.flush(deleteGameResponse);
    });

    it('deleteAllGames should return no content on success', () => {
        const deleteAllGamesResponse: HttpResponse<unknown> = new HttpResponse({ status: HttpStatusCode.NoContent });
        service.deleteAllGames().subscribe({
            next: (object) => {
                expect(object).toEqual(deleteAllGamesResponse);
            },
        });
        const req = httpMock.expectOne(`${baseUrl}/game/`);

        expect(req.request.method).toEqual('DELETE');

        req.flush(deleteAllGamesResponse);
    });

    it('should update a constant', () => {
        const constant: Constants = {
            constantType: 'initialTime',
            value: 120,
        };

        const expectedResponse: GameConstants = {
            initialTime: 120,
            hintPenalty: 5,
            differenceFoundBonus: 5,
        };

        service.updateConstant(constant.constantType, constant.value).subscribe((response) => {
            expect(response).toEqual(expectedResponse);
        });

        const req = httpMock.expectOne(`${baseUrl}/configuration/constants/${constant.constantType}`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual({ value: constant.value });

        req.flush(expectedResponse);
        httpMock.verify();
    });

    it('should get all constants', () => {
        const mockResponse: GameConstants = {
            initialTime: 30,
            hintPenalty: 5,
            differenceFoundBonus: 5,
        };
        const httpSpy = spyOn(TestBed.inject(HttpClient), 'get').and.returnValue(of(mockResponse));

        service.getAllConstants().subscribe((constants) => {
            expect(constants).toEqual(mockResponse);
        });

        expect(httpSpy).toHaveBeenCalledWith(`${baseUrl}/configuration/constants`);
    });
    it('should reset all constants', () => {
        const expectedResponse: GameConstants = {
            initialTime: 30,
            hintPenalty: 5,
            differenceFoundBonus: 5,
        };

        service.resetAllConstants().subscribe((response) => {
            expect(response).toEqual(expectedResponse);
        });

        const req = httpMock.expectOne(`${baseUrl}/configuration/constants/reset`);
        expect(req.request.method).toBe('PUT');

        req.flush(expectedResponse);
        httpMock.verify();
    });

    it('getHistory should return the game history', () => {
        service.getHistory().subscribe((history: History[]) => {
            expect(history).toEqual(historyMock);
        });

        const req = httpMock.expectOne(`${baseUrl}/configuration/history`);

        expect(req.request.method).toEqual('GET');

        req.flush(historyMock);
    });

    it('deleteHistory should return no content on success', () => {
        const deleteHistoryResponse: HttpResponse<unknown> = new HttpResponse({ status: HttpStatusCode.NoContent });
        service.deleteHistory().subscribe({
            next: (object) => {
                expect(object).toEqual(deleteHistoryResponse);
            },
        });
        const req = httpMock.expectOne(`${baseUrl}/configuration/history`);

        expect(req.request.method).toEqual('DELETE');

        req.flush(deleteHistoryResponse);
    });
});
