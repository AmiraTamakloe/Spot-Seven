/* eslint-disable max-lines */
/* eslint-disable max-params */
import { ChatMessage as ChatMessageEntity } from '@app/model/database/chat-message.entity';
import { Chat } from '@app/model/database/chat.entity';
import { User } from '@app/model/database/user.entity';
import { UserService } from '@app/services/user/user.service';
import { ChatData, ChatGame, CreateChat, JoinChat, MessageData, QuitChat, SelectChat } from '@common/interfaces/chat/chat.interface';
import { ChatSessionEvent } from '@common/model/events/chat-session.events';
import { ChatMessage } from '@common/model/message';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
@Injectable()
export class ChatService {
    private superChatId = '';
    constructor(
        @InjectRepository(Chat) private chatRepository: Repository<Chat>,
        private userService: UserService,
        @InjectRepository(ChatMessageEntity) private chatMessageRepository: Repository<ChatMessageEntity>,
    ) {
        this.createSuperChat();
    }

    async createChat(chat: CreateChat, server: Server): Promise<void> {
        const user = await this.userService.getUserById(chat.userId);
        if (!user) {
            return;
        }
        const newChat: Chat = await this.chatRepository.save(this.chatRepository.create({ owner: user, name: chat.name }));
        const newChatData: ChatData = { chatId: newChat.id, chatname: newChat.name, isOwner: true, isQuittable: true };

        const userSocket = this.userService.getUserConnectionData(user.username)?.socket;
        if (userSocket) {
            await this.alertUserNewChat(userSocket, server, newChatData);
        }
        const connectedUser = this.userService.getConnectedUsers();

        connectedUser.forEach(async (u) => {
            if (u.socket === userSocket) {
                return;
            }
            newChatData.isOwner = false;
            await this.alertUserNewChat(u.socket, server, newChatData);
        });
    }

    async getJoinableChats(server: Server, username: string): Promise<void> {
        const user = await this.userService.getUser(username);
        if (!user) {
            return;
        }
        await this.checkForSuperChat(user, server);
        const chats = await this.findJoinableChats(user);

        const socketUser = this.userService.getUserConnectionData(username);
        if (socketUser?.socket) {
            server.to(socketUser.socket).emit(ChatSessionEvent.GetJoinableChats, chats);
        }
    }

    async getJoinableChatsCallBack(server: Server, socket: Socket, username: string): Promise<ChatData[]> {
        const user = await this.userService.getUser(username);
        if (!user) {
            return [];
        }
        await this.checkForSuperChat(user, server);
        return this.findJoinableChats(user);
    }

    async findJoinableChats(user: User): Promise<ChatData[]> {
        const chatsOfUser = await this.chatRepository
            .createQueryBuilder('chat')
            .leftJoin('chat.users', 'users')
            .where('users._id = :id', { id: user._id })
            .andWhere('chat.isGameChat = false')
            .groupBy('chat.id')
            .select([
                'chat.id',
                'chat.name',
                'MAX(CAST(users.username AS TEXT)) AS users_username',
                'MAX(CAST(chat.owner_id AS TEXT)) AS owner_id',
                'chat.isQuittable as isQuittable',
            ])
            .getRawMany();
        const chatsOwnedByUser = await this.chatRepository.find({ where: { owner: user } });

        const joinedChats = chatsOfUser.concat(chatsOwnedByUser);

        const allChats = await this.chatRepository.find({ where: { isGameChat: false } });

        const joinableChats = allChats.filter((chat) => {
            return !joinedChats.some((joinedChat) => joinedChat.id === chat.id || joinedChat.chat_id === chat.id);
        });

        const chats = joinableChats.map((chat) => {
            return {
                chatId: chat.id,
                chatname: chat.name,
                isOwner: false,
                isQuittable: chat.isQuittable,
            };
        });
        return chats;
    }

    async getJoinedChats(server: Server, username: string): Promise<void> {
        const user = await this.userService.getUser(username);
        if (!user) {
            return;
        }
        await this.checkForSuperChat(user, server);
        const chats = await this.findJoinedChats(user);

        const socketUser = this.userService.getUserConnectionData(username);
        if (socketUser?.socket) {
            server.to(socketUser.socket).emit(ChatSessionEvent.GetJoinedChats, chats);
        }
    }

    async getJoinedChatsCallBack(server: Server, username: string): Promise<ChatData[]> {
        const user = await this.userService.getUser(username);
        if (!user) {
            return [];
        }
        await this.checkForSuperChat(user, server);
        return await this.findJoinedChats(user);
    }

