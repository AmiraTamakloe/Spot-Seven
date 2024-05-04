import { Component, OnInit } from '@angular/core';
import { ChatService } from '@app/services/chat/chat.service';
import { TokenService } from '@app/services/token/token.service';
import { ChatState } from './chat-panel.enum';
import { TranslocoService } from '@ngneat/transloco';

@Component({
    selector: 'app-chat-panel',
    templateUrl: './chat-panel.component.html',
    styleUrl: './chat-panel.component.scss',
})
export class ChatPanelComponent implements OnInit {
    state: string = ChatState.Joined;
    chatId: string = '';
    chatname: string = '';
    header: string = ChatState.Joined;
    username: string = '';

    constructor(public chatService: ChatService, private tokenService: TokenService, private readonly translocoService: TranslocoService) {}

    ngOnInit(): void {
        this.chatService.quitActiveChat.subscribe(() => {
            this.switchToJoined();
        });

        this.username = this.tokenService.getUsername();
        this.chatService.getUserId(this.username);
        this.switchToJoined();
    }

    switchToJoinable() {
        this.chatService.getJoinableChats(this.username);
        this.state = ChatState.Default;
        this.header = this.translocoService.translate('chat-panel.Canaux Joignables');
    }

    switchToCreate() {
        this.state = ChatState.Create;
        this.header = this.translocoService.translate('chat-panel.Créer un Canal');
    }

    switchToJoined() {
        this.chatService.getJoinedChats(this.username);
        this.state = ChatState.Joined;
        this.header = this.translocoService.translate('chat-panel.Vos Canaux');
    }

    switchChats() {
        if (this.state !== ChatState.Default) {
            this.switchToJoinable();
        } else {
            this.switchToJoined();
        }
    }

    async onConvoClicked(chatId: string, chatname: string) {
        this.chatId = chatId;
        this.chatname = chatname;
        this.header = chatname;
        if (this.state === ChatState.Default) {
            this.chatService.joinChat(chatId, this.username);
        } else {
            this.chatService.selectChat(chatId, this.username);
        }
        this.state = ChatState.Convo;
    }

    quitConvo(chatId: string) {
        this.chatService.quitChat(chatId, this.username);
    }
}
