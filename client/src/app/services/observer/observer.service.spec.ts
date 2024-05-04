import { TestBed } from '@angular/core/testing';

import { AccountService } from '@app/services/account/account.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { SocketService } from '@app/services/socket/socket.service';
import { ObserverService } from './observer.service';
import SpyObj = jasmine.SpyObj;

describe('ObserverService', () => {
    let service: ObserverService;
    let socketServiceSpy: SpyObj<SocketService>;
    let accountServiceSpy: SpyObj<AccountService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj(SocketService, ['send', 'on', 'executeOnSocketCreation']);
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
