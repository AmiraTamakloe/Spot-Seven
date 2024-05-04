/* eslint-disable max-params */
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { OBSERVER_RENDERING_TIME } from '@app/constants/observer-game';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { ChatService } from '@app/services/chat/chat.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { ModalService } from '@app/services/modal/modal.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { TimeLimitedModeService } from '@app/services/time-limited-mode/time-limited-mode.service';
import { TranslocoService } from '@ngneat/transloco';
@Component({
    selector: 'app-time-limited-mode',
    templateUrl: '../game-page/game-page.component.html',
    styleUrls: ['../game-page/game-page.component.scss'],
})
export class TimeLimitedModeComponent extends GamePageComponent implements OnInit, AfterViewInit {
    constructor(
        protected chatService: ChatService,
        protected modalService: ModalService,
        protected gameStartService: GameStartService,
        public timeLimitedModeService: TimeLimitedModeService,
        public themeService: ThemeService,
        public translocoService: TranslocoService,
    ) {
        super(gameStartService, chatService, modalService, timeLimitedModeService, themeService, translocoService);
    }

    ngOnInit(): void {
        this.timeLimitedModeService.initializeForGame();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
        if (this.gameStartService.isObservingPlayer && this.gameStartService.observerGameSession) {
            const initialGuessResults = this.gameStartService.observerGameSession?.currentDifferencesFound;
            setTimeout(() => {
                if (this.gameStartService.isObservingPlayer) {
                    if (initialGuessResults.length > 0) {
                        this.timeLimitedModeService.initializeObserverGame(initialGuessResults);
                    }
                }
            }, OBSERVER_RENDERING_TIME);
        }
    }
}
