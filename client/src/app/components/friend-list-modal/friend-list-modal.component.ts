/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, Component, Inject, OnChanges } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserInfo } from '@app/interfaces/user-info';

@Component({
    selector: 'app-friend-list-modal',
    templateUrl: './friend-list-modal.component.html',
    styleUrls: ['./friend-list-modal.component.scss'],
})
export class FriendListModalComponent implements OnChanges {
    filteredData?: { user: UserInfo; canInteract: boolean }[];
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { items: { user: UserInfo; canInteract: boolean }[]; username: string },
        private cdr: ChangeDetectorRef,
    ) {
        this.filteredData = this.data.items;
    }

    ngOnChanges() {
        this.filteredData = this.data.items;
        this.cdr.detectChanges();
    }
}
