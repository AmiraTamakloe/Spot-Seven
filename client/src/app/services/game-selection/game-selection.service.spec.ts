/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ClassicModeComponent } from '@app/pages/classic-mode/classic-mode.component';

import { CommunicationService } from '@app/services/communication/communication.service';
import { SocketService } from '@app/services/socket/socket.service';
import { Difficulty } from '@common/model/difficulty';
import { of } from 'rxjs';
import { GameSelectionService } from './game-selection.service';

import SpyObj = jasmine.SpyObj;

describe('GameSelectionService', () => {
    let service: GameSelectionService;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let socketServiceSpy: SpyObj<SocketService>;
    let mockRouter: SpyObj<Router>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj(SocketService, ['send', 'on']);
        mockRouter = jasmine.createSpyObj(Router, ['navigate']);
        communicationServiceSpy = jasmine.createSpyObj(CommunicationService, ['getAllGames', 'deleteGame']);
        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([{ path: 'classic', component: ClassicModeComponent }])],
            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: Router, useValue: mockRouter },
            ],
        });

        communicationServiceSpy.getAllGames.and.returnValue(
            of([
                {
                    _id: 'oop',
                    name: 'Object Oriented Programming',
                    difficulty: Difficulty.Easy,
                    differencesCount: 5,
                    originalImageFilename: 'strings',
                    modifiedImageFilename: 'string',
                    soloHighScores: [],
                    duelHighScores: [],
                },
                {
                    _id: 'g2',
                    name: 'Game 2',
                    difficulty: Difficulty.Easy,
                    differencesCount: 5,
                    originalImageFilename: 'string',
                    modifiedImageFilename: 'string',
                    soloHighScores: [],
                    duelHighScores: [],
                },
                {
                    _id: 'tialgn',
                    name: 'This is a long game name',
                    difficulty: Difficulty.Easy,
                    differencesCount: 5,
                    originalImageFilename: 'string',
                    modifiedImageFilename: 'string',
                    soloHighScores: [],
                    duelHighScores: [],
                },
                {
                    _id: 'gy',
                    name: 'Game Y',
                    difficulty: Difficulty.Easy,
                    differencesCount: 5,
                    originalImageFilename: 'string',
                    modifiedImageFilename: 'string',
                    soloHighScores: [],
                    duelHighScores: [],
                },
                {
                    _id: 'gx',
                    name: 'Game X',
                    difficulty: Difficulty.Easy,
                    differencesCount: 5,
                    originalImageFilename: 'string',
                    modifiedImageFilename: 'string',
                    soloHighScores: [],
                    duelHighScores: [],
                },
            ]),
        );

        service = TestBed.inject(GameSelectionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // FIXME: fix this test
    // it('setupEventListeners() should listen to GameSessionEvent.GameStart', () => {
    //     const fakeGame = { name: 'test' } as Game;
    //     const startGameSpy = spyOn<any>(service, 'startGame');
    //     socketServiceSpy.on.and.callFake((event: GameSessionEvent, callback) => {
    //         expect(event).toBe(GameSessionEvent.GameStart);
    //         callback(fakeGame as any);
    //     });
    //     service['setupEventListeners']();
    //     expect(service.game).toEqual(fakeGame);
    //     expect(startGameSpy).toHaveBeenCalled();
    // });

    it('should go to the initial value + 1', () => {
        let initialPosition: number = service['gamePagePosition'];
        service.next();
        expect(service['gamePagePosition']).toEqual(initialPosition + 1);
        initialPosition = 0;
        service['gamePagePosition'] = initialPosition;
        service.next();
        expect(service['gamePagePosition']).toEqual(initialPosition + 1);
    });

    it('should go to the initial value - 1', () => {
        service['gamePagePosition'] = 8;
        let initialPosition: number = service['gamePagePosition'];
        service.previous();
        expect(service['gamePagePosition']).toEqual(initialPosition - 1);
        initialPosition = 0;
    });

    it('game position should not be smaller than 0', () => {
        service['gamePagePosition'] = 0;
        service.previous();
        expect(service['gamePagePosition']).toBeGreaterThanOrEqual(0);
    });

    it('isFirstPage should return true if gamePagePosition is 0', () => {
        service['gamePagePosition'] = 0;
        expect(service.isFirstPage()).toBeTruthy();

        service['gamePagePosition'] = 1;
        expect(service.isFirstPage()).toBeFalsy();
    });

    it('last page should return true if 5 games and on 2nd page', () => {
        service['gamePagePosition'] = 1;
        expect(service.isLastPage()).toBeTruthy();
    });

    it('last page should return false if 5 games and on 1nd page', () => {
        service['gamePagePosition'] = 0;
        expect(service.isLastPage()).toBeFalsy();
    });

    it('last page should return true if 4 games and on 1st page', () => {
        communicationServiceSpy.getAllGames.and.returnValue(
            of([
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
                {
                    _id: '3',
                    name: 'This is a long game name',
                    difficulty: Difficulty.Easy,
                    differencesCount: 5,
                    originalImageFilename: 'string',
                    modifiedImageFilename: 'string',
                    soloHighScores: [],
                    duelHighScores: [],
                },
                {
                    _id: '4',
                    name: 'Game Y',
                    difficulty: Difficulty.Easy,
                    differencesCount: 5,
                    originalImageFilename: 'string',
                    modifiedImageFilename: 'string',
                    soloHighScores: [],
                    duelHighScores: [],
                },
            ]),
        );
        service.fetchGames();
        service['gamePagePosition'] = 0;
        expect(service.isLastPage()).toBeTruthy();
    });

    it('delete game should call deleteGame', () => {
        const loadGames = spyOn<any>(service, 'loadGames');
        spyOn(service['games'], 'findIndex').and.callThrough();
        service.deleteGame('gx');
        expect(loadGames).toHaveBeenCalled();
    });
});
