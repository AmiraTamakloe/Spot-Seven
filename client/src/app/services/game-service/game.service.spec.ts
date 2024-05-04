/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DrawInstruction } from '@app/classes/draw-instructions-manager/draw-instructions-manager';
import { DRAW_FREQUENCY } from '@app/classes/draw-instructions-manager/draw-instructions-manager.constants';
import { IMAGE_HEIGHT, IMAGE_WIDTH, MILLISECONDS_IN_ONE_SECOND } from '@app/constants';
import { MouseButton } from '@app/enums/mouse-button';
import { GameInfo } from '@app/interfaces/game-info';
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { CanvasEditorService } from '@app/services/canvas-editor/canvas-editor.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { MusicService } from '@app/services/music/music.service';
import { SocketService } from '@app/services/socket/socket.service';
import { ImageArea } from '@common/enums/image-area';
import { GameMode } from '@common/game-mode';
import { Coordinate } from '@common/model/coordinate';
import { Difficulty } from '@common/model/difficulty';
import { EndGameResultDto } from '@common/model/dto/end-game-result';
import { GameSessionEvent } from '@common/model/events/game-session.events';
import { ExistingGame } from '@common/model/game';
import { GuessResult, ResultType, SessionType } from '@common/model/guess-result';
import { HintType } from '@common/model/hints';

import {
    ERROR_MESSAGE,
    FINGER_HEIGHT,
    FINGER_WIDTH,
    FULL_CIRCLE_TIME,
    RADIUS,
    X_HIGH_EXTREMITY,
    X_LOW_EXTREMITY,
    Y_HIGH_EXTREMITY,
    Y_LOW_EXTREMITY,
} from './game.constants';
import { GameService } from './game.service';
import SpyObj = jasmine.SpyObj;

