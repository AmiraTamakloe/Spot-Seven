/* eslint-disable max-lines */
import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DrawInstructionsManager } from '@app/classes/draw-instructions-manager/draw-instructions-manager';
import { DRAW_FREQUENCY } from '@app/classes/draw-instructions-manager/draw-instructions-manager.constants';
import { Replay } from '@app/classes/replay/replay';
import { IMAGE_HEIGHT, IMAGE_WIDTH, MILLISECONDS_IN_ONE_SECOND } from '@app/constants';
import { MouseButton } from '@app/enums/mouse-button';
import { CanvasAction } from '@app/interfaces/canvas-action';
import { GameInfo } from '@app/interfaces/game-info';
import { CanvasEditorService } from '@app/services/canvas-editor/canvas-editor.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { ModalService } from '@app/services/modal/modal.service';
import { MusicService } from '@app/services/music/music.service';
import { SocketService } from '@app/services/socket/socket.service';
import { ImageArea } from '@common/enums/image-area';
import { ObserverGameSession } from '@common/interfaces/observer-game-session.interface';
import { Coordinate } from '@common/model/coordinate';
import { EndGameResultDto } from '@common/model/dto/end-game-result';
import { GameSessionEvent } from '@common/model/events/game-session.events';
import { ObserverEvent } from '@common/model/events/observer.events';
import { Guess } from '@common/model/guess';
import { GuessResult, ResultType } from '@common/model/guess-result';
import { Divisor, Hint, HintType, RemainingHints } from '@common/model/hints';
import { TranslocoService } from '@ngneat/transloco';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
    END_ANGLE,
    ERROR_MESSAGE,
    FINGER_HEIGHT,
    FINGER_WIDTH,
    FULL_CIRCLE_TIME,
    INCREMENT_ANGLE,
    RADIUS,
    START_ANGLE,
    X_HIGH_EXTREMITY,
    X_LOW_EXTREMITY,
    Y_HIGH_EXTREMITY,
    Y_LOW_EXTREMITY,
} from './game.constants';

@Injectable({
    providedIn: 'root',
})
export abstract class GameService implements OnDestroy {
    foundDifferences = 0;
    opponentFoundDifferences = 0;
    remainingHints = 3;
    gameInfo!: GameInfo;
    observersGameSession?: ObserverGameSession;
    replayInstance?: Replay;
    gameEnded = false;
    bonusSubject = new Subject<number>();
    bonusObservable = this.bonusSubject.asObservable();
    timerSubject = new Subject<boolean>();
    timerObservable = this.timerSubject.asObservable();
    isObservingPlayer = false;

    protected throttleEndTimestamp?: number;
    protected actionImageSubject = new Subject<CanvasAction>();
    protected actionErrorSubject = new Subject<CanvasAction>();
    protected replaySpeedChangedSubject = new Subject<number>();
    protected cheatModeDifferences?: Coordinate[][];
    private cheatModeActivated = false;
    private drawInstructionsManager: DrawInstructionsManager;

    // Observables must be declared after the subjects
    // eslint-disable-next-line @typescript-eslint/member-ordering
    actionImageObservable = this.actionImageSubject.asObservable();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    actionErrorObservable = this.actionErrorSubject.asObservable();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    replaySpeedChangedObservable = this.replaySpeedChangedSubject.asObservable();

    // Disabled since we require these services to be injected
    // eslint-disable-next-line max-params
    constructor(
        public canvasEditorService: CanvasEditorService,
        protected socketService: SocketService,
        protected modalService: ModalService,
        protected gameStartService: GameStartService,
        protected router: Router,
        readonly translocoService: TranslocoService,
        protected musicService: MusicService,
    ) {
        this.drawInstructionsManager = new DrawInstructionsManager(this.actionErrorSubject, this);
    }

    get width(): number {
        return IMAGE_WIDTH;
    }

    get height(): number {
        return IMAGE_HEIGHT;
    }

    onError(guess: Guess) {
        new Audio('./assets/audio/wrong.mp3').play();
        this.errorMessage(guess.imageArea, guess.coordinate);
        this.throttleEndTimestamp = Date.now() + MILLISECONDS_IN_ONE_SECOND;
    }

    /* receiveMessage(message: ChatMessage) {
        this.chatService.receiveMessage(message);
    } */

    saveCheatModeDifferences(cheatModeDifferences: Coordinate[][]) {
        this.cheatModeDifferences = cheatModeDifferences;
    }

    toggleCheatMode() {
        this.cheatModeActivated = !this.cheatModeActivated;
        this.setupCheatMode();
    }

    stopTimer() {
        this.timerSubject.next(false);
    }

