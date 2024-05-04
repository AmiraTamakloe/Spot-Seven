import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { RequestOptions } from '@app/enums/request-options';
import { Friendship } from '@app/interfaces/friendship';
import { UserInfo } from '@app/interfaces/user-info';
import { AccountService } from '@app/services/account/account.service';
import { SocketService } from '@app/services/socket/socket.service';
import { FriendshipEvent } from '@common/model/events/friendship.events';
import { Observable, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class FriendService {
    refreshEvent = new EventEmitter();
    id?: string;
    private readonly baseUrl: string = environment.serverUrl;
    constructor(private readonly http: HttpClient, private readonly accountService: AccountService, private socketService: SocketService) {
        this.refresh();
    }

    refresh(): void {
        this.socketService.on(FriendshipEvent.RefreshData, () => {
            this.refreshEvent.emit();
        });
    }

    getAllUsers(): Observable<UserInfo[]> {
        return this.accountService.getUser().pipe(
            switchMap((user) => {
                const userId = user._id;
                this.id = userId;
                return this.http.get<UserInfo[]>(`${this.baseUrl}/users/${userId}`);
            }),
        );
    }

    getAllFriendship(): Observable<Friendship[]> {
        return this.http.get<Friendship[]>(`${this.baseUrl}/users/friends/`);
    }

    getFriends(): Observable<Friendship[]> {
        return this.accountService.getUser().pipe(
            switchMap((user) => {
                const userId = user._id;
                return this.http.get<Friendship[]>(`${this.baseUrl}/users/${userId}/friends/`);
            }),
        );
    }

    getFriendsOfFriend(friendId: string): Observable<{ user: UserInfo; canInteract: boolean }[]> {
        return this.accountService.getUser().pipe(
            switchMap((user) => {
                const userId = user._id;
                return this.http.get<{ user: UserInfo; canInteract: boolean }[]>(`${this.baseUrl}/users/${userId}/friends-of-friend/${friendId}`);
            }),
        );
    }

    sendFriendRequest(receiverId: string) {
        return this.http.post<Friendship>(`${this.baseUrl}/users/follow`, { senderId: this.id, receiverId }).subscribe((response) => {
            this.refreshEvent.emit();
            return response;
        });
    }

    removeFriend(friendshipId: string) {
        return this.http.delete<Friendship>(`${this.baseUrl}/users/friends/${friendshipId}`).subscribe((response) => {
            this.refreshEvent.emit();
            return response;
        });
    }

    getFriendRequests() {
        return this.accountService.getUser().pipe(
            switchMap((user) => {
                const userId = user._id;
                return this.http.get<Friendship[]>(`${this.baseUrl}/users/${userId}/friend-requests/received`);
            }),
        );
    }

    getFriendRequestsSent() {
        return this.accountService.getUser().pipe(
            switchMap((user) => {
                const userId = user._id;
                return this.http.get<Friendship[]>(`${this.baseUrl}/users/${userId}/friend-requests/sent`);
            }),
        );
    }

    acceptOrDeclineFriendRequest(friendshipId: string, inviteResponse: RequestOptions) {
        return this.http.post<Friendship>(`${this.baseUrl}/users/friend-requests/`, { friendshipId, inviteResponse }).subscribe((response) => {
            this.refreshEvent.emit();
            return response;
        });
    }

    blockUser(friendshipId: string, blockedUserId: string) {
        return this.http.post<Friendship>(`${this.baseUrl}/users/block/`, { friendshipId, blockedUserId }).subscribe((response) => {
            this.refreshEvent.emit();
            return response;
        });
    }

    unblockUser(friendshipId: string) {
        return this.http.post<Friendship>(`${this.baseUrl}/users/unblock/`, { friendshipId }).subscribe((response) => {
            this.refreshEvent.emit();
            return response;
        });
    }

    blockedUsers() {
        return this.accountService.getUser().pipe(
            switchMap((user) => {
                const userId = user._id;
                return this.http.get<Friendship[]>(`${this.baseUrl}/users/${userId}/block/`);
            }),
        );
    }

    removeFriendRequest(friendshipId: string) {
        return this.http.delete<Friendship>(`${this.baseUrl}/users/friend-requests/${friendshipId}`).subscribe((response) => {
            this.refreshEvent.emit();
            return response;
        });
    }
}