describe('GameService', () => {
    let service: GameService;
    let modalSpy: SpyObj<MatDialog>;
    let musicSpy: SpyObj<MusicService>;
    let socketServiceSpy: SpyObj<SocketService>;
    let mockRouter: SpyObj<Router>;
    let gameStartServiceSpy: SpyObj<GameStartService>;
    let canvasEditorServiceSpy: SpyObj<CanvasEditorService>;
    let fakeContext: CanvasRenderingContext2D;

    beforeEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        fakeContext = CanvasTestHelper.createCanvas().getContext('2d')!;
        musicSpy = jasmine.createSpyObj(MusicService, ['play']);
        modalSpy = jasmine.createSpyObj(MatDialog, ['open', 'close']);
        mockRouter = jasmine.createSpyObj(Router, ['navigate']);
        socketServiceSpy = jasmine.createSpyObj(SocketService, ['send', 'on', 'once', 'disconnect']);
        gameStartServiceSpy = jasmine.createSpyObj(GameStartService, ['']);
        canvasEditorServiceSpy = jasmine.createSpyObj(CanvasEditorService, [
            'getContexts',
            'getFullImageData',
            'clearCanvas',
            'replacePixels',
            'fillPixels',
            'drawText',
        ]);

        TestBed.configureTestingModule({
            providers: [
                GameService,
                { provide: MatDialog, useValue: modalSpy },
                { provide: MusicService, useValue: musicSpy },
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: Router, useValue: mockRouter },
                { provide: GameStartService, useValue: gameStartServiceSpy },
                { provide: CanvasEditorService, useValue: canvasEditorServiceSpy },
            ],
            imports: [[RouterTestingModule.withRoutes([{ path: '**', component: MainPageComponent }])], ...getTranslocoTestingModules()],
        });

        spyOn(window, 'setInterval');

        service = TestBed.inject(GameService);
        service['endGame'] = () => undefined;
        service['gameInfo'] = {} as GameInfo;

        service.gameInfo['game'] = {
            _id: '1234',
            differencesCount: 3,
            difficulty: Difficulty.Easy,
            duelHighScores: [],
            soloHighScores: [],
            modifiedImageFilename: 'modifiedImageFilename',
            originalImageFilename: 'originalImageFilename',
            name: 'name',
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onError() should make wrong sound and errorMessage', () => {
        spyOn(Date, 'now').and.returnValue(50);

        const audio = new Audio();
        const playSpy = spyOn(audio, 'play');
        spyOn(window, 'Audio').and.returnValue(audio);

        const errorMessageSpy = spyOn<any>(service, 'errorMessage');
        service.onError({ imageArea: ImageArea.MODIFIED, coordinate: { x: 0, y: 0 } });
        expect(playSpy).toHaveBeenCalled();
        expect(errorMessageSpy).toHaveBeenCalledWith(ImageArea.MODIFIED, { x: 0, y: 0 });
        expect(service['throttleEndTimestamp']).toEqual(50 + MILLISECONDS_IN_ONE_SECOND);
    });

    it('reset() should reset all variables', () => {
        service['foundDifferences'] = 2;
        service['cheatModeActivated'] = true;
        const manager = service['drawInstructionsManager'];
        const stopExecutionSpy = spyOn(manager, 'stopExecution');
        const setupCheatModeDrawInstructionsSpy = spyOn<any>(service, 'setupCheatModeDrawInstructions');
        service.reset();
        expect(service['foundDifferences']).toEqual(0);
        expect(service['cheatModeActivated']).toEqual(false);
        expect(service['drawInstructionsManager']).not.toBe(manager);
        expect(setupCheatModeDrawInstructionsSpy).toHaveBeenCalled();
        expect(stopExecutionSpy).toHaveBeenCalled();
    });

    it('saveCheatModeDifferences() should save the differences in attribute', () => {
        const differences = [[{ x: 0, y: 0 }]];
        service.saveCheatModeDifferences(differences);
        expect(service['cheatModeDifferences']).toEqual(differences);
    });

    it('toggleCheatMode() should toggle cheatModeActivated and call setupCheatMode()', () => {
        service['cheatModeActivated'] = false;
        const setupCheatModeSpy = spyOn<any>(service, 'setupCheatMode');
        service.toggleCheatMode();
        expect(service['cheatModeActivated']).toEqual(true);
        expect(setupCheatModeSpy).toHaveBeenCalled();
    });

    it('executeFirstSecondHint() should make a zone of the screen more visible', () => {
        const strokeRectSpy = spyOn(fakeContext, 'strokeRect');

        service['drawInstructionsManager'].instructions = {
            push: (obj: DrawInstruction) => {
                expect(obj.imageArea).toEqual(ImageArea.BOTH);
                expect(obj.executionsLeft).toEqual(MILLISECONDS_IN_ONE_SECOND / DRAW_FREQUENCY);
                obj.action(fakeContext, 0);
            },
        } as DrawInstruction[];

        service['remainingHints'] = 3;
        service.executeFirstSecondHint({ x: 0, y: 0 });
        expect(strokeRectSpy).toHaveBeenCalledWith(0, 0, 320, 240);

        service['remainingHints'] = 2;
        service.executeFirstSecondHint({ x: 480, y: 360 });
        expect(strokeRectSpy).toHaveBeenCalledWith(480, 360, 160, 120);
    });

    it('executeThirdHint() should make an icon ga round the difference', () => {
        const fakeImage = {} as HTMLImageElement;
        const imageSpy = spyOn(window, 'Image').and.returnValue(fakeImage);
        const drawImageSpy = spyOn(fakeContext, 'drawImage');

        service['drawInstructionsManager'].instructions = {
            push: (obj: DrawInstruction) => {
                expect(obj.imageArea).toEqual(ImageArea.BOTH);
                expect(obj.executionsLeft).toEqual(FULL_CIRCLE_TIME / DRAW_FREQUENCY);
                obj.action(fakeContext, 0);
            },
        } as DrawInstruction[];

        service['remainingHints'] = 1;
        service.executeThirdHint({ x: 5, y: 7 });

        expect(imageSpy).toHaveBeenCalledWith();
        // @ts-expect-error Only 5 arguments needed not 9
        expect(drawImageSpy).toHaveBeenCalledWith(fakeImage, 5 + RADIUS, 7, FINGER_WIDTH, FINGER_HEIGHT);
    });

    it('getHint should retrieve a hint from the server', () => {
        socketServiceSpy.send.and.callFake((messageType, data, callback) => {
            expect(messageType).toEqual(GameSessionEvent.UseHint);
            expect(data).toEqual(undefined);
            callback!({
                hintType: HintType.FirstSecond,
                zone: { x: 0, y: 0 },
            } as any);
        });
        const executeFirstSecondHintSpy = spyOn(service, 'executeFirstSecondHint');
        const executeThirdHintSpy = spyOn(service, 'executeThirdHint');

        service.getHint();

        expect(executeFirstSecondHintSpy).toHaveBeenCalledWith({ x: 0, y: 0 });

        socketServiceSpy.send.and.callFake((messageType, data, callback) => {
            expect(messageType).toEqual(GameSessionEvent.UseHint);
            expect(data).toEqual(undefined);
            callback!({
                hintType: HintType.Third,
                position: { x: 2, y: 3 },
            } as any);
        });

        service.getHint();

        expect(executeThirdHintSpy).toHaveBeenCalledWith({ x: 2, y: 3 });
    });

    it('initialize() should initialize with proper informations', () => {
        const game: ExistingGame = {
            _id: 'abcd',
            name: 'Object Oriented Programming',
            difficulty: Difficulty.Easy,
            differencesCount: 5,
            originalImageFilename: 'strings',
            modifiedImageFilename: 'assets/logo/logo.png',
            soloHighScores: [],
            duelHighScores: [],
        };

        const username = 'cap';

        const gameInformation: GameInfo = {
            game,
            username,
            gameMode: GameMode.Classic,
            initialTime: 0,
            hintPenalty: 0,
            differenceFoundBonus: 0,
        };

        Object.defineProperty(gameStartServiceSpy, 'gameInfo', { value: gameInformation, writable: true });

        const setupEventListenersSpy = spyOn<any>(service, 'setupEventListeners');

        service.initializeForGame();
        expect(service.gameInfo['game']).toEqual(game);
        expect(service.gameInfo['username']).toEqual(username);
        expect(service.gameInfo['gameMode']).toEqual(GameMode.Classic);
        expect(setupEventListenersSpy).toHaveBeenCalled();
    });

    it('initialize() should redirect if gameInfo is null', async () => {
        spyOn(service, 'reset');
        Object.defineProperty(gameStartServiceSpy, 'gameInfo', { value: null, writable: true });

        service.initializeForGame();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('setupEventListeners() should trigger differenceFound and endgame', async () => {
        const endGameSpy = spyOn(service, 'endGame');
        const differenceFoundSpy = spyOn<any>(service, 'onDifferenceFound');

        const guessResult: GuessResult = {
            sessionType: SessionType.TimeLimited,
            type: ResultType.Success,
            game: {} as ExistingGame,
        };
        const endGameResultDto: EndGameResultDto = { isWinner: true, isForfeit: false };

        socketServiceSpy.on.and.callFake((event: GameSessionEvent, callback: (data: any) => void) => {
            if (event === GameSessionEvent.DifferenceFound) callback(guessResult);
        });

        socketServiceSpy.once.and.callFake((event: GameSessionEvent, callback: (data: any) => void) => {
            if (event === GameSessionEvent.EndGame) callback(endGameResultDto);
        });

        service['setupEventListeners']();
        expect(endGameSpy).toHaveBeenCalledWith(endGameResultDto);
        expect(differenceFoundSpy).toHaveBeenCalledWith(guessResult, true);
    });

    it('giveUp() should call socketService.send with GiveUp event', () => {
        service.giveUp();
        expect(socketServiceSpy.send).toHaveBeenCalledWith(GameSessionEvent.GiveUp);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('setupCheatMode should retrieve differences and prepare cheat mode', async () => {
        const remainingDifferences = [
            [
                { x: 0, y: 0 },
                { x: 0, y: 1 },
            ],
        ];
        const getRemainingDifferencesSpy = spyOn<any>(service, 'getRemainingDifferences').and.returnValue(Promise.resolve(remainingDifferences));
        const saveCheatModeDifferencesSpy = spyOn<any>(service, 'saveCheatModeDifferences');

        await service['setupCheatMode']();

        expect(getRemainingDifferencesSpy).toHaveBeenCalled();
        expect(saveCheatModeDifferencesSpy).toHaveBeenCalledWith(remainingDifferences);
    });

    it('setupCheatModeDrawInstructions should register cheat mode blink in draw instructions', () => {
        service['drawInstructionsManager']['instructions'] = {
            push: (drawInstruction: DrawInstruction) => {
                expect(drawInstruction.imageArea).toEqual(ImageArea.BOTH);
                expect(drawInstruction.executionsLeft).toBeUndefined();
                drawInstruction.action(fakeContext, 1);
            },
        } as DrawInstruction[];
        service['cheatModeActivated'] = true;
        service['cheatModeDifferences'] = [
            [
                { x: 0, y: 0 },
                { x: 0, y: 1 },
            ],
        ];

        service['setupCheatModeDrawInstructions']();

        expect(canvasEditorServiceSpy.fillPixels).toHaveBeenCalledWith(fakeContext, 'yellow', [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
        ]);
    });

    it('setupCheatModeDrawInstructions should do nothing if cheatModeDifferences is undefined', () => {
        const fillRectSpy = spyOn(fakeContext, 'fillRect');

        service['drawInstructionsManager']['instructions'] = {
            push: (drawInstruction: DrawInstruction) => {
                expect(drawInstruction.imageArea).toEqual(ImageArea.BOTH);
                expect(drawInstruction.executionsLeft).toBeUndefined();
                drawInstruction.action(fakeContext, 1);
            },
        } as DrawInstruction[];
        service['cheatModeActivated'] = true;
        service['cheatModeDifferences'] = undefined;

        service['setupCheatModeDrawInstructions']();

        expect(fillRectSpy).not.toHaveBeenCalled();
    });

    it('handleClick() should return when throttled', async () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        service['throttleEndTimestamp'] = Date.now() + 50;
        await service.handleClick(ImageArea.ORIGINAL, { button: MouseButton.Left, offsetX: 0, offsetY: 0 } as MouseEvent);
        expect(socketServiceSpy.send).not.toHaveBeenCalled();
    });

    it('handleClick() should return if event button is not left click', async () => {
        const event = { button: MouseButton.Right, offsetX: 0, offsetY: 0 } as MouseEvent;
        await service.handleClick(ImageArea.ORIGINAL, event);
        expect(socketServiceSpy.send).not.toHaveBeenCalled();
    });

    it('handleClick() failed guess should call onError', async () => {
        const guessResult: GuessResult = { sessionType: SessionType.Classic, type: ResultType.Failure };

        const onErrorSpy = spyOn<any>(service, 'onError');

        const coordinate: Coordinate = { x: 0, y: 0 };

        socketServiceSpy.send.and.callFake((socketEvent, data, callback) => {
            expect(socketEvent).toEqual(GameSessionEvent.GuessDifference);
            expect(data).toEqual({ imageArea: ImageArea.ORIGINAL, coordinate } as any);
            callback!(guessResult as any);
        });

        const event = { button: MouseButton.Left, offsetX: coordinate.x, offsetY: coordinate.y } as MouseEvent;
        await service.handleClick(ImageArea.ORIGINAL, event);
        expect(onErrorSpy).toHaveBeenCalled();
    });

    it('handleClick() with successful guess should call onDifferenceFound()', async () => {
        const coordinate: Coordinate = { x: 0, y: 0 };
        const guessResult: GuessResult = { sessionType: SessionType.Classic, type: ResultType.Success, difference: 'lol' };
        const event = { button: MouseButton.Left, offsetX: coordinate.x, offsetY: coordinate.y } as MouseEvent;

        const onDifferenceFoundSpy = spyOn<any>(service, 'onDifferenceFound');

        socketServiceSpy.send.and.callFake((socketEvent, data, callback) => {
            expect(socketEvent).toEqual(GameSessionEvent.GuessDifference);
            expect(data).toEqual({ imageArea: ImageArea.ORIGINAL, coordinate } as any);
            callback!(guessResult as any);
        });

        await service.handleClick(ImageArea.ORIGINAL, event);

        expect(onDifferenceFoundSpy).toHaveBeenCalledWith(guessResult);
    });

    it('reposition should adjust coordinate when necessary', () => {
        const coordinate = { x: IMAGE_WIDTH / 2, y: IMAGE_HEIGHT / 2 };
        service['reposition'](coordinate);
        expect(coordinate).toEqual({ x: IMAGE_WIDTH / 2, y: IMAGE_HEIGHT / 2 });

        coordinate.x = X_LOW_EXTREMITY - 5;
        service['reposition'](coordinate);
        expect(coordinate).toEqual({ x: X_LOW_EXTREMITY, y: IMAGE_HEIGHT / 2 });

        coordinate.x = X_HIGH_EXTREMITY + 5;
        service['reposition'](coordinate);
        expect(coordinate).toEqual({ x: X_HIGH_EXTREMITY, y: IMAGE_HEIGHT / 2 });

        coordinate.y = Y_LOW_EXTREMITY - 5;
        service['reposition'](coordinate);
        expect(coordinate).toEqual({ x: X_HIGH_EXTREMITY, y: Y_LOW_EXTREMITY });

        coordinate.y = Y_HIGH_EXTREMITY + 5;
        service['reposition'](coordinate);
        expect(coordinate).toEqual({ x: X_HIGH_EXTREMITY, y: Y_HIGH_EXTREMITY });
    });

    it('blinkGoodPixels should make pixels blink red half of the time', async () => {
        service['drawInstructionsManager']['instructions'] = {
            push: (obj: DrawInstruction) => {
                expect(obj.imageArea).toEqual(ImageArea.BOTH);
                expect(obj.executionsLeft).toEqual(MILLISECONDS_IN_ONE_SECOND / DRAW_FREQUENCY);
                obj.action(fakeContext, 0);
            },
        } as DrawInstruction[];

        const coords = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];

        await service['blinkGoodPixels'](coords);

        expect(canvasEditorServiceSpy.fillPixels).toHaveBeenCalledWith(fakeContext, 'red', coords);
    });

    it('blinkGoodPixels should make pixels blink green half of the time', async () => {
        service['drawInstructionsManager']['instructions'] = {
            push: (obj: DrawInstruction) => {
                expect(obj.imageArea).toEqual(ImageArea.BOTH);
                expect(obj.executionsLeft).toEqual(MILLISECONDS_IN_ONE_SECOND / DRAW_FREQUENCY);
                obj.action(fakeContext, 1);
            },
        } as DrawInstruction[];

        const coords = [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
        ];

        await service['blinkGoodPixels'](coords);

        expect(canvasEditorServiceSpy.fillPixels).toHaveBeenCalledWith(fakeContext, 'green', coords);
    });

    it('errorMessage() should write an error message for 1 second', async () => {
        const repositionSpy = spyOn<any>(service, 'reposition');

        const coordinate = { x: 10, y: 20 };
        service['drawInstructionsManager']['instructions'] = {
            push: (obj: DrawInstruction) => {
                expect(obj.imageArea).toEqual(ImageArea.ORIGINAL);
                expect(obj.executionsLeft).toEqual(MILLISECONDS_IN_ONE_SECOND / DRAW_FREQUENCY);
                obj.action(fakeContext, 0);
            },
        } as DrawInstruction[];

        service['errorMessage'](ImageArea.ORIGINAL, coordinate);

        expect(canvasEditorServiceSpy.drawText).toHaveBeenCalledWith(fakeContext, { text: ERROR_MESSAGE, position: coordinate, color: 'red' });
        expect(repositionSpy).toHaveBeenCalledWith(coordinate);
    });

    it('loadImages() should call imageContext.draw', () => {
        const fakeImage = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            addEventListener: (_: any, action: any) => {
                action();
            },
        } as HTMLImageElement;
        spyOn(window, 'Image').and.returnValue(fakeImage);
        const imageContext = CanvasTestHelper.createCanvas(service.width, service.height).getContext('2d')!;
        const drawSpy = spyOn(imageContext, 'drawImage');
        spyOn(service['actionImageSubject'], 'next').and.callFake(async (canvasAction) => {
            canvasAction.action(imageContext);
        });

        service['loadImages']();
        expect(drawSpy).toHaveBeenCalled();
    });

    it('blinkAndReplacePixels() should call blinkGoodPixels', async () => {
        const blinkGoodSpy = spyOn<any>(service, 'blinkGoodPixels');
        const differences = [{ x: 0, y: 0 }];

        canvasEditorServiceSpy.getContexts.and.returnValue(
            Promise.resolve({
                leftContext: fakeContext,
                rightContext: fakeContext,
            }),
        );

        await service['blinkAndReplacePixels'](differences);

        expect(blinkGoodSpy).toHaveBeenCalledWith(differences);
        expect(canvasEditorServiceSpy.replacePixels).toHaveBeenCalled();
    });

    it('onDifferenceFound should call make a good sound', async () => {
        const audio = new Audio();
        const playSpy = spyOn(audio, 'play');
        const audioSpy = spyOn(window, 'Audio').and.returnValue(audio);
        service['foundDifferences'] = 0;
        const guessResult = {} as GuessResult;
        await service['onDifferenceFound'](guessResult);
        expect(audioSpy).toHaveBeenCalled();
        expect(playSpy).toHaveBeenCalled();
    });

    it('getRemainingDifferences should return remaining differences from socket service', async () => {
        const remainingDifferences = [[{ x: 0, y: 0 }]];
        socketServiceSpy.send.and.callFake((event, data, callback) => {
            expect(event).toEqual(GameSessionEvent.RemainingDifferences);
            expect(data).toEqual(undefined);
            callback!(remainingDifferences as any);
        });
        const result = await service['getRemainingDifferences']();
        expect(result).toEqual(remainingDifferences);
    });
});