    afterViewInitialize() {
        this.reset();
        this.loadImages();
        this.timerSubject.next(true);
    }

    hintCallback(hintInfo: Hint) {
        if (hintInfo.hintType === HintType.FirstSecond) {
            this.executeFirstSecondHint(hintInfo.zone);
        } else {
            this.executeThirdHint(hintInfo.position);
        }
        this.remainingHints--;
    }

    ngOnDestroy(): void {
        this.drawInstructionsManager.stopExecution();
        this.socketService.socket?.off(GameSessionEvent.EndGame);
        this.socketService.socket?.off(GameSessionEvent.DifferenceFound);
    }

    initializeForGame() {
        this.initialize();
        this.setupEventListeners();
    }

    initialize() {
        const gameInfo = this.gameStartService.gameInfo;
        this.isObservingPlayer = this.gameStartService.isObservingPlayer;
        this.observersGameSession = this.gameStartService.observerGameSession;
        if (!gameInfo) {
            this.router.navigate(['/home']);
            return;
        }
        this.gameInfo = gameInfo;
        this.gameEnded = false;
    }

    reset() {
        this.foundDifferences = 0;
        this.opponentFoundDifferences = 0;
        this.cheatModeActivated = false;
        // this.chatService.messages = [];
        this.remainingHints = 3;
        this.drawInstructionsManager.stopExecution();
        this.drawInstructionsManager = new DrawInstructionsManager(this.actionErrorSubject, this);
        this.setupCheatModeDrawInstructions();
    }

    loadImages() {
        const actionImageSubjectBuilder = (imageArea: ImageArea, filename: string) => {
            return {
                imageArea,
                action: (imageContext: CanvasRenderingContext2D) => {
                    const originalImage = new Image();
                    originalImage.crossOrigin = 'anonymous';
                    originalImage.src = `${environment.uploadUrl}/${filename}`;
                    originalImage.addEventListener('load', () => {
                        imageContext.drawImage(originalImage, 0, 0);
                    });
                },
            };
        };

        this.actionImageSubject.next(actionImageSubjectBuilder(ImageArea.ORIGINAL, this.gameInfo.game.originalImageFilename));
        this.actionImageSubject.next(actionImageSubjectBuilder(ImageArea.MODIFIED, this.gameInfo.game.modifiedImageFilename));
    }

    giveUp() {
        this.socketService.send(GameSessionEvent.GiveUp);
        this.quitGamePage();
    }

    quitGamePage() {
        this.router.navigate(['/home']);
    }

    async setupCheatMode() {
        if (!this.gameEnded && !this.cheatModeDifferences) {
            this.saveCheatModeDifferences(await this.getRemainingDifferences());
        }
    }

    async handleClick(imageArea: ImageArea, event: MouseEvent): Promise<void> {
        if (this.isObservingPlayer) return;

        if ((this.throttleEndTimestamp !== undefined && Date.now() < this.throttleEndTimestamp) || this.gameEnded) return;
        this.throttleEndTimestamp = undefined;

        if (event.button !== MouseButton.Left) return;

        const coordinate: Coordinate = { x: event.offsetX, y: event.offsetY };
        this.socketService.send(GameSessionEvent.GuessDifference, { imageArea, coordinate }, (guessResult: GuessResult) => {
            this.handleClickCallback({ imageArea, coordinate }, guessResult);
        });
    }

    handleClickCallback(guess: Guess, guessResult: GuessResult) {
        if (guessResult.type === ResultType.Success) {
            this.onDifferenceFound(guessResult);
        } else {
            this.onError(guess);
        }
    }

    getHint() {
        if (this.isObservingPlayer) return;
        this.socketService.send(GameSessionEvent.UseHint, undefined, (hintInfo: Hint) => {
            this.hintCallback(hintInfo);
        });
    }

    executeFirstSecondHint(zone: Coordinate): void {
        let divisor = Divisor.Half;
        if (this.remainingHints === RemainingHints.TwoHintLeft) {
            divisor = Divisor.Quarter;
        }

        this.drawInstructionsManager.instructions.push({
            imageArea: ImageArea.BOTH,
            action: (context) => {
                context.lineWidth = 4;
                context.strokeStyle = 'rgba(75, 0, 130)';
                context.strokeRect(zone.x, zone.y, IMAGE_WIDTH / divisor, IMAGE_HEIGHT / divisor);
                context.fillStyle = 'rgba(75, 0, 130, 0.5)';
                context.fillRect(zone.x, zone.y, IMAGE_WIDTH / divisor, IMAGE_HEIGHT / divisor);
            },
            executionsLeft: MILLISECONDS_IN_ONE_SECOND / DRAW_FREQUENCY,
        });
    }

