import { Component, EventEmitter, Output } from '@angular/core';
import { ChatService } from '@app/services/chat/chat.service';
import { TokenService } from '@app/services/token/token.service';
import { MAX_CONVO_NAME_LENGTH } from './constants';

@Component({
    selector: 'app-create-chat',
    templateUrl: './create-chat.component.html',
    styleUrl: './create-chat.component.scss',
})
export class CreateChatComponent {
    @Output() switchToJoinedEvent = new EventEmitter<void>();
    chatName: string = '';
    maxNameConvo: number = MAX_CONVO_NAME_LENGTH;
    constructor(private chatService: ChatService, private tokenService: TokenService) {}

    async create() {
        if (this.chatName.length < 1 || this.chatName.length > MAX_CONVO_NAME_LENGTH) {
            return;
        }
        const nameOfChat = this.chatName;
        await this.chatService.lookUpUser(this.tokenService.getUsername()).subscribe(async (userId) => {
            await this.chatService.createChat(nameOfChat, userId);
        });

        this.chatName = '';
        this.switchToJoinedEvent.emit();
    }
}
