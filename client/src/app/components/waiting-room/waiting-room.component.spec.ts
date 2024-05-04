import { ComponentFixture, TestBed } from '@angular/core/testing';

import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';
import { CommunicationService } from '@app/services/communication/communication.service';
// eslint-disable-next-line import/no-deprecated
import { UserInfo } from '@app/interfaces/user-info';
import { AccountService } from '@app/services/account/account.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { SocketService } from '@app/services/socket/socket.service';
import { WaitingRoom } from '@common/interfaces/base-waiting-room.interface';
import { SessionType } from '@common/model/guess-result';
import { Player } from '@common/model/player';
import { WaitingRoomStatus } from '@common/model/waiting-room-status';
import { of } from 'rxjs';
import { WaitingRoomComponent } from './waiting-room.component';

import SpyObj = jasmine.SpyObj;
import { GameMode } from '@common/game-mode';
import { ExistingGame } from '@common/model/game';

describe('WaitingRoomComponent', () => {
    const player: Player = {
        socketId: '123',
        username: 'Cool player',
    };

    const baseWaitingRoom: WaitingRoom = {
        game: {} as ExistingGame,
        gameMode: GameMode.Classic,
        id: '0',
        waitingPlayers: [],
        creator: player,
        sessionType: SessionType.Classic,
        joinState: WaitingRoomStatus.Created,
    };

    const userInfo: UserInfo = {
        username: 'John',
        password: '123',
    };

    let component: WaitingRoomComponent;
    let fixture: ComponentFixture<WaitingRoomComponent>;
    let gameStartServiceSpy: SpyObj<GameStartService>;
    let socketServiceSpy: SpyObj<SocketService>;
    let accountServiceSpy: SpyObj<AccountService>;

    beforeEach(async () => {
        gameStartServiceSpy = jasmine.createSpyObj(CommunicationService, ['deleteGame', 'startSoloGame', 'startMultiplayerGame']);
        socketServiceSpy = jasmine.createSpyObj(SocketService, ['on', 'send']);
        accountServiceSpy = jasmine.createSpyObj('AccountService', ['getSpecificUser', 'getUsername']);
        accountServiceSpy.getSpecificUser.and.returnValue(of(userInfo));

        await TestBed.configureTestingModule({
            declarations: [WaitingRoomComponent],
            imports: [...getTranslocoTestingModules()],
            providers: [
                { provide: GameStartService, useValue: gameStartServiceSpy },
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: AccountService, useValue: accountServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitingRoomComponent);
        component = fixture.componentInstance;
        component.waitingRoom = baseWaitingRoom;
        fixture.detectChanges();
    });

    it('should create', () => {
        component.waitingRoom = baseWaitingRoom;
        expect(component).toBeTruthy();
    });
});
