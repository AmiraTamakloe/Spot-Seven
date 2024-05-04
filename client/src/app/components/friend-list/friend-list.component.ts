/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, Component, Input, OnChanges } from '@angular/core';
import { UserInfo } from '@app/interfaces/user-info';

@Component({
    selector: 'app-friend-list',
    templateUrl: './friend-list.component.html',
    styleUrl: './friend-list.component.scss',
})
export class FriendListComponent implements OnChanges {
    @Input() pageStatus!: string;
    @Input() data?: { user: UserInfo; friendshipId: string }[];
    filteredData?: { user: UserInfo; friendshipId: string }[];

    constructor(private cdr: ChangeDetectorRef) {
        this.filteredData = this.data;
    }

    ngOnChanges() {
        this.filteredData = this.data;
        this.cdr.detectChanges();
    }

    filterUsers(event: any) {
        const searchTerm = event.target.value;
        this.filteredData = this?.data?.filter((item) => item.user.username.toLowerCase().includes(searchTerm.toLowerCase())) ?? [];
        this.cdr.detectChanges();
    }
}
