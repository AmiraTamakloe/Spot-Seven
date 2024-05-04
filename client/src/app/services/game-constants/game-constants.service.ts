import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameConstantsModalComponent } from '@app/components/game-constants-modal/game-constants-modal.component';
import { LoadingModalComponent } from '@app/components/loading-modal/loading-modal.component';
import { CommunicationService } from '@app/services/communication/communication.service';
import { ModalService } from '@app/services/modal/modal.service';
import { GameConstants } from '@common/game-constants';
import { defaultGameConstants } from '@common/game-default.constants';
import { TranslocoService } from '@ngneat/transloco';

@Injectable({
    providedIn: 'root',
})
export class GameConstantsService {
    constants: GameConstants = defaultGameConstants;

    // eslint-disable-next-line max-params
    constructor(
        private communicationService: CommunicationService,
        private modalService: ModalService,
        private modal: MatDialog,
        private readonly translocoService: TranslocoService,
    ) {
        this.getAllConstants();
    }

    getAllConstants(): void {
        this.communicationService.getAllConstants().subscribe((constants: GameConstants) => (this.constants = constants));
    }

    updateConstant(gameConstant: keyof GameConstants): void {
        const constantModal = this.modal.open(GameConstantsModalComponent, { data: { constantMessage: 'Entrez la nouvelle valeur' } });
        constantModal.afterClosed().subscribe((result: number) => {
            if (!result) return;
            const loadingModal = this.modal.open(LoadingModalComponent);
            this.communicationService.updateConstant(gameConstant, result).subscribe(() => {
                loadingModal.close();
                this.constants[gameConstant] = result;
            });
        });
    }

    async resetAllConstants(): Promise<void> {
        if (
            await this.modalService.createConfirmModal(
                this.translocoService.translate('constants.Voulez-vous vraiment réinitialiser les constantes ?'),
            )
        ) {
            this.communicationService.resetAllConstants().subscribe((defaultConstants) => {
                this.constants = defaultConstants;
            });
        }
    }
}
