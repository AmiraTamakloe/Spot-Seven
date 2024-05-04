import { FriendshipStatus } from '@app/enums/friendship-status.entity';
import { Friendship } from '@app/model/database/friendship.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UserService } from '@app/services/user/user.service';
import { User } from '@app/model/database/user.entity';
import { FriendshipGateway } from '@app/gateways/friendship/friendship.gateway';
import { RequestOptions } from '@app/enums/request-options';

@Injectable()
export class FriendshipService {
    constructor(
        @InjectRepository(Friendship) private friendshipRepository: Repository<Friendship>,
        private userService: UserService,
        private friendshipGateway: FriendshipGateway,
    ) {}

    async getFriendships(): Promise<Friendship[]> {
        return this.friendshipRepository
            .createQueryBuilder('friendship')
            .leftJoinAndSelect('friendship.sender', 'sender')
            .leftJoinAndSelect('friendship.receiver', 'receiver')
            .getMany();
    }

    async getUserBlocked(userId: string): Promise<Friendship[]> {
        return this.friendshipRepository.find({
            where: [
                { sender: { _id: userId }, blockedUser: Not(userId), status: FriendshipStatus.BLOCKED },
                { receiver: { _id: userId }, blockedUser: Not(userId), status: FriendshipStatus.BLOCKED },
            ],
            relations: ['sender', 'receiver'],
        });
    }

    async getUsers(id: string): Promise<User[]> {
        const allUsers = await this.userService.getUsers();
        const friendships = await this.friendshipRepository.find({
            where: [{ sender: { _id: id } }, { receiver: { _id: id } }],
            relations: ['sender', 'receiver'],
        });
        const usersIds: string[] = [];

        friendships.forEach((friendship) => {
            if (friendship.sender && friendship.sender._id === id) {
                usersIds.push(friendship.receiver._id);
            } else if (friendship.receiver && friendship.receiver._id === id) {
                usersIds.push(friendship.sender._id);
            }
        });

        const friends: User[] = [];
        allUsers.forEach((user) => {
            if (!usersIds.includes(user._id) && user._id !== id) {
                friends.push(user);
            }
        });

        return friends;
    }

    async getFriends(userId: string): Promise<Friendship[]> {
        return this.friendshipRepository.find({
            where: [
                { sender: { _id: userId }, status: FriendshipStatus.FRIENDS },
                { receiver: { _id: userId }, status: FriendshipStatus.FRIENDS },
            ],
            relations: ['sender', 'receiver'],
        });
    }

    async getFriendGameUsers(userId: string): Promise<User[]> {
        const friendships = await this.getFriends(userId);
        return friendships.map((friendship) => (friendship.sender._id === userId ? friendship.receiver : friendship.sender));
    }

    async getFriendsofFriend(userId: string, friendId: string): Promise<{ user: User; canInteract: boolean }[]> {
        const userFriend = await this.userService.getUserById(friendId);
        const user = await this.userService.getUserById(userId);
        if (!userFriend || !user) {
            throw new Error('User not found');
        }

        const friendshipOfFriend = await this.getFriends(friendId);
        const userBlocked = await this.getUserBlocked(userId);

        const friendsOfFriend: User[] = await this.getOtherUserInFriendship(friendshipOfFriend, userFriend.username);
        const filteredFriends = friendsOfFriend.filter((friend) => !userBlocked.some((blockedFriend) => blockedFriend.blockedUser === friend._id));

        const userAssociations = await this.friendshipRepository.find({
            where: [{ sender: { _id: userId } }, { receiver: { _id: userId } }],
            relations: ['sender', 'receiver'],
        });
        const associatedFriends = await this.getOtherUserInFriendship(userAssociations, user.username);
        const friendsofFriendList = filteredFriends.map((friend) => {
            const isFriend = associatedFriends.some((associatedFriend) => associatedFriend._id === friend._id);
            const canInteract = !isFriend && friend._id !== userId;
            return { user: friend, canInteract };
        });
        return friendsofFriendList;
    }

