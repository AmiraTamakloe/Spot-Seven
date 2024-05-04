import { GATEWAY_CONFIGURATION_OBJECT } from '@app/gateways/gateway.constants';
import { ChatService } from '@app/services/chat/chat.service';
import { WSValidationPipe } from '@app/validation-pipes/web-socket/web-socket.validation-pipe';
import { ChatData, CreateChat, JoinChat, QuitChat, SelectChat } from '@common/interfaces/chat/chat.interface';
import { ChatSessionEvent } from '@common/model/events/chat-session.events';
import { ChatMessage } from '@common/model/message';
import { Injectable, UsePipes } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(GATEWAY_CONFIGURATION_OBJECT)
@Injectable()
@UsePipes(new WSValidationPipe({ transform: true }))
export class ChatGateway {
    @WebSocketServer()
    server!: Server;
    constructor(private chatService: ChatService) {}

    @SubscribeMessage(ChatSessionEvent.CreateChat)
    async createChat(@MessageBody() chat: CreateChat): Promise<void> {
        await this.chatService.createChat(chat, this.server);
    }

    @SubscribeMessage(ChatSessionEvent.GetJoinableChats)
    async getJoinableChats(@MessageBody() userName: string): Promise<void> {
        await this.chatService.getJoinableChats(this.server, userName);
    }

    @SubscribeMessage(ChatSessionEvent.GetJoinedChats)
    async getJoinedChats(@MessageBody() userName: string): Promise<void> {
        await this.chatService.getJoinedChats(this.server, userName);
    }

    @SubscribeMessage(ChatSessionEvent.JoinChat)
    async joinChat(@MessageBody() request: JoinChat): Promise<void> {
        await this.chatService.joinChat(request, this.server);
    }
    @SubscribeMessage(ChatSessionEvent.Message)
    async message(@MessageBody() message: ChatMessage): Promise<void> {
        await this.chatService.handleMessage(message, this.server);
    }

    @SubscribeMessage(ChatSessionEvent.SelectChat)
    async selectChat(@MessageBody() request: SelectChat): Promise<void> {
        await this.chatService.selectChat(request, this.server);
    }

    @SubscribeMessage(ChatSessionEvent.GetUserId)
    async getUserId(@MessageBody() userName: string): Promise<void> {
        await this.chatService.getUserId(this.server, userName);
    }

    @SubscribeMessage(ChatSessionEvent.QuitChat)
    async quitChat(@ConnectedSocket() socket: Socket, @MessageBody() request: QuitChat): Promise<void> {
        await this.chatService.quitChat(request, this.server, socket);
    }

    @SubscribeMessage(ChatSessionEvent.getJoinedChatsCallBack)
    async getJoinedChatsCallBack(@ConnectedSocket() socket: Socket, @MessageBody() userName: string): Promise<ChatData[]> {
        return this.chatService.getJoinedChatsCallBack(this.server, userName);
    }

    @SubscribeMessage(ChatSessionEvent.getJoinableChatsCallBack)
    async getJoinableChatsCallBack(@ConnectedSocket() socket: Socket, @MessageBody() userName: string): Promise<ChatData[]> {
        return this.chatService.getJoinableChatsCallBack(this.server, socket, userName);
    }
}
