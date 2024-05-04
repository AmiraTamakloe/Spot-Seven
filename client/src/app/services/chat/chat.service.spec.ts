/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { SocketService } from '@app/services/socket/socket.service';
import { ChatService } from './chat.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import SpyObj = jasmine.SpyObj;

describe('ChatService', () => {
    let service: ChatService;
    let socketServiceSpy: SpyObj<SocketService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj(SocketService, ['on', 'send', 'executeOnSocketCreation']);

        socketServiceSpy.executeOnSocketCreation.and.returnValue(jasmine.createSpyObj('Subscription', ['unsubscribe']));
        TestBed.configureTestingModule({
            providers: [
                ChatService,
                {
                    provide: SocketService,
                    useValue: socketServiceSpy,
                },
            ],
            imports: [HttpClientTestingModule],
        });

        service = TestBed.inject(ChatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
