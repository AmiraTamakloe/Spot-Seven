import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FriendListModalComponent } from '@app/components/friend-list-modal/friend-list-modal.component';
import { avatarsUrl } from '@app/constants/avatars-url';
import { RequestOptions } from '@app/enums/request-options';
import { UserInfo } from '@app/interfaces/user-info';
import { AccountService } from '@app/services/account/account.service';
import { FriendService } from '@app/services/friend/friend.service';

@Component({
    selector: 'app-friend-card',
    templateUrl: './friend-card.component.html',
    styleUrl: './friend-card.component.scss',
})
export class FriendCardComponent implements OnInit {
    @Input() friend!: UserInfo;
    @Input() status!: string;
    @Input() friendshipId?: string;
    @Input() canInteract?: boolean;
    currentAvatar!: string;
    items!: { user: UserInfo; canInteract: boolean }[];
    avatarsUrl: { url: string; name: string }[] = avatarsUrl;
    constructor(public dialog: MatDialog, private friendService: FriendService, private accountService: AccountService) {}

    ngOnInit() {
        if (!this.friend._id) {
            return;
        }
        this.friendService.getFriendsOfFriend(this.friend._id).subscribe((users) => {
            this.items = users;
        });
        if (this.avatarsUrl.some((avatar) => avatar.name === this.friend.avatar)) {
            this.currentAvatar = `./assets/avatar/${this.friend.avatar}`;
        } else {
            if (this.friend.avatar) {
                this.accountService.getAvatarUrl(this.friend.avatar).subscribe((res) => {
                    this.currentAvatar = `data:image/png;base64,${res}`;
                });
            }
        }
    }

    openDialog() {
        this.dialog.open(FriendListModalComponent, {
            data: { items: this.items, username: this.friend.username },
        });
    }

    block() {
        if (this.friendshipId && this.friend._id) {
            this.friendService.blockUser(this.friendshipId, this.friend._id);
        }
    }

    follow() {
        if (this.friend._id) {
            this.friendService.sendFriendRequest(this.friend._id);
        }
    }

    acceptInvite() {
        if (this.friendshipId) {
            this.friendService.acceptOrDeclineFriendRequest(this.friendshipId, RequestOptions.Accepted);
        }
    }

    declineInvite() {
        if (this.friendshipId) {
            this.friendService.acceptOrDeclineFriendRequest(this.friendshipId, RequestOptions.Declined);
        }
    }

    deleteFriend() {
        if (this.friendshipId) {
            this.friendService.removeFriend(this.friendshipId);
        }
    }

    unsendInvite() {
        if (this.friendshipId) {
            this.friendService.removeFriendRequest(this.friendshipId);
        }
    }

    unblock() {
        if (this.friendshipId) {
            this.friendService.unblockUser(this.friendshipId);
        }
    }
}
