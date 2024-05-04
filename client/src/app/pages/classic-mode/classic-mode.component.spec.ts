/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimerComponent } from '@app/components/timer/timer.component';
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';
import { ChatService } from '@app/services/chat/chat.service';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { ModalService } from '@app/services/modal/modal.service';
import { SocketService } from '@app/services/socket/socket.service';
import { ButtonStubComponent } from '@app/stubs/button.component.stub';
import { ImageAreaGameStubComponent } from '@app/stubs/image-area-game.component.stub';
import { MessageBarStubComponent } from '@app/stubs/message-bar.component.stub';
import { TimerStubComponent } from '@app/stubs/timer.component.stub';
import { ClassicModeComponent } from './classic-mode.component';
import SpyObj = jasmine.SpyObj;
describe('ClassicModeComponent', () => {
    let component: ClassicModeComponent;
    let fixture: ComponentFixture<ClassicModeComponent>;
    let classicModeServiceSpy: SpyObj<ClassicModeService>;
    let modalServiceSpy: SpyObj<ModalService>;
    let socketServiceSpy: SpyObj<SocketService>;
    let chatServiceSpy: SpyObj<ChatService>;

    beforeEach(async () => {
        classicModeServiceSpy = jasmine.createSpyObj(ClassicModeService, [
            'initialize',
            'showModal',
            'endGame',
            'giveUp',
            'setupCheatMode',
            'initializeForGame',
        ]);
        classicModeServiceSpy.gameInfo = {} as any;
        classicModeServiceSpy.gameInfo.game = {} as any;
        modalServiceSpy = jasmine.createSpyObj(ModalService, ['createConfirmModal']);
        socketServiceSpy = jasmine.createSpyObj(SocketService, ['send', 'on']);
        chatServiceSpy = jasmine.createSpyObj(ChatService, ['sendMessage']);

        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, ...getTranslocoTestingModules()],
            declarations: [ClassicModeComponent, ButtonStubComponent, ImageAreaGameStubComponent, TimerStubComponent, MessageBarStubComponent],
            providers: [
                { provide: ClassicModeService, useValue: classicModeServiceSpy },
                { provide: ModalService, useValue: modalServiceSpy },
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: ChatService, useValue: chatServiceSpy },
                { provide: GameStartService, useValue: GameStartService },
            ],
        }).compileComponents();

        TestBed.overrideProvider(ClassicModeService, { useValue: classicModeServiceSpy });

        fixture = TestBed.createComponent(ClassicModeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component['timer'] = { stop: () => undefined } as TimerComponent;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
