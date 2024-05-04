import { Component, Input, OnInit } from '@angular/core';
import { avatarsUrl } from '@app/constants/avatars-url';
import { UserInfo } from '@app/interfaces/user-info';
import { AccountService } from '@app/services/account/account.service';
import { FriendService } from '@app/services/friend/friend.service';

@Component({
    selector: 'app-user-modal-card',
    templateUrl: './user-modal-card.component.html',
    styleUrl: './user-modal-card.component.scss',
})
export class UserModalCardComponent implements OnInit {
    @Input() user!: UserInfo;
    @Input() canInteract!: boolean;
    currentAvatar!: string;
    avatarsUrl: { url: string; name: string }[] = avatarsUrl;

    constructor(private accountService: AccountService, private friendService: FriendService) {}

    ngOnInit() {
        if (this.user && this.user.avatar) {
            if (this.avatarsUrl.some((avatar) => avatar.name === this.user.avatar)) {
                this.currentAvatar = `./assets/avatar/${this.user.avatar}`;
            } else {
                this.accountService.getAvatarUrl(this.user.avatar).subscribe((res) => {
                    this.currentAvatar = `data:image/png;base64,${res}`;
                });
            }
        }
    }

    follow() {
        if (this.user._id) {
            this.friendService.sendFriendRequest(this.user._id);
        }
    }
}
