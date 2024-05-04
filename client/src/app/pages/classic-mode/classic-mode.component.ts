/* eslint-disable max-params */
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { OBSERVER_RENDERING_TIME } from '@app/constants/observer-game';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { ChatService } from '@app/services/chat/chat.service';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { ModalService } from '@app/services/modal/modal.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { TranslocoService } from '@ngneat/transloco';

@Component({
    selector: 'app-classic-mode',
    templateUrl: '../game-page/game-page.component.html',
    styleUrls: ['../game-page/game-page.component.scss'],
})
export class ClassicModeComponent extends GamePageComponent implements OnInit, AfterViewInit {
    constructor(
        protected chatService: ChatService,
        protected modalService: ModalService,
        protected gameStartService: GameStartService,
        public classicModeService: ClassicModeService,
        public themeService: ThemeService,
        public translocoService: TranslocoService,
    ) {
        super(gameStartService, chatService, modalService, classicModeService, themeService, translocoService);
    }

    ngOnInit() {
        this.classicModeService.initializeForGame();
    }

    async ngAfterViewInit() {
        super.ngAfterViewInit();
        if (this.classicModeService.isObservingPlayer && this.gameStartService.observerGameSession) {
            const initialGuessResults = this.gameStartService.observerGameSession.currentDifferencesFound;

            // FIXME: this doesnt get executed because of some initalization process that isnt done (when we add a timeout, before this, it works)
            setTimeout(async () => {
                if (this.gameStartService.isObservingPlayer) {
                    if (initialGuessResults.length > 0) {
                        await this.classicModeService.initializeObserverGame(initialGuessResults);
                    }
                }
            }, OBSERVER_RENDERING_TIME);
        }
    }
}
