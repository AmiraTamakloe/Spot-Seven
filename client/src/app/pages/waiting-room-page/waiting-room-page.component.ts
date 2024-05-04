import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonState } from '@app/enums/button-state';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { SocketService } from '@app/services/socket/socket.service';
import { FriendsGameType } from '@common/enums/friends-game-type';
import { GameMode, stringToGameMode } from '@common/game-mode';
import { WaitingRoom } from '@common/interfaces/base-waiting-room.interface';
import { GameSessionEvent } from '@common/model/events/game-session.events';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrl: './waiting-room-page.component.scss',
})
export class WaitingRoomPageComponent implements OnInit {
    gameMode!: GameMode;
    gameId: string = '';
    gameName: string = '';

    createMode = ButtonState.Create;
    joinMode = ButtonState.Join;
    friendsOnly = FriendsGameType.FriendsOnly;
    friendsOfFriends = FriendsGameType.FriendsOfFriends;
    hasFriends = true;

    constructor(public gameStartService: GameStartService, private route: ActivatedRoute, private socketService: SocketService) {}

    ngOnInit(): void {
        this.socketService.send(GameSessionEvent.VerifyFriendships);
        this.setUpRouteDetails();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.socketService.on(GameSessionEvent.VerifyFriendships, (hasFriends: boolean) => {
            this.hasFriends = hasFriends;
        });
    }

    hasNoFriends() {
        return !this.hasFriends;
    }

    setUpRouteDetails() {
        const gameMode = this.route.snapshot.paramMap.get('gameMode');
        const gameId = this.route.snapshot.paramMap.get('gameId');
        const gameName = this.route.snapshot.paramMap.get('gameName');
        if (gameMode !== null) {
            this.gameMode = stringToGameMode(gameMode);
            this.gameStartService.setGameMode(this.gameMode);
        }
        if (gameId !== null) {
            this.gameId = gameId;
            this.gameStartService.setGameId(this.gameId);
        }
        if (gameName !== null) {
            this.gameName = gameName;
        }

        switch (gameMode) {
            case GameMode.TimeLimited:
            case GameMode.TimeLimitedImproved:
                this.socketService.send(GameSessionEvent.FetchWaitingRooms);
                break;
            case GameMode.Classic:
            case GameMode.ClassicTeam:
                this.socketService.send(GameSessionEvent.FetchWaitingRooms, gameId);
                break;
        }
    }

    id(_: number, item: WaitingRoom) {
        return item.id;
    }
}
