import { Component, Input, OnInit } from '@angular/core';
import { GameSelectionService } from '@app/services//game-selection/game-selection.service';
import { CommunicationService } from '@app/services/communication/communication.service';
import { ConfigurationService } from '@app/services/configuration/configuration.service';
import { ModalService } from '@app/services/modal/modal.service';
import { SocketService } from '@app/services/socket/socket.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { GameSessionEvent } from '@common/model/events/game-session.events';
import { ExistingGame, GameSheetState, JoinableGame } from '@common/model/game';
import { TranslocoService } from '@ngneat/transloco';
import { environment } from 'src/environments/environment';
@Component({
    selector: 'app-game-sheet[game][isConfig]',
    templateUrl: './game-sheet.component.html',
    styleUrls: ['./game-sheet.component.scss'],
})
export class GameSheetComponent implements OnInit {
    @Input() game!: ExistingGame;
    @Input() isConfig!: boolean;
    sheetStates = GameSheetState;
    sheetState: GameSheetState | null = null;

    // To inject the required services
    // eslint-disable-next-line max-params
    constructor(
        private readonly gameSelectionService: GameSelectionService,
        private modalService: ModalService,
        private readonly communicationService: CommunicationService,
        private socketService: SocketService,
        private configurationService: ConfigurationService,
        public themeService: ThemeService,
        private readonly translocoService: TranslocoService,
    ) {}

    get image() {
        return `${environment.uploadUrl}/${this.game.originalImageFilename}`;
    }

    get difficulty() {
        return this.game.difficulty;
    }

    ngOnInit(): void {
        this.socketService.on(GameSessionEvent.GameStateChanged, (game: JoinableGame) => {
            this.updateSheetState(game);
        });
    }

    async deleteGame(): Promise<void> {
        if (await this.modalService.createConfirmModal(this.translocoService.translate('game-sheet.Voulez-vous vraiment supprimer ce jeu ?'))) {
            const loadingModal = this.modalService.createLoadingModal();
            this.communicationService.deleteGame(this.game._id).subscribe({
                next: () => {
                    loadingModal.close();
                    this.gameSelectionService.deleteGame(this.game._id);
                },
            });
        }
    }

    async reinitializeScores(): Promise<void> {
        if (
            await this.modalService.createConfirmModal(
                this.translocoService.translate('game-sheet.Voulez vous vraiment réinitialiser les scores de ce jeu ?'),
            )
        ) {
            await this.configurationService.reinitializeScores(this.game._id);
        }
    }

    private updateSheetState(game: JoinableGame): void {
        if (game._id !== this.game._id) {
            return;
        }
        this.sheetState = game.sheetState;
    }
}
