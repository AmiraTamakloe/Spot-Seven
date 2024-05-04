import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AccountService } from '@app/services/account/account.service';
@Component({
    selector: 'app-error-modal',
    templateUrl: './error-modal.component.html',
    styleUrls: ['./error-modal.component.scss'],
})
export class ErrorModalComponent {
    constructor(private modalRef: MatDialogRef<ErrorModalComponent>, private accountService: AccountService) {}

    close() {
        this.accountService.logOut();
        this.modalRef.close();
    }
}
