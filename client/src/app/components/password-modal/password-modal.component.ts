import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-password-modal',
    templateUrl: './password-modal.component.html',
    styleUrls: ['./password-modal.component.scss'],
})
export class PasswordModalComponent {
    password: string = '';

    constructor(public dialogRef: MatDialogRef<PasswordModalComponent>, @Inject(MAT_DIALOG_DATA) public data: { message: string }) {}

    onConfirm(): void {
        this.dialogRef.close(this.password);
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
