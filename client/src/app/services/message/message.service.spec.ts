/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { SocketService } from '@app/services/socket/socket.service';
import { GameSessionEvent } from '@common/model/events/game-session.events';
import { Message, MessageAuthor } from '@common/model/message';
import { MessageService } from './message.service';

import SpyObj = jasmine.SpyObj;

describe('MessageService', () => {
    let service: MessageService;
    let socketServiceSpy: SpyObj<SocketService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj(SocketService, ['on', 'send']);

        TestBed.configureTestingModule({
            providers: [
                MessageService,
                {
                    provide: SocketService,
                    useValue: socketServiceSpy,
                },
            ],
        });
        service = TestBed.inject(MessageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('receiveMessage() should add message to messages list', () => {
        const message: Message = {
            content: 'Hello World!',
            author: MessageAuthor.User,
            time: Date.now(),
        };
        service.receiveMessage(message);
        expect(service.messages.length).toBe(1);
        expect(service.messages[0]).toBe(message);
    });

    it('sendMessage should call socketService.send()', () => {
        const message: Message = {
            content: 'Hello World!',
            author: MessageAuthor.User,
            time: Date.now(),
        };
        service.sendMessage(message);
        expect(socketServiceSpy.send).toHaveBeenCalledWith(GameSessionEvent.Message, message);
    });
});
