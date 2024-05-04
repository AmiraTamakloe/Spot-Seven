import { Component, OnInit, AfterViewInit, ElementRef, QueryList, ViewChild, ViewChildren, Input } from '@angular/core';
import { ChatService } from '@app/services/chat/chat.service';
import { TokenService } from '@app/services/token/token.service';
import { ChatMessage } from '@common/model/message';
import { MAX_MESSAGE_LENGTH } from './constants';

@Component({
    selector: 'app-convo',
    templateUrl: './convo.component.html',
    styleUrl: './convo.component.scss',
})
export class ConvoComponent implements AfterViewInit, OnInit {
    @Input() chatId: string = '';
    @Input() chatname: string = '';
    @ViewChildren('messagesList') private messagesList!: QueryList<HTMLDivElement>;
    @ViewChild('messagesDiv') private messagesDiv!: ElementRef<HTMLDivElement>;
    @ViewChild('messageInput') private messagesInput!: ElementRef<HTMLInputElement>;
    maxMessageLength: number = MAX_MESSAGE_LENGTH;
    messageContent: string = '';
    messageReceiver: string = '';
    usernames: string[] = [];

    constructor(protected chatService: ChatService, private tokenService: TokenService) {}

    ngOnInit(): void {
        const username = this.tokenService.getUsername();
        this.chatService.getUserId(username);
        this.chatService.selectChat(this.chatId, this.tokenService.getUsername());
        this.getUsersOfChat();
    }

    ngAfterViewInit(): void {
        this.messagesList.changes.subscribe(() => {
            this.scrollToBottom(); // FIX ME
        });
    }

    scrollToBottom() {
        this.messagesDiv.nativeElement.scrollTop = this.messagesDiv.nativeElement.scrollHeight;
    }

    getMessageTime(_: number, message: ChatMessage) {
        return message.time;
    }

    async getUsersOfChat() {
        await this.chatService.getUsersOfChat(this.chatId).subscribe((users: string[]) => {
            this.usernames = users;
        });
    }

    trackByMessage(index: number, item: { chatMessage: ChatMessage; authorId: string }): string {
        return item.chatMessage.time;
    }

    handleKeyUp(event: KeyboardEvent) {
        if (event.key !== 'Enter') {
            return;
        }
        this.submitMessage();
    }

    submitMessage() {
        this.messagesInput.nativeElement.focus();

        if (this.messageContent.length > MAX_MESSAGE_LENGTH || this.chatService.activeChatId === '') {
            return;
        }

        if (this.messageContent.trim().length === 0) {
            this.messageContent = '';
            return;
        }
        this.chatService.sendMessage({
            author: this.tokenService.getUsername(),
            content: this.messageContent,
            time: '',
            destination: this.chatService.activeChatId,
        });
        this.messageContent = '';
    }
}
