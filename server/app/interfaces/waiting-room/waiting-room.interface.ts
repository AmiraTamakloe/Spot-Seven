import { Player } from '@app/interfaces/player/player.interface';
import { ExistingGame } from '@app/model/database/game.entity';
import { FriendsGameType } from '@common/enums/friends-game-type';
import { GameMode } from '@common/game-mode';
import { SessionType } from '@common/model/guess-result';
import { WaitingRoomStatus } from '@common/model/waiting-room-status';

export interface BaseWaitingRoom {
    id: string;
    creator: Player;
    waitingPlayers: Player[];
    sessionType: SessionType;
    joinState: WaitingRoomStatus;
    gameMode: GameMode;
    friendsGameType?: FriendsGameType;
    friendsUserIdAllowed?: string[];
    chatId: string;
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
