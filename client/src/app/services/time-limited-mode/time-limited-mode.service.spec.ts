import { GameStartService } from '@app/services/game-start/game-start.service';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameInfo } from '@app/interfaces/game-info';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { CanvasEditorService } from '@app/services/canvas-editor/canvas-editor.service';
import { MessageService } from '@app/services/message/message.service';
import { MusicService } from '@app/services/music/music.service';
import { SocketService } from '@app/services/socket/socket.service';
import { EndGameResultDto } from '@common/model/dto/end-game-result';
import { ExistingGame } from '@common/model/game';
import { GuessResultTimeLimited, ResultType, SessionType } from '@common/model/guess-result';
import { TimeLimitedModeService } from './time-limited-mode.service';
import SpyObj = jasmine.SpyObj;
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';

describe('TimeLimitedModeService', () => {
    let service: TimeLimitedModeService;
    let modalSpy: SpyObj<MatDialog>;
    let socketServiceSpy: SpyObj<SocketService>;
    let musicSpy: SpyObj<MusicService>;
    let mockRouter: SpyObj<Router>;
    let messageSpy: SpyObj<MessageService>;
    let gameStartServiceSpy: SpyObj<GameStartService>;
    let canvasEditorServiceSpy: SpyObj<CanvasEditorService>;

    beforeEach(() => {
        modalSpy = jasmine.createSpyObj(MatDialog, ['open', 'close']);
        messageSpy = jasmine.createSpyObj(MessageService, ['addMessage']);
        mockRouter = jasmine.createSpyObj(Router, ['navigate']);
        socketServiceSpy = jasmine.createSpyObj(SocketService, ['send', 'on', 'once']);
        gameStartServiceSpy = jasmine.createSpyObj(GameStartService, ['']);
        canvasEditorServiceSpy = jasmine.createSpyObj(CanvasEditorService, ['getContexts', 'getFullImageData']);

        TestBed.configureTestingModule({
            providers: [
                TimeLimitedModeService,
                { provide: MatDialog, useValue: modalSpy },
                { provide: MusicService, useValue: musicSpy },
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: Router, useValue: mockRouter },
                { provide: MessageService, useValue: messageSpy },
                { provide: GameStartService, useValue: gameStartServiceSpy },
                { provide: CanvasEditorService, useValue: canvasEditorServiceSpy },
            ],
            imports: [RouterTestingModule.withRoutes([{ path: '**', component: MainPageComponent }]), ...getTranslocoTestingModules()],
        });

        spyOn(window, 'setInterval');
        service = TestBed.inject(TimeLimitedModeService);
        socketServiceSpy.once.and.returnValue();
        service['gameInfo'] = {} as GameInfo;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('endGame should open modal', () => {
        service.stopTimer = () => {
            return;
        };
        const endGameResultDto: EndGameResultDto = { isWinner: false, isForfeit: false };
        service.endGame(endGameResultDto);
        expect(modalSpy.open).toHaveBeenCalled();
    });

    it('onDifferenceFound should save new game, call loadImages, refresh remainingDifferences and call super', async () => {
        const guessResultTimeLimited: GuessResultTimeLimited = {
            sessionType: SessionType.TimeLimited,
            type: ResultType.Success,
            game: {} as ExistingGame,
        };
        service.gameInfo['game'] = undefined as unknown as ExistingGame;
        const loadImagesSpy = spyOn(service, 'loadImages');
        const getRemainingDifferencesSpy = spyOn<any>(service, 'getRemainingDifferences').and.returnValue([[{ x: 0, y: 0 }]]);
        service['cheatModeDifferences'] = [[{ x: 1, y: 0 }]];
        const parentSpy = spyOn<any>(Object.getPrototypeOf(TimeLimitedModeService).prototype, 'onDifferenceFound');

        await service['onDifferenceFound'](guessResultTimeLimited);
        expect(service.gameInfo.game).toEqual(guessResultTimeLimited.game as ExistingGame);
        expect(loadImagesSpy).toHaveBeenCalled();
        expect(getRemainingDifferencesSpy).toHaveBeenCalled();
        expect(service['cheatModeDifferences']).toEqual([[{ x: 0, y: 0 }]]);
        expect(parentSpy).toHaveBeenCalled();
    });
});
