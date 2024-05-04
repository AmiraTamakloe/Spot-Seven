import { Injectable } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { GameSessionEvent } from '@common/model/events/game-session.events';
import { Message } from '@common/model/message';

// TODO: Too coupled with game logic, remove it in favor of ChatService
@Injectable({
    providedIn: 'root',
})
export class MessageService {
    messages: Message[] = [];
    constructor(private socketService: SocketService) {
        this.initialize();
    }

    initialize() {
        this.socketService.on(GameSessionEvent.Message, (message: Message) => {
            this.receiveMessage(message);
        });
    }

    receiveMessage(message: Message) {
        this.messages.push(message);
    }

    sendMessage(message: Message) {
        this.socketService.send(GameSessionEvent.Message, message);
    }
}
