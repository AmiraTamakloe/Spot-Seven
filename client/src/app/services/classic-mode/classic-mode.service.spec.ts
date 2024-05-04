/* eslint-disable no-import-assign */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Replay } from '@app/classes/replay/replay';
import { MouseButton } from '@app/enums/mouse-button';
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';
import { ClassicModeComponent } from '@app/pages/classic-mode/classic-mode.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { CanvasEditorService } from '@app/services/canvas-editor/canvas-editor.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { MessageService } from '@app/services/message/message.service';
import { ModalService } from '@app/services/modal/modal.service';
import { ReplayService } from '@app/services/replay/replay.service';
import { MusicService } from '@app/services/music/music.service';
import { SocketService } from '@app/services/socket/socket.service';
import { ButtonStubComponent } from '@app/stubs/button.component.stub';
import { ImageAreaGameStubComponent } from '@app/stubs/image-area-game.component.stub';
import { MessageBarStubComponent } from '@app/stubs/message-bar.component.stub';
import { TimerStubComponent } from '@app/stubs/timer.component.stub';
import { ImageArea } from '@common/enums/image-area';
import { EndGameResultDto } from '@common/model/dto/end-game-result';
import { GuessResultClassic, ResultType } from '@common/model/guess-result';
import { Position } from '@common/model/message';
import { ClassicModeService } from './classic-mode.service';
import SpyObj = jasmine.SpyObj;

