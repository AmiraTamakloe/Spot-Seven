import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface Action {
    callback?: () => void;
    close?: boolean;
    label: string;
}

export interface ActionModalData {
    title: string;
    message: string;
    actions: Action[];
}

@Component({
    selector: 'app-action-modal',
    templateUrl: './action-modal.component.html',
    styleUrls: ['./action-modal.component.scss'],
})
export class ActionModalComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: ActionModalData, private modalRef: MatDialogRef<ActionModalComponent>) {}

    execute(action: Action, index: number) {
        if (action.callback) {
            action.callback();
        }
        if (action.close) {
            this.modalRef.close(index);
        }
    }
}
