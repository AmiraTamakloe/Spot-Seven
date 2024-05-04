import { Component, Input, OnInit } from '@angular/core';
import { ChatMessage } from '@common/model/message';
@Component({
    selector: 'app-message[message]',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit {
    @Input() message!: { chatMessage: ChatMessage; authorId: string };
    @Input() userId: string = '';
    isFromUser: boolean = false;

    get messageTime() {
        const date = new Date(Number(this.message.chatMessage.time));
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    ngOnInit() {
        this.isFromUser = this.isMessageFromUser();
    }

    isMessageFromUser(): boolean {
        return this.userId === this.message.authorId;
    }
}
