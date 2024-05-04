// FIXME: REPAIR THIS TEST
// /* eslint-disable @typescript-eslint/no-explicit-any */

// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { MessageService } from '@app/services/message/message.service';
// import { TimeLimitedModeService } from '@app/services/time-limited-mode/time-limited-mode.service';

// import { ButtonStubComponent } from '@app/stubs/button.component.stub';
// import { ImageAreaGameStubComponent } from '@app/stubs/image-area-game.component.stub';
// import { MessageBarStubComponent } from '@app/stubs/message-bar.component.stub';
// import { TimerStubComponent } from '@app/stubs/timer.component.stub';
// import { TimeLimitedModeComponent } from './time-limited-mode.component';
// import SpyObj = jasmine.SpyObj;
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { ModalService } from '@app/services/modal/modal.service';
// import { SocketService } from '@app/services/socket/socket.service';

// describe('TimeLimitedModeComponent', () => {
//     let component: TimeLimitedModeComponent;
//     let fixture: ComponentFixture<TimeLimitedModeComponent>;
//     let timeLimitedModeServiceSpy: SpyObj<TimeLimitedModeService>;
//     let modalServiceSpy: SpyObj<ModalService>;
//     let messageServiceSpy: SpyObj<MessageService>;
//     let socketServiceSpy: SpyObj<SocketService>;

//     beforeEach(async () => {
//         socketServiceSpy = jasmine.createSpyObj(SocketService, ['send', 'on', 'once']);
//         timeLimitedModeServiceSpy = jasmine.createSpyObj(TimeLimitedModeService, [
// 'initialize', 'showModal', 'endGame', 'giveUp', 'setupCheatMode']);
//         timeLimitedModeServiceSpy.gameInfo = {} as any;
//         timeLimitedModeServiceSpy.gameInfo.game = {} as any;
//         timeLimitedModeServiceSpy.gameInfo.game.name = 'Bonjour';
//         modalServiceSpy = jasmine.createSpyObj(ModalService, ['createConfirmModal']);
//         messageServiceSpy = jasmine.createSpyObj(MessageService, ['addMessage']);
//         await TestBed.configureTestingModule({
//             imports: [HttpClientTestingModule],
//             declarations: [ButtonStubComponent, ImageAreaGameStubComponent, TimerStubComponent, MessageBarStubComponent],
//             providers: [
//                 { provide: TimeLimitedModeService, useValue: timeLimitedModeServiceSpy },
//                 { provide: ModalService, useValue: modalServiceSpy },
//                 { provide: MessageService, useValue: messageServiceSpy },
//                 { provide: SocketService, useValue: socketServiceSpy },
//             ],
//         }).compileComponents();

//         TestBed.overrideProvider(TimeLimitedModeService, { useValue: timeLimitedModeServiceSpy });

//         fixture = TestBed.createComponent(TimeLimitedModeComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//         // component['timer'] = { stop: () => undefined } as TimerStubComponent;
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });
// });