    async findJoinedChats(user: User): Promise<ChatData[]> {
        const chatsOfUser = await this.chatRepository
            .createQueryBuilder('chat')
            .leftJoin('chat.users', 'users')
            .where('users._id = :id', { id: user._id })
            .groupBy('chat.id')
            .select([
                'chat.id',
                'chat.name',
                'MAX(CAST(users.username AS TEXT)) AS users_username',
                'MAX(CAST(chat.owner_id AS TEXT)) AS owner_id',
                'chat.isQuittable as isQuittable',
            ])
            .getRawMany();
        const chatsOwnedByUser = await this.chatRepository.find({ where: { owner: user } });
        const chats = chatsOfUser.map((chat) => {
            return {
                chatId: chat.id || chat.chat_id,
                chatname: chat.chat_name,
                isOwner: false,
                isQuittable: chat.isquittable,
            };
        });
        chatsOwnedByUser.forEach((chat) => {
            chats.push({ chatId: chat.id, chatname: chat.name, isOwner: true, isQuittable: chat.isQuittable });
        });
        return chats;
    }

    async joinChat(request: JoinChat, server: Server): Promise<void> {
        const user = await this.userService.getUser(request.user);
        if (!user) {
            return;
        }
        const chat = await this.chatRepository.findOne({ relations: { users: true }, where: { id: request.chatID } });
        if (!chat) {
            return;
        }
        chat.users.push(user);
        await this.chatRepository.save(chat);
        await this.usersOfChat(chat.id, server);
    }

    async handleMessage(message: ChatMessage, server: Server): Promise<void> {
        const chat = await this.chatRepository.findOne({ where: { id: message.destination } });
        if (!chat) {
            return;
        }
        message.time = new Date().getTime().toString();
        const messageData = await this.saveMessage(message, chat.id);
        await this.sendToConnectedUsers(messageData, server, chat.id);
    }

    async saveMessage(message: ChatMessage, chatId: string): Promise<MessageData> {
        const author = await this.userService.getUser(message.author);
        if (!author) {
            return { chatMessage: message, authorId: '' };
        }
        const chatMessage = this.chatMessageRepository.create({ chat: { id: chatId }, author, message: message.content, timestamp: message.time });
        await this.chatMessageRepository.save(chatMessage);
        return { chatMessage: message, authorId: author._id };
    }

    async sendToConnectedUsers(message: MessageData, server: Server, chatId: string): Promise<void> {
        const users = await this.userService.getUsersOfChat(chatId);
        users.forEach((user) => {
            const userSocket = this.userService.getUserConnectionData(user.username)?.socket;
            if (userSocket) {
                server.to(userSocket).emit(ChatSessionEvent.Message, message);
            }
        });
        const owner = await this.userService.getOwnerOfChat(chatId);
        if (owner) {
            const ownerSocket = this.userService.getUserConnectionData(owner.username)?.socket;
            if (ownerSocket) {
                server.to(ownerSocket).emit(ChatSessionEvent.Message, message);
            }
        }
    }

    async alertUserNewChat(userSocket: string, server: Server, newChat: ChatData): Promise<void> {
        server.to(userSocket).emit(ChatSessionEvent.UpdatedChatsList, newChat);
    }

    async selectChat(request: SelectChat, server: Server): Promise<void> {
        const mychat: Chat | null = await this.chatRepository.findOne({ where: { id: request.id } });

        if (!mychat) {
            return;
        }
        // get chatMessages that have the chat id
        const chatMessagesEntities = await this.chatMessageRepository
            .createQueryBuilder('chatMessage')
            .innerJoin('chatMessage.chat', 'chat')
            .where('chat.id IN (:...id)', { id: [mychat.id] })
            .getMany();

        const userSocket = this.userService.getUserConnectionData(request.user)?.socket;
        if (chatMessagesEntities.length && userSocket) {
            const chatMessages = await Promise.all(
                chatMessagesEntities.map(async (chatMessageEntity) => {
                    const message = await this.getChatMessage(chatMessageEntity, request.id);
                    return message;
                }),
            );
            server.to(userSocket).emit(ChatSessionEvent.SelectChat, chatMessages);
        }
    }

    async getChatMessage(chatMessage: ChatMessageEntity, id: string): Promise<MessageData> {
        const chatAuthor = await this.chatMessageRepository
            .createQueryBuilder('chatMessage')
            .innerJoinAndSelect('chatMessage.author', 'author')
            .where('chatMessage.messageId = :id', { id: chatMessage.messageId })
            .getOne();

        const myChatMessage: ChatMessage = {
            content: chatMessage.message,
            destination: id,
            time: chatMessage.timestamp,
            author: chatAuthor?.author.username || '',
        };
        const authorID = chatAuthor?.author._id || '';
        return { chatMessage: myChatMessage, authorId: authorID };
    }

    async getUserId(server: Server, username: string): Promise<void> {
        const user = await this.userService.getUser(username);
        const userSocket = this.userService.getUserConnectionData(username)?.socket;
        if (user && userSocket) {
            server.to(userSocket).emit(ChatSessionEvent.GetUserId, user._id);
        }
    }

    async getUserIdForChatCreation(username: string): Promise<string> {
        const user = await this.userService.getUser(username);
        return user?._id || '';
    }

    async getChatName(chatId: string): Promise<string> {
        const chat = await this.chatRepository.findOne({ where: { id: chatId } });
        return chat?.name || '';
    }

    async getChatUsers(chatId: string): Promise<string[]> {
        const users = await this.userService.getUsersOfChat(chatId);
        const usernames = users.map((user) => user.username);
        return usernames || [];
    }

