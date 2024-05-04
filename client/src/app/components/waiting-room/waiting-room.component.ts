import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { avatarsUrl } from '@app/constants/avatars-url';
import { AccountService } from '@app/services/account/account.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { SocketService } from '@app/services/socket/socket.service';
import { FriendsGameType } from '@common/enums/friends-game-type';
import { WaitingRoom } from '@common/interfaces/base-waiting-room.interface';
import { GameSessionEvent } from '@common/model/events/game-session.events';
import { Player } from '@common/model/player';
import { WaitingRoomStatus } from '@common/model/waiting-room-status';

@Component({
    selector: 'app-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrl: './waiting-room.component.scss',
})
export class WaitingRoomComponent implements OnInit, OnChanges {
    @Input() waitingRoom!: WaitingRoom;
    @Input() gameId?: string;
    creatorAvatar!: string;
    playerNameToAvatar: Map<string, string> = new Map();
    isCreatorAvatarSet: boolean = false;
    avatarsUrl = avatarsUrl;
    friendsOnly = FriendsGameType.FriendsOnly;
    friendsOfFriends = FriendsGameType.FriendsOfFriends;
    teams: Map<number, Player[]> = new Map<number, Player[]>();
    constructor(public gameStartService: GameStartService, private socketService: SocketService, public accountService: AccountService) {}

    id(_: number, item: Player) {
        return item.socketId;
    }

    ngOnInit() {
        this.setupEventListeners();
        this.accountService.getSpecificUser(this.waitingRoom.creator.username).subscribe((creator) => {
            if (this.avatarsUrl.some((avatar) => avatar.name === creator.avatar)) {
                this.creatorAvatar = `./assets/avatar/${creator.avatar}`;
                this.isCreatorAvatarSet = true;
            } else if (creator.avatar) {
                this.accountService.getAvatarUrl(creator.avatar).subscribe((res) => {
                    this.creatorAvatar = `data:image/png;base64,${res}`;
                    this.isCreatorAvatarSet = true;
                });
            }
        });
    }

    ngOnChanges(trackedValue: SimpleChanges): void {
        const updatedPlayers: Player[] = trackedValue.waitingRoom.currentValue.waitingPlayers;
        this.teams = trackedValue.waitingRoom.currentValue.teams;
        if (trackedValue.waitingRoom.previousValue) {
            const pastPlayers: Player[] = trackedValue.waitingRoom.previousValue.waitingPlayers;
            for (const updatedPlayer of updatedPlayers) {
                if (!pastPlayers.includes(updatedPlayer)) {
                    this.setPlayerAvatar(updatedPlayer.username);
                }
            }
        } else {
            for (const updatedPlayer of updatedPlayers) {
                this.setPlayerAvatar(updatedPlayer.username);
            }
        }
    }

    setPlayerAvatar(username: string) {
        let avatarPath = '';
        this.accountService.getSpecificUser(username).subscribe((player) => {
            if (this.avatarsUrl.some((avatar) => avatar.name === player.avatar)) {
                avatarPath = `./assets/avatar/${player.avatar}`;
            } else if (player.avatar) {
                this.accountService.getAvatarUrl(player.avatar).subscribe((res) => {
                    avatarPath = `data:image/png;base64,${res}`;
                });
            }
            this.playerNameToAvatar.set(username, avatarPath);
        });
    }

    isRoomJoinable() {
        return this.waitingRoom.joinState !== WaitingRoomStatus.Full;
    }

    setupEventListeners() {
        this.socketService.on(
            GameSessionEvent.WaitingRoomStateUpdate,
            async (updateInfo: { waitingRoomId: string; updatedState: WaitingRoomStatus }) => {
                if (this.waitingRoom.id === updateInfo.waitingRoomId) {
                    this.waitingRoom.joinState = updateInfo.updatedState;
                }
            },
        );
    }

    isCreator(): boolean {
        return this.waitingRoom.creator.username === this.accountService.getUsername();
    }

    isInRoom(): boolean {
        return this.waitingRoom.waitingPlayers.some((player) => player.username === this.accountService.getUsername());
    }

    isLaunchable(): boolean {
        return this.waitingRoom.waitingPlayers.length > 0;
    }
}
