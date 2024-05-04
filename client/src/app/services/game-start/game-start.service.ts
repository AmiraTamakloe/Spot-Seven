import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ActionModalData } from '@app/components/action-modal/action-modal.component';
import { ErrorModalComponent } from '@app/components/error-modal/error-modal.component';
import { GameInfo } from '@app/interfaces/game-info';
import { GameReplayCommand } from '@app/interfaces/game-replay-command';
import { MatchCreationInfo, TimeLimitedMatchCreationInfo } from '@app/interfaces/match-creation-info';
import { AccountService } from '@app/services/account/account.service';
import { ModalService } from '@app/services/modal/modal.service';
import { SocketService } from '@app/services/socket/socket.service';
import { CancelGameResponse } from '@common/cancel-game-responses';
import { FriendsGameType } from '@common/enums/friends-game-type';
import { GameMode } from '@common/game-mode';
import { WaitingRoom } from '@common/interfaces/base-waiting-room.interface';
import { ClassicGameWaitingRooms } from '@common/interfaces/classic-game-waiting-rooms.interface';
import { ObserverGameSession } from '@common/interfaces/observer-game-session.interface';
import { CreateGameSessionDto } from '@common/model/dto/create-game-session';
import { JoinWaitingRoomDto, WaitingRoomType } from '@common/model/dto/join-waiting-room.dto';
import { GameSessionEvent } from '@common/model/events/game-session.events';
import { GlobalEvent } from '@common/model/events/socket-event';
import { GameInfo as CommonGameInfo } from '@common/model/game-info';
import { GuessResultClassicSuccess, GuessResultTimeLimitedSuccess } from '@common/model/guess-result';
import { WaitingRoomStatus } from '@common/model/waiting-room-status';
import { Subscription, firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameStartService implements OnDestroy {
    classicWaitingRooms: WaitingRoom[] = [];
    timeLimitWaitingRooms: WaitingRoom[] = [];
    isObservingPlayer = false;
    observerGameSession?: ObserverGameSession;
    initialGuessResults: (GuessResultClassicSuccess | GuessResultTimeLimitedSuccess)[] = [];

    private _gameInfo: GameInfo | null = null;
    private _replayCommands: GameReplayCommand[] | null = null;

    private username: string = '';
    private _gameMode: GameMode = GameMode.Classic;
    private _gameId?: string;
    private _userId?: string;
    private onExceptionCallbacks: (() => void)[] = [];
    private socketCreatedSubscription: Subscription;

    // Used to inject the required services
    // eslint-disable-next-line max-params
    constructor(
        private modal: MatDialog,
        private socketService: SocketService,
        private modalService: ModalService,
        private router: Router,
        private accountService: AccountService,
    ) {
        this.socketCreatedSubscription = this.socketService.executeOnSocketCreation({
            next: (isSocketCreated: boolean) => {
                if (isSocketCreated) {
                    this.setupEventListeners();
                }
            },
        });
        this.username = this.accountService.getUsername();
        this.accountService.getUser().subscribe((user) => {
            this._userId = user._id;
        });
    }

    get gameInfo(): GameInfo | null {
        const gameInfo = this._gameInfo;
        this._gameInfo = null;
        return gameInfo;
    }

    get replayCommands(): GameReplayCommand[] | null {
        const commands = this._replayCommands;
        this._replayCommands = null;
        return commands;
    }

    set gameInfo(updatedGameInfo: GameInfo) {
        this._gameInfo = updatedGameInfo;
    }

    ngOnDestroy(): void {
        this.socketCreatedSubscription.unsubscribe();
    }

    startReplay(commands: GameReplayCommand[], gameInfo: GameInfo) {
        this._replayCommands = commands;
        this._gameInfo = gameInfo;
        this.router.navigate(['/classic']);
    }

    setGameMode(gameMode: GameMode) {
        this._gameMode = gameMode;
    }

    setGameId(gameId: string) {
        this._gameId = gameId;
    }

    createTimeLimitedWaitingRoom(gameMode: GameMode.TimeLimited | GameMode.TimeLimitedImproved, friendsGameType?: FriendsGameType) {
        const matchCreationInfo: TimeLimitedMatchCreationInfo = {
            gameMode,
            friendsGameType,
        };
        this.createWaitingRoomFromMatchCreation(matchCreationInfo);
    }

    createClassicWaitingRoom(gameMode: GameMode.Classic | GameMode.ClassicTeam, gameId: string, friendsGameType?: FriendsGameType) {
        const matchCreationInfo: MatchCreationInfo = {
            gameMode,
            gameId,
            friendsGameType,
        };
        this.createWaitingRoomFromMatchCreation(matchCreationInfo);
    }

    createWaitingRoomFromMatchCreation(matchCreationInfo: MatchCreationInfo) {
        const username = this.accountService.getUsername();
        let createGameSessionDto: CreateGameSessionDto;
        switch (matchCreationInfo.gameMode) {
            case GameMode.TimeLimited:
            case GameMode.TimeLimitedImproved:
                createGameSessionDto = {
                    gameMode: matchCreationInfo.gameMode,
                    username,
                    friendsGameType: matchCreationInfo.friendsGameType,
                };
                break;
            case GameMode.Classic:
            case GameMode.ClassicTeam:
                createGameSessionDto = {
                    gameId: matchCreationInfo.gameId,
                    gameMode: matchCreationInfo.gameMode,
                    username,
                    friendsGameType: matchCreationInfo.friendsGameType,
                };
                break;
        }
        this.socketService.send<CreateGameSessionDto, WaitingRoomStatus>(GameSessionEvent.StartWaitingRoom, createGameSessionDto);
    }

    joinWaitingRoom(waitingRoomId: string) {
        let joinWaitingRoomDto: JoinWaitingRoomDto;
        if (this._gameMode === GameMode.ClassicTeam) {
            let teamNumber: number;
            const actionModalData: ActionModalData = {
                title: 'Quelle équipe voulez-vous joindre ? ',
                message: '',
                actions: [
                    {
                        label: '1',
                        close: true,
                        callback: () => (teamNumber = 0),
                    },
                    {
                        label: '2',
                        close: true,
                        callback: () => (teamNumber = 1),
                    },
                    {
                        label: '3',
                        close: true,
                        callback: () => (teamNumber = 2),
                    },
                ],
            };

            firstValueFrom(this.modalService.createChoiceModal(actionModalData).afterClosed()).then(() => {
                joinWaitingRoomDto = {
                    waitingRoomId,
                    username: this.username,
                    type: WaitingRoomType.Team,
                    teamNumber,
                };
                this.socketService.send(GameSessionEvent.JoinWaitingRoom, joinWaitingRoomDto);
            });
            return;
        }
        joinWaitingRoomDto = {
            waitingRoomId,
            username: this.username,
            type: WaitingRoomType.Solo,
        };
        this.socketService.send(GameSessionEvent.JoinWaitingRoom, joinWaitingRoomDto);
    }

    launchGame() {
        this.socketService.send(GameSessionEvent.LaunchGame);
    }

    cancelWaitingRoom(roomId?: string) {
        this.modal.closeAll();
        this.socketService.send(GameSessionEvent.CancelWaitingRoom, roomId);
    }

    leaveWaitingRoom() {
        this.socketService.send(GameSessionEvent.PlayerLeftWaitingRoom);
    }

    handleQuitPage() {
        this.socketService.send(GameSessionEvent.LeaveWaitingRoomPage);
    }

    private setupEventListeners() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.socketService.on(GlobalEvent.Exception, (_) => {
            console.log(JSON.stringify(_));
            this.onExceptionCallbacks.forEach((callback) => callback());
            this.modal.open(ErrorModalComponent);
        });

        this.socketService.on(GameSessionEvent.GameSessionCanceled, async (response: CancelGameResponse) => {
            this.modal.closeAll();
            await this.modalService.createInformationModal('Partie annulée', response);
        });

        this.socketService.on(GameSessionEvent.GameStart, (gameInfo: CommonGameInfo) => {
            this.modal.closeAll();
            this._gameInfo = {
                game: gameInfo.game,
                gameMode: this._gameMode,
                username: this.username,
                initialTime: gameInfo.initialTime,
                hintPenalty: gameInfo.hintPenalty,
                differenceFoundBonus: gameInfo.differenceFoundBonus,
            };
            const otherPlayers = gameInfo.usernames.map((username) => {
                if (username !== this.username && !!username) return username;
                return;
            });

            if (otherPlayers) this._gameInfo.otherPlayersUsername = otherPlayers as string[];
            this.isObservingPlayer = false;
            this.observerGameSession = undefined;

            if (this._gameInfo.gameMode === GameMode.Classic || this._gameInfo.gameMode === GameMode.ClassicTeam) {
                this.router.navigate(['/classic']);
            } else {
                this.router.navigate(['/time-limited']);
            }
        });

        this.socketService.on(GameSessionEvent.TimeLimitWaitingRoomsUpdate, (waitingRooms: WaitingRoom[]) => {
            this.timeLimitWaitingRooms = this.filterFriendsOnly(waitingRooms).filter((room) => room.gameMode === this._gameMode);
        });

        this.socketService.on(GameSessionEvent.ClassicWaitingRoomsUpdate, (waitingRoomsOfGame: ClassicGameWaitingRooms) => {
            if (this._gameId === waitingRoomsOfGame.gameId) {
                this.classicWaitingRooms = this.filterFriendsOnly(waitingRoomsOfGame.rooms).filter((room) => room.gameMode === this._gameMode);
            }
        });

        this.socketService.on(GameSessionEvent.TimeLimitWaitingRoomsUpdateFriends, (waitingRooms: WaitingRoom[]) => {
            this.timeLimitWaitingRooms = waitingRooms;
        });

        this.socketService.on(GameSessionEvent.ClassicWaitingRoomsUpdateFriends, (waitingRoomsOfGame: ClassicGameWaitingRooms) => {
            if (this._gameId === waitingRoomsOfGame.gameId) {
                this.classicWaitingRooms = waitingRoomsOfGame.rooms;
            }
        });
    }

    private filterFriendsOnly(waitingRooms: WaitingRoom[]) {
        const updatedWaitingRooms = [];

        for (const waitingRoom of waitingRooms) {
            if (!waitingRoom.friendsGameType) {
                updatedWaitingRooms.push(waitingRoom);
            } else if (waitingRoom.friendsUserIdAllowed?.includes(this._userId as string)) {
                updatedWaitingRooms.push(waitingRoom);
            }
        }
        return updatedWaitingRooms;
    }
}
