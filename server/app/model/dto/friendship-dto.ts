/* eslint-disable max-params */
import { UserDto } from './user-dto';

export class FriendshipDto {
    id: string;
    sender: UserDto;
    receiver: UserDto;
    blockedUser: string;
    status: string;

    constructor(id: string, username: UserDto, password: UserDto, blockedUser: string, status: string) {
        this.id = id;
        this.sender = username;
        this.receiver = password;
        this.blockedUser = blockedUser;
        this.status = status;
    }
}
