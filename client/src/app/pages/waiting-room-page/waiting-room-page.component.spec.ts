import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivatedRoute } from '@angular/router';
import { WaitingRoomComponent } from '@app/components/waiting-room/waiting-room.component';
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';
import { CommunicationService } from '@app/services/communication/communication.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { SocketService } from '@app/services/socket/socket.service';
import { WaitingRoomPageComponent } from './waiting-room-page.component';

import SpyObj = jasmine.SpyObj;

describe('WaitingRoomPageComponent', () => {
    let component: WaitingRoomPageComponent;
    let fixture: ComponentFixture<WaitingRoomPageComponent>;
    let gameStartServiceSpy: SpyObj<GameStartService>;
    let socketServiceSpy: SpyObj<SocketService>;

    beforeEach(async () => {
        gameStartServiceSpy = jasmine.createSpyObj(CommunicationService, ['deleteGame', 'startSoloGame', 'startMultiplayerGame']);
        socketServiceSpy = jasmine.createSpyObj(SocketService, ['send', 'on']);

        await TestBed.configureTestingModule({
            declarations: [WaitingRoomComponent],
            imports: [...getTranslocoTestingModules()],
            providers: [
                { provide: GameStartService, useValue: gameStartServiceSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {},
                },
                { provide: SocketService, useValue: socketServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitingRoomPageComponent);
        component = fixture.componentInstance;
        spyOn(component, 'setUpRouteDetails').and.callFake(() => {
            return;
        });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
