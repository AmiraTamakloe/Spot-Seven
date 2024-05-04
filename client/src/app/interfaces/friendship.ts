import { UserInfo } from './user-info';

export interface Friendship {
    _id: string;
    sender: UserInfo;
    receiver: UserInfo;
    blockedUser: string;
    status: string;
}
