import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Replay } from '@app/classes/replay/replay';
import { GameReplayCommand } from '@app/interfaces/game-replay-command';
import { CanvasEditorService } from '@app/services/canvas-editor/canvas-editor.service';
import { GameService } from '@app/services/game-service/game.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { ModalService } from '@app/services/modal/modal.service';
import { MusicService } from '@app/services/music/music.service';
import { ReplayService } from '@app/services/replay/replay.service';
import { SocketService } from '@app/services/socket/socket.service';
import { ImageArea } from '@common/enums/image-area';
import { GameMode } from '@common/game-mode';
import { Coordinate } from '@common/model/coordinate';
import { EndGameResultDto } from '@common/model/dto/end-game-result';
import { GuessResultClassic, GuessResultClassicSuccess, GuessResultTimeLimitedSuccess, ResultType } from '@common/model/guess-result';
import { TranslocoService } from '@ngneat/transloco';
import { Buffer } from 'buffer';
import { COORDINATE_ENCODING_LENGTH } from './classic-mode.constants';

@Injectable({ providedIn: 'root' })
export class ClassicModeService extends GameService {
    isReplaySaved = false;
    private replayCommands?: GameReplayCommand[] | null = null;

    // Disabled for inheritance
    // eslint-disable-next-line max-params
    constructor(
        public canvasEditorService: CanvasEditorService,
        protected socketService: SocketService,
        protected modalService: ModalService,
        protected gameStartService: GameStartService,
        protected router: Router,
        private replayService: ReplayService,
        readonly translocoService: TranslocoService,
        protected musicService: MusicService,
    ) {
        super(canvasEditorService, socketService, modalService, gameStartService, router, translocoService, musicService);
    }

    initializeForGame() {
        const replayCommands: GameReplayCommand[] | null = this.gameStartService.replayCommands;

        if (replayCommands) {
            this.isReplaySaved = true;
            this.replayCommands = replayCommands;
            this.initialize();
            this.replay(replayCommands);
        } else {
            super.initializeForGame();
        }
    }

    isClassicMode() {
        return this.gameInfo.gameMode === GameMode.Classic || this.gameInfo.gameMode === GameMode.ClassicTeam;
    }

    quitGamePage(): void {
        this.endReplay();
        this.replayService.deleteAfterGameReplay().subscribe();
        super.quitGamePage();
    }

    async handleClick(imageArea: ImageArea, event: MouseEvent): Promise<void> {
        if (this.replayCommands) {
            return;
        }

        await super.handleClick(imageArea, event);
    }

    async onDifferenceFound(guessResult: GuessResultClassic, otherPlayer: boolean): Promise<void> {
        if (guessResult.type === ResultType.Success) {
            const difference = this.decodeDifference(guessResult.difference as string);
            if (otherPlayer) this.opponentFoundDifferences++;
            else this.foundDifferences++;
            await this.blinkAndReplacePixels(difference);
            this.cheatModeDifferences = this.cheatModeDifferences?.filter((diff) => JSON.stringify(diff[0]) !== JSON.stringify(difference[0]));
            super.onDifferenceFound(guessResult, otherPlayer);
        }
    }

    async initializeObserverGame(guessResults: (GuessResultClassicSuccess | GuessResultTimeLimitedSuccess)[]) {
        for (let guessResult of guessResults) {
            guessResult = guessResult as GuessResultClassicSuccess;
            const difference = this.decodeDifference(guessResult.difference as string);

            this.opponentFoundDifferences++;
            await this.replacePixels(difference);
        }
    }

    endGame(gameResult: EndGameResultDto) {
        this.stopTimer();

        let message;
        if (this.isObservingPlayer) {
            if (gameResult.isForfeit) {
                message = 'La partie observée est terminée dû à un abandon';
            } else message = 'La partie observée a pris fin.';
        } else if (gameResult.isForfeit) {
            message = this.translocoService.translate('classic-mode.Votre adversaire a abandonné la partie. Vous avez gagné!');
        } else {
            const messageWinner =
                'classic-mode.Vous avez gagné le jeu! Vous avez légalement le droit de claim le titre de légende du jeu des 7 différences.';
            message = gameResult.isWinner
                ? this.translocoService.translate(messageWinner)
                : this.translocoService.translate('classic-mode.Votre adversaire a gagné. Meilleure chance la prochaine fois.');
            if (gameResult.isWinner) {
                this.musicService.playWinningSoundEffect();
            }
        }

        if (gameResult.isWinner && gameResult.recordBeaten !== undefined && !this.isObservingPlayer) {
            const messageWinner = this.translocoService.translate('classic-mode.Vous avez gagné le jeu! Vous êtes maintenant en');
            message = `${messageWinner} ${gameResult.recordBeaten} ${this.translocoService.translate('classic-mode.position sur le leaderboard!')}`;
        }

        if (this.replayInstance) {
            message = this.translocoService.translate('classic-mode.La reprise vidéo est terminée.');
        }

        if (this.isObservingPlayer) {
            this.modalService.createEndGameModal(message, () => this.quitGamePage());
        } else {
            this.modalService.createEndGameModal(
                message,
                () => this.quitGamePage(),
                () => this.afterGameReplay(),
            );
        }
        super.endGame(gameResult);
    }

    afterGameReplay() {
        if (this.replayCommands) {
            this.replay(this.replayCommands);
        } else {
            this.isReplaySaved = false;
            this.replayService.constructAfterGameReplay(this).subscribe((commands: GameReplayCommand[]) => {
                this.replayCommands = commands;
                this.replay(commands);
            });
        }
    }

    replay(commands: GameReplayCommand[]) {
        this.replayInstance = new Replay(commands, this.replaySpeedChangedSubject);

        this.replayInstance.finishedObservable.subscribe(() => {
            this.replayInstance = undefined;
        });
    }

    endReplay() {
        this.replayCommands = null;
        if (!this.replayInstance) return;
        this.replayInstance.end();
    }

    saveReplay() {
        if (!this.replayInstance) return;
        this.isReplaySaved = true;
        this.replayService.saveAfterGameReplay().subscribe();
    }

    // Adapted from server
    private decodeDifference(content: string): Coordinate[] {
        const buffer = Buffer.from(content, 'base64');
        const difference: Coordinate[] = [];
        for (let i = 0; i < buffer.length; i += COORDINATE_ENCODING_LENGTH) {
            difference.push({ x: buffer.readUInt16LE(i), y: buffer.readUInt16LE(i + 2) });
        }
        return difference;
    }
}
