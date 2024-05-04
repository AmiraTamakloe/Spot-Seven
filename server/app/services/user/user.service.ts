/* eslint-disable max-params */
import { AVATAR_PATH } from '@app/index.constants';
import { UserConnectionData } from '@app/interfaces/user/user-connection-data.interface';
import { User } from '@app/model/database/user.entity';
import { JwtTokensDto } from '@common/model/dto/jwt-tokens.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
@Injectable()
export class UserService {
    private connectedUsers = new Map<string, UserConnectionData>();
    private socketIdToUsername = new Map<string, string>();

    constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

    isUserConnected(username: string): boolean {
        return this.connectedUsers.has(username);
    }

    disconnectUser(username: string) {
        this.connectedUsers.delete(username);
    }

    getUserConnectionData(username: string): UserConnectionData | undefined {
        return this.connectedUsers.get(username);
    }

    getUserNameFromSocketId(socketId: string): string | undefined {
        return this.socketIdToUsername.get(socketId);
    }

    setConnectedUserTokens(username: string, newToken: JwtTokensDto) {
        const userData = this.connectedUsers.get(username);

        if (!userData) {
            this.connectedUsers.set(username, { token: newToken, socket: '' });
            return;
        }

        userData.token = newToken;
    }

    setConnectedUserSocketId(username: string, socketId: string) {
        const userData = this.connectedUsers.get(username);

        if (!userData) {
            return;
        }

        const oldSocket = userData.socket;

        this.socketIdToUsername.delete(oldSocket);
        userData.socket = socketId;
        this.socketIdToUsername.set(socketId, username);
    }

    async createUser(username: string, password: string, email: string, avatar: string): Promise<User> {
        const saltedHashedPassword = await this.hashPassword(password);
        return await this.userRepository.save(this.userRepository.create({ username, saltedHashedPassword, email, avatar }));
    }

    async createGoogleUserAccount(username: string, email: string): Promise<User> {
        return await this.userRepository.save(this.userRepository.create({ username, email }));
    }

    async getUser(username: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { username } });
    }

    async getUserById(id: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { _id: id } });
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { email } });
    }

    async getUsers(): Promise<User[]> {
        return await this.userRepository.find();
    }

    async getUsersOfChat(chatId: string): Promise<User[]> {
        const users = await this.userRepository
            .createQueryBuilder('user')
            .innerJoin('user.chats', 'chat')
            .where('chat.id = :chatId', { chatId })
            .getMany();
        if (users === undefined) return [];
        return users;
    }

    async getOwnerOfChat(chatId: string): Promise<User | null> {
        return await this.userRepository
            .createQueryBuilder('user')
            .innerJoin('user.ownedChats', 'chat')
            .where('chat.id = :chatId', { chatId })
            .getOne();
    }

    getConnectedUsers(): { key: string; socket: string }[] {
        return Array.from(this.connectedUsers.entries()).map(([key, value]: [string, UserConnectionData]) => ({
            key,
            socket: value.socket,
        }));
    }

    async updateUserParameters(userInfo: User): Promise<User> {
        const user = await this.userRepository.findOne({ where: { _id: userInfo._id } });
        if (user && userInfo.username !== user.username) {
            user.username = userInfo.username;
        }
        if (user && userInfo.avatar.length > 'avatar1.png'.length) {
            user.avatar = await this.saveImage(userInfo.avatar, user._id);
        } else if (user && userInfo.avatar) {
            user.avatar = userInfo.avatar;
        }
        if (user) {
            return await this.userRepository.save(user);
        } else {
            throw new Error('User not found');
        }
    }

    async verifyUserAndPasswordValid(username: string, password: string): Promise<boolean> {
        const user: User | null = await this.userRepository.findOne({ where: { username } });

        if (user === null) return false;

        return await bcrypt.compare(password, user.saltedHashedPassword);
    }

    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        return await bcrypt.hash(password, salt);
    }

    async saveImage(encodedImage: string, userID: string): Promise<string> {
        const imageBuffer = Buffer.from(encodedImage, 'base64');
        const imageName = `image${userID}.png`;
        const directory = join(AVATAR_PATH, imageName);
        try {
            await fs.writeFile(directory, imageBuffer);
            return imageName;
        } catch (error) {
            throw new Error('Error saving image');
        }
    }

    async getAvatarUrl(imageName: string) {
        const directory = join(AVATAR_PATH, imageName);
        try {
            const imageBuffer = await fs.readFile(directory);
            const base64Image = imageBuffer.toString('base64');
            return base64Image;
        } catch (error) {
            throw new Error('Error getting avatar URL');
        }
    }
}
