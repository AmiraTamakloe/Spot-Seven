import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AccountService } from '@app/services/account/account.service';
import { SocketService } from '@app/services/socket/socket.service';
import { FriendService } from './friend.service';

describe('FriendService', () => {
    let httpMock: HttpTestingController;
    let service: FriendService;
    let accountServiceSpy: jasmine.SpyObj<AccountService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        accountServiceSpy = jasmine.createSpyObj('AccountService', ['getUser']);
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: AccountService, useValue: accountServiceSpy },
                { provide: SocketService, useValue: socketServiceSpy },
            ],
        });
        httpMock = TestBed.inject(HttpTestingController);
        service = TestBed.inject(FriendService);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
