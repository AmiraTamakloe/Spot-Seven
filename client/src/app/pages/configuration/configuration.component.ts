import { Component } from '@angular/core';
import { GameConstantsService } from '@app/services//game-constants/game-constants.service';
import { CommunicationService } from '@app/services/communication/communication.service';
import { ConfigurationService } from '@app/services/configuration/configuration.service';
import { ModalService } from '@app/services/modal/modal.service';
import { ThemeService } from '@app/services/theme/theme.service';
import { ConstantName } from '@common/game-constants';
import { History } from '@common/model/history';
import { TranslocoService } from '@ngneat/transloco';

@Component({
    selector: 'app-configuration',
    templateUrl: './configuration.component.html',
    styleUrls: ['./configuration.component.scss'],
})
export class ConfigurationComponent {
    constantsName = {
        initialTime: 'Temps initial',
        hintPenalty: 'Pénalité pour un indice',
        differenceFoundBonus: 'Bonus pour une différence trouvée',
    };

    // Used to inject the services
    // eslint-disable-next-line max-params
    constructor(
        private configurationService: ConfigurationService,
        protected gameConstantsService: GameConstantsService,
        private communicationService: CommunicationService,
        private modalService: ModalService,
        public themeService: ThemeService,
        private readonly translocoService: TranslocoService,
    ) {}

    getConstantsInDisplayFormat() {
        return Object.entries(this.gameConstantsService.constants).map(([key, value]) => ({ key, value })) as { key: ConstantName; value: number }[];
    }

    async deleteAll() {
        if (
            await this.modalService.createConfirmModal(
                this.translocoService.translate('configuration.Voulez-vous vraiment supprimer toutes les fiches ?'),
            )
        ) {
            this.communicationService.deleteAllGames().subscribe();
        }
    }

    async reinitializeAllScores() {
        if (
            await this.modalService.createConfirmModal(
                this.translocoService.translate('configuration.Voulez vous vraiment réinitialiser les scores de tous les jeux ?'),
            )
        ) {
            this.configurationService.reinitializeAllScores();
        }
    }

    displayHistory(): void {
        const historyObserver = {
            next: (history: History[]) => {
                this.modalService.createHistoryModal(history);
            },
        };
        this.communicationService.getHistory().subscribe(historyObserver);
    }

    async deleteHistory(): Promise<void> {
        if (
            await this.modalService.createConfirmModal(
                this.translocoService.translate("configuration.Voulez-vous vraiment supprimer l'historique des parties ?"),
            )
        ) {
            this.communicationService.deleteHistory().subscribe();
        }
    }
}