    async friendOfFriendGameUsers(userId: string) {
        const userFriends = await this.getFriends(userId);
        const bannedUsers = await this.getUserBlocked(userId);
        const filterBannedUsers = (usersArray: User[]) =>
            usersArray.filter((user) => !bannedUsers.some((bannedUser) => bannedUser.blockedUser === user._id));
        let users: User[] = userFriends.map((friendship) => (friendship.sender._id === userId ? friendship.receiver : friendship.sender));

        for (const friend of users) {
            const friendFriends = await this.getFriends(friend._id);
            const friendUsers = friendFriends.map((friendship) => (friendship.sender._id === friend._id ? friendship.receiver : friendship.sender));
            users = [...users, ...friendUsers];
        }
        return filterBannedUsers(users);
    }

    async getOtherUserInFriendship(friendships: Friendship[], username: string) {
        const users: User[] = [];
        friendships.forEach((friendship) => {
            if (friendship.sender && friendship.sender.username === username) {
                users.push(friendship.receiver);
            } else if (friendship.receiver && friendship.receiver.username === username) {
                users.push(friendship.sender);
            }
        });
        return users;
    }

    async getFriendRequests(userId: string): Promise<Friendship[]> {
        return this.friendshipRepository.find({
            where: {
                receiver: { _id: userId },
                status: FriendshipStatus.PENDING,
            },
            relations: ['sender', 'receiver'],
        });
    }

    async getSentFriendRequests(userId: string): Promise<Friendship[]> {
        return this.friendshipRepository.find({
            where: {
                sender: { _id: userId },
                status: FriendshipStatus.PENDING,
            },
            relations: ['sender', 'receiver'],
        });
    }

    async acceptOrDeclineRequest(data: { friendshipId: string; inviteResponse: string }): Promise<Friendship> {
        const friendship = await this.friendshipRepository.findOne({ where: { _id: data.friendshipId } });
        if (!friendship) {
            throw new Error('Friendship not found');
        }

        if (data.inviteResponse === RequestOptions.Accepted) {
            friendship.status = FriendshipStatus.FRIENDS;
            const savedFriendship = await this.friendshipRepository.save(friendship);
            this.friendshipGateway.refreshData();
            return savedFriendship;
        } else if (data.inviteResponse === RequestOptions.Declined) {
            const savedFriendship = this.friendshipRepository.remove(friendship);
            this.friendshipGateway.refreshData();
            return savedFriendship;
        } else {
            throw new Error('Invalid response');
        }
    }

    async blockUser(friendshipId: string, blockedUserId: string): Promise<Friendship> {
        const friendship = await this.friendshipRepository.findOne({ where: { _id: friendshipId } });
        if (!friendship) {
            throw new Error('Friendship not found');
        }
        friendship.blockedUser = blockedUserId;
        friendship.status = FriendshipStatus.BLOCKED;
        const savedFriendship = await this.friendshipRepository.save(friendship);
        this.friendshipGateway.refreshData();
        return savedFriendship;
    }

    async removeEntry(friendshipId: string): Promise<Friendship> {
        const friendship = await this.friendshipRepository.findOne({ where: { _id: friendshipId } });
        if (!friendship) {
            throw new Error('Friendship not found');
        }
        const savedFriendship = await this.friendshipRepository.remove(friendship);
        this.friendshipGateway.refreshData();
        return savedFriendship;
    }

    async createFriendship(users: { senderId: string; receiverId: string }): Promise<Friendship> {
        const sender = await this.userService.getUserById(users.senderId);
        const receiver = await this.userService.getUserById(users.receiverId);
        if (sender && receiver) {
            const friendship = this.friendshipRepository.create({ sender, receiver, status: FriendshipStatus.PENDING });
            const savedFriendship = await this.friendshipRepository.save(friendship);
            this.friendshipGateway.refreshData();
            return savedFriendship;
        }
        throw new Error('User not found');
    }
}
