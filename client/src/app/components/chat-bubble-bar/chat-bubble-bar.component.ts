import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-chat-bubble-bar',
    templateUrl: './chat-bubble-bar.component.html',
    styleUrl: './chat-bubble-bar.component.scss',
})
export class ChatBubbleBarComponent {
    @Input() chatId: string = '';
    @Input() chatName: string = '';
}
