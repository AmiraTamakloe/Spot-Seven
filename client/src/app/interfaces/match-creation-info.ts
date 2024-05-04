import { FriendsGameType } from '@common/enums/friends-game-type';
import { GameMode } from '@common/game-mode';

export interface BaseMatchCreationInfo {
    gameMode: GameMode;
    friendsGameType?: FriendsGameType;
}

export interface ClassicMatchCreationInfo extends BaseMatchCreationInfo {
    gameId: string;
    gameMode: GameMode.Classic | GameMode.ClassicTeam;
}

export interface TimeLimitedMatchCreationInfo extends BaseMatchCreationInfo {
    gameMode: GameMode.TimeLimited | GameMode.TimeLimitedImproved;
}
export type MatchCreationInfo = ClassicMatchCreationInfo | TimeLimitedMatchCreationInfo;
