import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// Inspired by https://stackoverflow.com/a/43065100
@Component({
    selector: 'app-confirm-modal',
    templateUrl: './confirm-modal.component.html',
    styleUrls: ['./confirm-modal.component.scss'],
})
export class ConfirmModalComponent {
    constructor(public modal: MatDialogRef<ConfirmModalComponent>, @Inject(MAT_DIALOG_DATA) public data: { confirmMessage: string }) {}
}
