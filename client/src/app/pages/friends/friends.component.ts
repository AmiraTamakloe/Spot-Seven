import { Component, OnInit } from '@angular/core';
import { UserInfo } from '@app/interfaces/user-info';
import { AccountService } from '@app/services/account/account.service';
import { FriendService } from '@app/services/friend/friend.service';

@Component({
    selector: 'app-friends',
    templateUrl: './friends.component.html',
    styleUrl: './friends.component.scss',
})
export class FriendsComponent implements OnInit {
    friendItems!: { user: UserInfo; friendshipId: string }[];
    usersItems!: { user: UserInfo; friendshipId: string }[];
    requestReceivedItems!: { user: UserInfo; friendshipId: string }[];
    requestSentItems!: { user: UserInfo; friendshipId: string }[];
    blockedUserItems!: { user: UserInfo; friendshipId: string }[];

    constructor(private friendService: FriendService, private accountService: AccountService) {}

    async ngOnInit() {
        await this.getData();
        this.friendService.refreshEvent.subscribe(async () => {
            await this.getData();
        });
    }

    async getData() {
        this.friendService.getAllUsers().subscribe((res) => {
            this.usersItems = res.map((item) => {
                return {
                    user: item,
                    friendshipId: '',
                };
            });
        });

        const username = this.accountService.getUsername();
        this.friendService.getFriends().subscribe((res) => {
            this.friendItems = res.map((item) => {
                return {
                    user: item.receiver.username === username ? item.sender : item.receiver,
                    friendshipId: item._id,
                };
            });
        });
        this.friendService.getFriendRequests().subscribe((res) => {
            this.requestReceivedItems = res.map((item) => {
                return {
                    user: item.sender,
                    friendshipId: item._id,
                };
            });
        });
        this.friendService.getFriendRequestsSent().subscribe((res) => {
            this.requestSentItems = res.map((item) => {
                return {
                    user: item.receiver,
                    friendshipId: item._id,
                };
            });
        });
        this.friendService.blockedUsers().subscribe((res) => {
            this.blockedUserItems = res.map((item) => {
                return {
                    user: item.receiver.username === username ? item.sender : item.receiver,
                    friendshipId: item._id,
                };
            });
        });
    }
}
