/* eslint-disable max-params */
export class UserDto {
    username: string;
    password: string;
    email: string;
    avatar: string;
    sentFriendRequests: UserDto[];
    receivedFriendRequests: UserDto[];
    friends: string[];

    constructor(
        username: string,
        password: string,
        email: string,
        avatar: string,
        sentFriendRequests: UserDto[],
        receivedFriendRequests: UserDto[],
        friends: string[],
    ) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.avatar = avatar;
        this.sentFriendRequests = sentFriendRequests;
        this.receivedFriendRequests = receivedFriendRequests;
        this.friends = friends;
    }
}
