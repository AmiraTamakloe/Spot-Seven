/* eslint-disable max-params */
import { AfterViewInit, Component, HostListener, ViewChild } from '@angular/core';
import { TimerComponent } from '@app/components/timer/timer.component';
import { CHEAT_BLINK_KEY, HINT_KEY } from '@app/constants';
import { ChatService } from '@app/services/chat/chat.service';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { GameService } from '@app/services/game-service/game.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { ModalService } from '@app/services/modal/modal.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { ImageArea } from '@common/enums/image-area';
import { GameMode } from '@common/game-mode';
import { Difficulty } from '@common/model/difficulty';
import { TranslocoService } from '@ngneat/transloco';

@Component({
    template: '',
})
export class GamePageComponent implements AfterViewInit {
    @ViewChild('timer', { static: false }) private timer!: TimerComponent;
    areas = ImageArea;
    // Necessary for html template
    gameMode = GameMode;
    classicModeService?: ClassicModeService;
    showChatWindow = false;
    constructor(
        protected gameStartService: GameStartService,
        protected chatService: ChatService,
        protected modalService: ModalService,
        protected gameService: GameService,
        public themeService: ThemeService,
        readonly translocoService: TranslocoService,
    ) {}

    get gameName() {
        return this.gameService.gameInfo.game.name;
    }

    get gameDifficulty(): Difficulty {
        return this.gameService.gameInfo.game.difficulty;
    }

    get totalDifferences() {
        return this.gameService.gameInfo.game.differencesCount;
    }

    get remainingHints() {
        return this.gameService.remainingHints;
    }

    @HostListener('window:keyup', ['$event'])
    keyEvent(event: KeyboardEvent) {
        if (this.gameService.isObservingPlayer) return;
        if (event.target instanceof HTMLInputElement || this.gameService.gameEnded) return;
        if (CHEAT_BLINK_KEY.includes(event.key)) {
            this.gameService.toggleCheatMode();
        }
        if (HINT_KEY.includes(event.key) && this.canGetHint()) {
            this.getHint();
        }
    }

    ngAfterViewInit() {
        this.gameService.afterViewInitialize();
    }

    toggleChatWindow() {
        this.showChatWindow = !this.showChatWindow;
    }

    async giveUp() {
        let message = 'Voulez-vous vraiment abandonner ?';
        if (this.gameService.isObservingPlayer) message = 'Voulez-vous vraiment quitter?';
        if (await this.modalService.createConfirmModal(message)) {
            this.gameService.giveUp();
        }
    }

    isClassicMode() {
        return this.gameService.gameInfo.gameMode === GameMode.Classic || this.gameService.gameInfo.gameMode === GameMode.ClassicTeam;
    }

    canGetHint() {
        if (this.gameService.isObservingPlayer) return false;
        return this.remainingHints > 0;
    }

    getHint() {
        this.gameService.getHint();
        this.timer.addSeconds(-this.gameService.gameInfo.hintPenalty);
    }
}
