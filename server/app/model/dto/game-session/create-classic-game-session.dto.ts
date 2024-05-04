import { IsObjectId } from '@app/class-validators/is-object-id/is-object-id.class-validator';
import { FriendsGameType } from '@common/enums/friends-game-type';
import { GameMode } from '@common/game-mode';
import { CreateClassicGameSessionDto as CreateGameSessionInterface } from '@common/model/dto/create-game-session';

export class CreateClassicGameSessionDto implements CreateGameSessionInterface {
    @IsObjectId()
    gameId: string;
    waitingRoomId?: string;
    username: string;
    gameMode: GameMode.Classic | GameMode.ClassicTeam;
    friendsGameType?: FriendsGameType;

    // eslint-disable-next-line max-params
    constructor(gameId: string, username: string, gameMode: GameMode.Classic | GameMode.ClassicTeam, friendsGameType?: FriendsGameType) {
        this.gameId = gameId;
        this.username = username;
        this.gameMode = gameMode;
        this.friendsGameType = friendsGameType;
    }
}
