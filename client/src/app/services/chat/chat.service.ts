/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { ChatData, MessageData, UsersOfChat } from '@common/interfaces/chat/chat.interface';
import { ChatSessionEvent } from '@common/model/events/chat-session.events';
import { ChatMessage } from '@common/model/message';
import { Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class ChatService implements OnDestroy {
    quitActiveChat: EventEmitter<void> = new EventEmitter<void>();

    messages: MessageData[] = [];
    activeChatId: string = '';
    userId: string = '';
    joinedChats: ChatData[] = [];
    joinableChats: ChatData[] = [];
    usernames: string[] = [];
    private socketCreatedSubscription: Subscription;
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private socketService: SocketService, private readonly http: HttpClient) {
        this.socketCreatedSubscription = this.socketService.executeOnSocketCreation({
            next: (isSocketCreated: boolean) => {
                if (isSocketCreated) {
                    this.setSocketEvents();
                }
            },
        });
    }

    ngOnDestroy(): void {
        this.messages = [];
        this.socketCreatedSubscription.unsubscribe();
    }

    setSocketEvents() {
        this.socketService.on(ChatSessionEvent.Message, (message: MessageData) => {
            this.receiveMessage(message);
        });

        this.socketService.on(ChatSessionEvent.UpdatedChatsList, (newChat: ChatData) => {
            this.updateChatList(newChat);
        });

        this.socketService.on(ChatSessionEvent.GetJoinableChats, (chats: ChatData[]) => {
            this.joinableChats = chats;
        });

        this.socketService.on(ChatSessionEvent.GetJoinedChats, (chats: ChatData[]) => {
            this.joinedChats = chats;
        });

        this.socketService.on(ChatSessionEvent.SelectChat, (chat: MessageData[]) => {
            this.selectChatEvent(chat);
        });

        this.socketService.on(ChatSessionEvent.GetUserId, (userId: string) => {
            this.userId = userId;
        });

        this.socketService.on(ChatSessionEvent.UsersOfChat, (request: UsersOfChat) => {
            if (this.activeChatId === request.chatID) this.usernames = request.users;
        });

        this.socketService.on(ChatSessionEvent.QuitChat, (request: { chatID: string }) => {
            this.quitChatEvent(request.chatID);
        });
    }

    removeSocketEvents() {
        this.socketService.off(ChatSessionEvent.Message, (message: MessageData) => {});
        this.socketService.off(ChatSessionEvent.UpdatedChatsList, (newChat: ChatData) => {});
        this.socketService.off(ChatSessionEvent.GetJoinableChats, (chats: ChatData[]) => {});
        this.socketService.off(ChatSessionEvent.GetJoinedChats, (chats: ChatData[]) => {});
        this.socketService.off(ChatSessionEvent.SelectChat, (chat: MessageData[]) => {});
        this.socketService.off(ChatSessionEvent.GetUserId, (userId: string) => {});
        this.socketService.off(ChatSessionEvent.UsersOfChat, (request: UsersOfChat) => {});
        this.socketService.off(ChatSessionEvent.QuitChat, (request: { chatID: string }) => {});
    }

    createChat(name: string, userId: string) {
        const newChat = { name, userId };
        this.socketService.send(ChatSessionEvent.CreateChat, newChat);
    }

    getJoinableChats(username: string) {
        this.socketService.send(ChatSessionEvent.GetJoinableChats, username);
    }

    getJoinedChats(username: string) {
        this.socketService.send(ChatSessionEvent.GetJoinedChats, username);
    }

    joinChat(chatId: string, username: string) {
        this.socketService.send(ChatSessionEvent.JoinChat, { chatID: chatId, user: username }, () => {
            this.selectChat(chatId, username);
        });
    }

    selectChat(chatId: string, username: string) {
        this.messages = [];
        this.activeChatId = chatId;
        this.joinableChats = this.joinableChats.filter((chat) => chat.chatId !== chatId);
        this.socketService.send(ChatSessionEvent.SelectChat, { id: chatId, user: username });
    }

    receiveMessage(message: { chatMessage: ChatMessage; authorId: string }) {
        if (this.activeChatId !== message.chatMessage.destination) {
            return;
        }
        this.messages.push(message);
    }

    sendMessage(message: ChatMessage) {
        if (message.content.length < 1 || message.destination.length < 1) {
            return;
        }
        this.activeChatId = message.destination;
        this.socketService.send(ChatSessionEvent.Message, message);
    }

    getUserId(username: string) {
        this.socketService.send(ChatSessionEvent.GetUserId, username);
    }

    lookUpUser(username: string): Observable<string> {
        return this.http.get(`${this.baseUrl}/chat/${username}`, { responseType: 'text' });
    }

    getChatName(chatId: string): Observable<string> {
        return this.http.get(`${this.baseUrl}/chat/chatname/${chatId}`, { responseType: 'text' });
    }

    quitChat(chatId: string, username: string) {
        this.joinedChats = this.joinedChats.filter((chat) => chat.chatId !== chatId);
        this.socketService.send(ChatSessionEvent.QuitChat, { chatID: chatId, user: username });
    }

    quitChatEvent(chatID: string) {
        this.joinedChats = this.joinedChats.filter((chat) => chat.chatId !== chatID);
        this.joinableChats = this.joinableChats.filter((chat) => chat.chatId !== chatID);
        if (this.activeChatId === chatID) {
            this.quitActiveChatEvent();
            this.activeChatId = '';
        }
    }

    selectChatEvent(chat: MessageData[]) {
        if (!chat.length) {
            this.messages = [];
            return;
        }
        this.messages = chat;
    }

    updateChatList(newChat: ChatData) {
        if (newChat.isOwner) {
            this.joinedChats.push(newChat);
        } else {
            this.joinableChats.push(newChat);
        }
    }

    quitActiveChatEvent() {
        this.quitActiveChat.emit();
    }

    getQuitActiveChatEvent(): EventEmitter<void> {
        return this.quitActiveChat;
    }

    getUsersOfChat(chatId: string): Observable<string[]> {
        return this.http.get<string[]>(`${this.baseUrl}/chat/users/${chatId}`);
    }

    receiveMessageReplay(message: ChatMessage) {
        this.messages.push({ chatMessage: message, authorId: message.author });
    }
}