    executeThirdHint(randomCoord: Coordinate) {
        const fingerImage = new Image();
        fingerImage.src = './assets/images-buttons/finger.png';
        const a = randomCoord.x; // x center
        const b = randomCoord.y; // y center
        let transformationAngle = START_ANGLE;
        this.drawInstructionsManager.instructions.push({
            imageArea: ImageArea.BOTH,
            action: (context, index) => {
                transformationAngle = ((index % INCREMENT_ANGLE) * END_ANGLE) / INCREMENT_ANGLE;
                const x = a + RADIUS * Math.cos(transformationAngle);
                const y = b + RADIUS * Math.sin(transformationAngle);
                context.drawImage(fingerImage, x, y, FINGER_WIDTH, FINGER_HEIGHT);
            },
            executionsLeft: FULL_CIRCLE_TIME / DRAW_FREQUENCY,
        });
    }

    // We need the function argument for children classes to override
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    endGame(gameResult: EndGameResultDto) {
        this.gameEnded = true;
    }

    async replacePixels(difference: Coordinate[]) {
        const { rightContext, leftContext } = await this.canvasEditorService.getContexts(this.actionImageSubject);
        this.canvasEditorService.replacePixels(leftContext, rightContext, difference);
    }

    // We need the function argument for children classes to override
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    protected async onDifferenceFound(guessResult: GuessResult, otherPlayer: boolean = false): Promise<void> {
        new Audio('./assets/audio/good.mp3').play();
    }

    protected async errorMessage(imageArea: ImageArea, clickPosition: Coordinate) {
        this.drawInstructionsManager.instructions.push({
            imageArea,
            action: (context) => {
                this.reposition(clickPosition);
                this.canvasEditorService.drawText(context, { text: ERROR_MESSAGE, color: 'red', position: clickPosition });
            },
            executionsLeft: MILLISECONDS_IN_ONE_SECOND / DRAW_FREQUENCY,
        });
    }

    protected async blinkAndReplacePixels(difference: Coordinate[]) {
        this.blinkGoodPixels(difference);
        // this.replacePixels(difference);
        const { rightContext, leftContext } = await this.canvasEditorService.getContexts(this.actionImageSubject);
        this.canvasEditorService.replacePixels(leftContext, rightContext, difference);
    }

    protected async getRemainingDifferences(): Promise<Coordinate[][]> {
        return new Promise<Coordinate[][]>((resolve) => {
            this.socketService.send(GameSessionEvent.RemainingDifferences, undefined, resolve);
        });
    }

    private setupEventListeners() {
        this.socketService.once(GameSessionEvent.EndGame, (gameResult: EndGameResultDto) => this.endGame(gameResult));

        this.socketService.on(GameSessionEvent.DifferenceFound, async (guessResult: GuessResult) => {
            this.onDifferenceFound(guessResult, true);
        });

        this.socketService.on(ObserverEvent.ObserversSessionUpdate, (observersGameSession: ObserverGameSession) => {
            this.observersGameSession = observersGameSession;
        });

        this.socketService.on(ObserverEvent.GiveUpGame, (observersGameSession: ObserverGameSession) => {
            if (!this.observersGameSession) return;
            this.observersGameSession.currentObservers = observersGameSession.currentObservers;
        });

        /* this.socketService.on(GameSessionEvent.Message, (message: ChatMessage) => {
            this.receiveMessage(message);
        }); */
    }

    private setupCheatModeDrawInstructions() {
        this.drawInstructionsManager.instructions.push({
            imageArea: ImageArea.BOTH,
            action: async (context, index) => {
                if (this.cheatModeActivated && index % 2 && this.cheatModeDifferences) {
                    this.canvasEditorService.fillPixels(context, 'yellow', this.cheatModeDifferences.flat());
                }
            },
        });
    }

    private reposition(clickPosition: Coordinate) {
        clickPosition.x = Math.max(Math.min(clickPosition.x, X_HIGH_EXTREMITY), X_LOW_EXTREMITY);
        clickPosition.y = Math.max(Math.min(clickPosition.y, Y_HIGH_EXTREMITY), Y_LOW_EXTREMITY);
    }

    private async blinkGoodPixels(coords: Coordinate[]) {
        this.drawInstructionsManager.instructions.push({
            imageArea: ImageArea.BOTH,
            action: (context, index) => {
                const color = index % 2 ? 'green' : 'red';
                this.canvasEditorService.fillPixels(context, color, coords);
            },
            executionsLeft: MILLISECONDS_IN_ONE_SECOND / DRAW_FREQUENCY,
        });
    }
}
