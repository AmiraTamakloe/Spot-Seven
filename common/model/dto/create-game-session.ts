import { FriendsGameType } from '@common/enums/friends-game-type';

import { GameMode } from '@common/game-mode';

export interface BaseGameSessionDto {
    waitingRoomId?: string;
    username: string;
    gameMode: GameMode;
    friendsGameType?: FriendsGameType;
}

export interface CreateClassicGameSessionDto extends BaseGameSessionDto {
    gameId: string;
    gameMode: GameMode.Classic | GameMode.ClassicTeam;
}

export interface CreateTimeLimitedGameSessionDto extends BaseGameSessionDto {
    waitingRoomId?: string;
    username: string;
    gameMode: GameMode.TimeLimited | GameMode.TimeLimitedImproved;
}

export type CreateGameSessionDto = CreateClassicGameSessionDto | CreateTimeLimitedGameSessionDto;
