/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { UserInfo } from '@app/interfaces/user-info';
import { ClassicModeComponent } from '@app/pages/classic-mode/classic-mode.component';
import { AccountService } from '@app/services/account/account.service';
import { ModalService } from '@app/services/modal/modal.service';
import { SocketService } from '@app/services/socket/socket.service';
import { of } from 'rxjs';
import { GameStartService } from './game-start.service';

import SpyObj = jasmine.SpyObj;

describe('GameStartService', () => {
    let service: GameStartService;
    let modalSpy: SpyObj<MatDialog>;
    let socketServiceSpy: SpyObj<SocketService>;
    let modalServiceSpy: SpyObj<ModalService>;
    let routerSpy: SpyObj<Router>;
    let accountServiceSpy: SpyObj<AccountService>;
    const userInfo: UserInfo = {
        username: 'bob',
        password: '123',
    };

    beforeEach(() => {
        modalSpy = jasmine.createSpyObj(MatDialog, ['open', 'close', 'closeAll']);
        socketServiceSpy = jasmine.createSpyObj(SocketService, ['on', 'send', 'once', 'executeOnSocketCreation']);
        socketServiceSpy.executeOnSocketCreation.and.returnValue(jasmine.createSpyObj('Subscription', ['unsubscribe']));
        modalServiceSpy = jasmine.createSpyObj(ModalService, ['createActionModal', 'createLoadingModal', 'createInformationModal']);
        routerSpy = jasmine.createSpyObj(Router, ['navigate']);
        accountServiceSpy = jasmine.createSpyObj(AccountService, ['startSoloGame', 'startMultiplayerGame', 'getUsername', 'getUser']);
        accountServiceSpy.getUsername.and.returnValue('user');
        accountServiceSpy.getUser.and.returnValue(of(userInfo));

        accountServiceSpy.user = { username: 'user', password: 'User1234' };

        TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([{ path: 'classic', component: ClassicModeComponent }]), HttpClientTestingModule],
            providers: [
                GameStartService,
                { provide: MatDialog, useValue: modalSpy },
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: ModalService, useValue: modalServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: AccountService, useValue: accountServiceSpy },
                provideHttpClientTesting(),
            ],
        });
        service = TestBed.inject(GameStartService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
