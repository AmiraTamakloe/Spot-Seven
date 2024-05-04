import { TestBed } from '@angular/core/testing';

import { AccountService } from './account/account.service';
import { GameStartService } from './game-start/game-start.service';
import { ObserverService } from './observer.service';
import { SocketService } from './socket/socket.service';
import SpyObj = jasmine.SpyObj;

describe('ObserverService', () => {
    let service: ObserverService;
    let socketServiceSpy: SpyObj<SocketService>;
    let accountServiceSpy: SpyObj<AccountService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj(SocketService, ['send', 'on']);
        accountServiceSpy = jasmine.createSpyObj(AccountService, ['getUsername']);

        TestBed.configureTestingModule({
            providers: [
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: GameStartService, useValue: GameStartService },
                { provide: AccountService, useValue: accountServiceSpy },
            ],
        });
        service = TestBed.inject(ObserverService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
