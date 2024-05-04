import { IsObjectId } from '@app/class-validators/is-object-id/is-object-id.class-validator';
import { FriendsGameType } from '@common/enums/friends-game-type';
import { GameMode } from '@common/game-mode';
import { CreateTimeLimitedGameSessionDto as CreateGameSessionInterface } from '@common/model/dto/create-game-session';

export class CreateTimeLimitedGameSessionDto implements CreateGameSessionInterface {
    @IsObjectId()
    waitingRoomId: string;
    username: string;
    gameMode: GameMode.TimeLimited | GameMode.TimeLimitedImproved;
    friendsGameType?: FriendsGameType;

    // eslint-disable-next-line max-params
    constructor(
        waitingRoomId: string,
        username: string,
        gameMode: GameMode.TimeLimited | GameMode.TimeLimitedImproved,
        friendsGameType?: FriendsGameType,
    ) {
        this.waitingRoomId = waitingRoomId;
        this.username = username;
        this.gameMode = gameMode;
        this.friendsGameType = friendsGameType;
    }
}