    async quitChat(request: QuitChat, server: Server, socket: Socket): Promise<void> {
        const user = await this.userService.getUser(request.user);
        if (!user) {
            return;
        }
        const chat = await this.chatRepository.findOne({
            relations: {
                users: true,
                owner: true,
            },
            where: { id: request.chatID },
        });
        if (!chat) {
            return;
        }
        if (chat.owner._id === user._id) {
            socket.broadcast.emit(ChatSessionEvent.QuitChat, { chatID: chat.id });
            server.to(socket.id).emit(ChatSessionEvent.QuitChat, { chatID: chat.id });
            await this.chatRepository.remove(chat);
            return;
        } else {
            chat.users = chat.users.filter((u) => {
                return u._id !== user._id;
            });
            await this.chatRepository.save(chat);
            await this.usersOfChat(chat.id, server);
        }
    }

    async usersOfChat(chatId: string, server: Server): Promise<void> {
        const users = await this.userService.getUsersOfChat(chatId);
        const usernames = users.map((user) => user.username);
        users.forEach((userOfChat: User) => {
            const userSocket = this.userService.getUserConnectionData(userOfChat.username)?.socket;
            if (userSocket) {
                server.to(userSocket).emit(ChatSessionEvent.UsersOfChat, { chatID: chatId, users: usernames });
            }
        });
    }

    async createSuperChat(): Promise<void> {
        const superChats = await this.chatRepository.find({ where: { owner: null as never } });
        for (const chat of superChats) {
            await this.chatRepository.remove(chat);
        }

        const superChat = await this.chatRepository.save(this.chatRepository.create({ name: 'General', isQuittable: false }));
        this.superChatId = superChat.id;
    }

    async checkForSuperChat(user: User, server: Server): Promise<void> {
        const superChat = await this.chatRepository.findOne({ where: { id: this.superChatId } });
        if (!superChat) {
            await this.createSuperChat();
        } else {
            const userChat = await this.userService.getUsersOfChat(this.superChatId);
            if (!userChat.some((u) => u._id === user._id)) {
                await this.joinChat({ chatID: this.superChatId, user: user.username }, server);
            }
        }
    }

    async createGameChat(userName: string, gameName: string): Promise<ChatGame | undefined> {
        const user = await this.userService.getUser(userName);
        if (!user) {
            return undefined;
        }
        const newChat: Chat = await this.chatRepository.save(
            this.chatRepository.create({ owner: user, name: gameName, isQuittable: false, isGameChat: true }),
        );
        const newChatData: ChatData = { chatId: newChat.id, chatname: newChat.name, isOwner: true, isQuittable: false };
        const socketId = this.userService.getUserConnectionData(user.username)?.socket;
        if (socketId) {
            return { socketId, newChatData };
        }
        return undefined;
    }

    async alertSpecificUserNewChat(userSocket: string, server: Server, newChat: ChatData): Promise<void> {
        server.to(userSocket).emit(ChatSessionEvent.UpdatedChatsList, newChat);
    }

    async joinGameChat(chatId: string, socketId: string, server: Server, username: string) {
        const user = await this.userService.getUser(username);
        if (!user) {
            return;
        }
        const chat = await this.chatRepository.findOne({ relations: { users: true }, where: { id: chatId } });
        if (!chat) {
            return;
        }
        chat.users.push(user);
        await this.chatRepository.save(chat);
        await this.getJoinedChats(server, username); // for heavy client
        await this.getJoinedChatsCallBack(server, username); // for light client
    }

    async deleteGameChat(chatId: string, server: Server, socket: Socket) {
        const chat = await this.chatRepository.findOne({ where: { id: chatId } });
        if (!chat) {
            return;
        }
        const owner = await this.userService.getOwnerOfChat(chatId);
        if (!owner) {
            const users = await this.userService.getUsersOfChat(chatId);
            users.forEach((u) => {
                const userSocket = this.userService.getUserConnectionData(u.username)?.socket;
                if (userSocket) {
                    server.to(userSocket).emit(ChatSessionEvent.QuitChat, { chatID: chat.id });
                }
            });
            await this.chatRepository.remove(chat);
        }
        if (owner && owner.username) {
            await this.quitChat({ chatID: chatId, user: owner.username }, server, socket);
        }
    }

    async leaveGameChat(chatId: string, socketId: string, server: Server) {
        const username = await this.userService.getUserNameFromSocketId(socketId);
        if (!username) {
            return;
        }
        const user = await this.userService.getUser(username);
        if (!user) {
            return;
        }
        const chat = await this.chatRepository.findOne({
            relations: {
                users: true,
                owner: true,
            },
            where: { id: chatId },
        });
        if (!chat) {
            return;
        }
        chat.users = chat.users.filter((u) => {
            return u._id !== user._id;
        });
        await this.chatRepository.save(chat);
        server.to(socketId).emit(ChatSessionEvent.QuitChat, { chatID: chat.id });
        await this.usersOfChat(chat.id, server);
    }
}
