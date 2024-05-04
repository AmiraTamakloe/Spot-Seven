import { FriendsGameType } from '@common/enums/friends-game-type';
import { SessionType } from '@common/model/guess-result';
import { Player } from '@common/model/player';
import { WaitingRoomStatus } from '@common/model/waiting-room-status';
import { GameMode } from '@common/game-mode';
import { ExistingGame } from '@common/model/game';

export interface BaseWaitingRoom {
    id: string;
    creator: Player;
    waitingPlayers: Player[];
    sessionType: SessionType;
    joinState: WaitingRoomStatus;
    gameMode: GameMode;
    friendsGameType?: FriendsGameType;
    friendsUserIdAllowed?: string[];
}

export interface TimeLimitedWaitingRoom extends BaseWaitingRoom {
    sessionType: SessionType.TimeLimited;
    gameMode: GameMode.TimeLimitedImproved | GameMode.TimeLimited;
}

export interface ClassicSoloWaitingRoom extends BaseWaitingRoom {
    game: ExistingGame;
    sessionType: SessionType.Classic;
    gameMode: GameMode.Classic;
}

export interface ClassicTeamWaitingRoom extends BaseWaitingRoom {
    game: ExistingGame;
    sessionType: SessionType.Classic;
    gameMode: GameMode.ClassicTeam;
    teams: Player[][];
}

export type ClassicWaitingRoom = ClassicSoloWaitingRoom | ClassicTeamWaitingRoom;
export type WaitingRoom = ClassicWaitingRoom | TimeLimitedWaitingRoom;
export type SoloWaitingRoom = ClassicSoloWaitingRoom | TimeLimitedWaitingRoom;
