import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActionModalComponent, ActionModalData } from '@app/components/action-modal/action-modal.component';
import { ConfirmModalComponent } from '@app/components/confirm-modal/confirm-modal.component';
import { HistoryModalComponent } from '@app/components/history-modal/history-modal.component';
import { LoadingModalComponent } from '@app/components/loading-modal/loading-modal.component';
import { PasswordModalComponent } from '@app/components/password-modal/password-modal.component';
import { History } from '@common/model/history';
import { TranslocoService } from '@ngneat/transloco';

export type LoadingModalRef = MatDialogRef<LoadingModalComponent>;
export type ActionModalRef = MatDialogRef<ActionModalComponent>;

@Injectable({
    providedIn: 'root',
})
export class ModalService {
    constructor(private modal: MatDialog, private readonly translocoService: TranslocoService) {}

    createLoadingModal(disableClose: boolean = true): LoadingModalRef {
        return this.modal.open(LoadingModalComponent, { disableClose });
    }
    createPasswordModal(message: string, callback: (password: string) => void): void {
        const dialogRef = this.modal.open(PasswordModalComponent, { data: { message } });
        dialogRef.afterClosed().subscribe(callback);
    }

    async createConfirmModal(message: string): Promise<boolean> {
        return await this.awaitModalClose(this.modal.open(ConfirmModalComponent, { data: { confirmMessage: message } }));
    }

    createActionModal(data: ActionModalData, disableClose: boolean = true): ActionModalRef {
        return this.modal.open(ActionModalComponent, { data, disableClose });
    }

    createChoiceModal(data: ActionModalData, disableClose: boolean = false): ActionModalRef {
        return this.modal.open(ActionModalComponent, { data, disableClose });
    }

    async createInformationModal(title: string, message: string, closeMessage: string = 'OK'): Promise<number | undefined> {
        return await this.awaitModalClose(this.createActionModal({ title, message, actions: [{ label: closeMessage, close: true }] }));
    }

    createEndGameModal(message: string, homeCallback: () => void, replayCallback?: () => void): ActionModalRef {
        const modalData: ActionModalData = {
            title: this.translocoService.translate('modal.La partie est terminée'),
            message,
            actions: [
                {
                    label: this.translocoService.translate('modal.Accueil'),
                    close: true,
                    callback: homeCallback,
                },
            ],
        };
        if (replayCallback) {
            modalData.actions.push({
                label: this.translocoService.translate('modal.Revoir la partie'),
                close: true,
                callback: () => replayCallback(),
            });
        }
        return this.createActionModal(modalData);
    }

    createTimeLimitedModal(timeLimited: () => void, timeLimitedAugmented: () => void): ActionModalRef {
        const modalData: ActionModalData = {
            title: this.translocoService.translate('modal.Jouez en mode temps limité'),
            message: this.translocoService.translate("modal.Soyez rapide...le temps s'écoule!"),
            actions: [
                {
                    label: this.translocoService.translate('time-limited-selection-page.Temps Limité 1 Différence'),
                    close: true,
                    callback: timeLimited,
                },
                {
                    label: this.translocoService.translate('time-limited-selection-page.Temps Limité Augmenté'),
                    close: true,
                    callback: () => timeLimitedAugmented(),
                },
            ],
        };
        return this.createChoiceModal(modalData);
    }

    createHistoryModal(history: History[]) {
        this.modal.open(HistoryModalComponent, { data: history });
    }

    private async awaitModalClose<T, U>(modalRef: MatDialogRef<T>): Promise<U> {
        return new Promise<U>((resolve) => {
            modalRef.afterClosed().subscribe((result) => resolve(result));
        });
    }
}
