import { ChatMessage } from '@common/model/message';

export interface CreateChat {
    name: string;
    userId: string;
}

export interface JoinChat {
    chatID: string;
    user: string;
}

export interface SelectChat {
    id: string;
    user: string;
}

export interface QuitChat {
    chatID: string;
    user: string;
}

export interface ChatData {
    chatId: string;
    chatname: string;
    isOwner: boolean;
    isQuittable: boolean;
}

export interface MessageData {
    chatMessage: ChatMessage;
    authorId: string;
}

export interface UsersOfChat {
    chatID: string;
    users: string[];
}

export interface ChatGame {
    socketId: string
    newChatData: ChatData;
}