describe('ClassicModeService', () => {
    let service: ClassicModeService;
    let socketServiceSpy: SpyObj<SocketService>;
    let mockRouter: SpyObj<Router>;
    let messageSpy: SpyObj<MessageService>;
    let gameStartServiceSpy: SpyObj<GameStartService>;
    let canvasEditorServiceSpy: SpyObj<CanvasEditorService>;
    let modalServiceSpy: SpyObj<ModalService>;
    let replayServiceSpy: SpyObj<ReplayService>;
    let musicServiceSpy: SpyObj<MusicService>;

    beforeEach(() => {
        messageSpy = jasmine.createSpyObj(MessageService, ['addMessage']);
        musicServiceSpy = jasmine.createSpyObj(MusicService, ['playWinningSoundEffect']);
        mockRouter = jasmine.createSpyObj(Router, ['navigate']);
        socketServiceSpy = jasmine.createSpyObj(SocketService, ['send', 'on', 'once']);
        gameStartServiceSpy = jasmine.createSpyObj(GameStartService, ['']);
        canvasEditorServiceSpy = jasmine.createSpyObj(CanvasEditorService, ['getContexts', 'getFullImageData', 'fillPixels', 'replacePixels']);
        modalServiceSpy = jasmine.createSpyObj(ModalService, ['createEndGameModal']);
        replayServiceSpy = jasmine.createSpyObj(ReplayService, ['deleteAfterGameReplay', 'constructAfterGameReplay']);

        TestBed.configureTestingModule({
            declarations: [ClassicModeComponent, ButtonStubComponent, ImageAreaGameStubComponent, TimerStubComponent, MessageBarStubComponent],
            providers: [
                ClassicModeService,
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: Router, useValue: mockRouter },
                { provide: MusicService, useValue: musicServiceSpy },
                { provide: MessageService, useValue: messageSpy },
                { provide: GameStartService, useValue: gameStartServiceSpy },
                { provide: CanvasEditorService, useValue: canvasEditorServiceSpy },
                { provide: ModalService, useValue: modalServiceSpy },
                { provide: ReplayService, useValue: replayServiceSpy },
            ],
            imports: [RouterTestingModule.withRoutes([{ path: '**', component: MainPageComponent }]), ...getTranslocoTestingModules()],
        });

        spyOn(window, 'setInterval');
        service = TestBed.inject(ClassicModeService);
        service['gameInfo'] = {} as any;
        spyOn(service, 'ngOnDestroy');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onDifferenceFound should blink pixels and remove difference from cheat mode', async () => {
        const differences = [[{ x: 0, y: 0 }], [{ x: 1, y: 1 }], [{ x: 2, y: 2 }]];
        const decodeDifferenceSpy = spyOn<any>(service, 'decodeDifference').and.returnValue(differences[0]);
        const blinkAndReplaceSpy = spyOn<any>(service, 'blinkAndReplacePixels');
        const parentMethodSpy = spyOn(Object.getPrototypeOf(ClassicModeService).prototype, 'onDifferenceFound');
        service['cheatModeDifferences'] = [...differences];
        await service.onDifferenceFound({ type: ResultType.Success, difference: 'lol' } as GuessResultClassic, false);
        expect(decodeDifferenceSpy).toHaveBeenCalledWith('lol');
        expect(blinkAndReplaceSpy).toHaveBeenCalledWith(differences[0]);
        expect(service['cheatModeDifferences']).toEqual(differences.slice(1));
        expect(parentMethodSpy).toHaveBeenCalled();
        expect(service['foundDifferences']).toEqual(1);
    });

    it('onDifferenceFound should keep cheatModeDifferences undefined if it already is', async () => {
        const decodeDifferenceSpy = spyOn<any>(service, 'decodeDifference');
        const blinkAndReplaceSpy = spyOn<any>(service, 'blinkAndReplacePixels');
        const parentMethodSpy = spyOn(Object.getPrototypeOf(ClassicModeService).prototype, 'onDifferenceFound');
        service['cheatModeDifferences'] = undefined;
        await service.onDifferenceFound({ type: ResultType.Success, difference: 'lol' } as GuessResultClassic, false);
        expect(decodeDifferenceSpy).toHaveBeenCalledWith('lol');
        expect(blinkAndReplaceSpy).toHaveBeenCalledWith(undefined);
        expect(service['cheatModeDifferences']).toBeUndefined();
        expect(parentMethodSpy).toHaveBeenCalled();
    });

    it('onDifferenceFound should increment opponentFoundDifferences if the difference was found by the enemy', async () => {
        spyOn<any>(service, 'decodeDifference');
        spyOn<any>(service, 'blinkAndReplacePixels');
        spyOn(Object.getPrototypeOf(ClassicModeService).prototype, 'onDifferenceFound');
        service['cheatModeDifferences'] = undefined;
        await service.onDifferenceFound({ type: ResultType.Success, difference: 'lol' } as GuessResultClassic, true);
        expect(service['foundDifferences']).toEqual(0);
        expect(service['opponentFoundDifferences']).toEqual(1);
    });

    it('endGame() with replay should open end game modal with a replay message', () => {
        Object.defineProperty(socketServiceSpy, 'socket', { value: { id: 'abc' } });
        service.stopTimer = () => undefined;
        const expectedMessage = 'La reprise vidéo est terminée.';

        spyOn(service, 'quitGamePage').and.callFake(() => undefined);
        const replaySpy = spyOn(service, 'afterGameReplay').and.callFake(() => undefined);
        service['replayInstance'] = {} as Replay;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        modalServiceSpy.createEndGameModal.and.callFake(((message: any, callback: any, replayCallback: any) => {
            expect(message).toEqual(expectedMessage);

            callback!();
            if (replayCallback) {
                replayCallback();
            }
        }) as any);

        const winGame: EndGameResultDto = {
            isWinner: true,
            isForfeit: false,
        };

        service['endGame'](winGame);
        expect(modalServiceSpy.createEndGameModal).toHaveBeenCalled();
        expect(replaySpy).toHaveBeenCalled();
    });
    it('endGame() with win should open end game modal with a win message', () => {
        Object.defineProperty(socketServiceSpy, 'socket', { value: { id: 'abc' } });
        service.stopTimer = () => undefined;
        const expectedMessage = 'Vous avez gagné le jeu! Vous avez légalement le droit de claim le titre de légende du jeu des 7 différences.';

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        modalServiceSpy.createEndGameModal.and.callFake(((message: any, _callback: any) => {
            expect(message).toEqual(expectedMessage);
        }) as any);

        const winGame: EndGameResultDto = {
            isWinner: true,
            isForfeit: false,
        };

        service['endGame'](winGame);
        expect(modalServiceSpy.createEndGameModal).toHaveBeenCalled();
    });

    it('endGame() without win should open end game modal with a loss message', () => {
        Object.defineProperty(socketServiceSpy, 'socket', { value: { id: 'abc' } });
        service.stopTimer = () => undefined;

        const noWinGame: EndGameResultDto = {
            isWinner: false,
            isForfeit: false,
        };

        spyOn(service, 'replay');

        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        modalServiceSpy.createEndGameModal.and.callFake(((message: any, _callback: any, _replayCallback: any) => {
            expect(message).toEqual('Votre adversaire a gagné. Meilleure chance la prochaine fois.');
        }) as any);

        service['endGame'](noWinGame);
        expect(modalServiceSpy.createEndGameModal).toHaveBeenCalled();
    });

    it('endGame() without win should open end game modal with a loss message', () => {
        Object.defineProperty(socketServiceSpy, 'socket', { value: { id: 'abc' } });
        service.stopTimer = () => undefined;

        const forfaitGame: EndGameResultDto = {
            isWinner: true,
            isForfeit: true,
        };

        spyOn(service, 'replay');

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        modalServiceSpy.createEndGameModal.and.callFake(((message: any, _callback: any) => {
            expect(message).toEqual('Votre adversaire a abandonné la partie. Vous avez gagné!');
        }) as any);

        service['endGame'](forfaitGame);
        expect(modalServiceSpy.createEndGameModal).toHaveBeenCalled();
    });
    it('endGame() with recordBeaten should open end game modal with a record beaten message', () => {
        Object.defineProperty(socketServiceSpy, 'socket', { value: { id: 'abc' } });
        service.stopTimer = () => undefined;

        const recordBeatenGame: EndGameResultDto = {
            isWinner: true,
            isForfeit: false,
            recordBeaten: Position.First,
        };

        spyOn(service, 'replay');
        spyOn(service, 'quitGamePage').and.callFake(() => undefined);

        modalServiceSpy.createEndGameModal.and.callFake(((message: any, callback: any) => {
            expect(message).toEqual('Vous avez gagné le jeu! Vous êtes maintenant en première position sur le leaderboard!');
            callback!();
        }) as any);

        service['endGame'](recordBeatenGame);
        expect(modalServiceSpy.createEndGameModal).toHaveBeenCalled();
    });
    it('handleClick() should return when throttled', async () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        service['throttleEndTimestamp'] = Date.now() + 50;
        await service.handleClick(ImageArea.ORIGINAL, { button: MouseButton.Right, offsetX: 0, offsetY: 0 } as MouseEvent);
        expect(socketServiceSpy.send).not.toHaveBeenCalled();
    });

    it('replay should replay the game', () => {
        // Should create Replay instance and save it to this.replayInstance
        spyOn(window, 'setTimeout');
        service['replayInstance'] = undefined;
        service['replayCommands'] = ['abc', 'efg'] as unknown as any;
        service.afterGameReplay();
        expect(service['replayInstance']).toBeInstanceOf(Replay);
        expect(service['replayInstance']!['history']).toEqual(service['replayCommands'] as unknown as any);

        service['replayInstance']!['finishedSubject'].next();
        expect(service['replayInstance']).toBeUndefined();
    });

    it('decodeDifference should decode the difference from base64 to Coordinate[]', () => {
        const input = 'AQAFAAIAAwA=';
        const expectedOutput = [
            { x: 1, y: 5 },
            { x: 2, y: 3 },
        ];
        expect(service['decodeDifference'](input)).toEqual(expectedOutput);
    });
});
