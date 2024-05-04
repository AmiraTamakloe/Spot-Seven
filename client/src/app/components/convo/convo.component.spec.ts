import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatService } from '@app/services/chat/chat.service';
import { ConvoComponent } from './convo.component';
import SpyObj = jasmine.SpyObj;
import { TokenService } from '@app/services/token/token.service';
describe('ConvoComponent', () => {
    let component: ConvoComponent;
    let fixture: ComponentFixture<ConvoComponent>;
    let chatServiceSpy: SpyObj<ChatService>;
    let tokenServiceSpy: SpyObj<TokenService>;
    beforeEach(async () => {
        chatServiceSpy = jasmine.createSpyObj(ChatService, [
            'sendMessage',
            'getUserId',
            'selectChat',
            'quitChat',
            'getJoinedChats',
            'getJoinableChats',
            'joinChat',
            'getUsersOfChat',
            'getUsername',
            'getMessages',
            'getActiveChatId',
            'getChatList',
            'getChatList',
            'getChatName',
        ]);
        tokenServiceSpy = jasmine.createSpyObj(TokenService, ['getUsername']);
        await TestBed.configureTestingModule({
            imports: [],
            declarations: [ConvoComponent],
            providers: [
                { provide: ChatService, useValue: chatServiceSpy },
                { provide: TokenService, useValue: tokenServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ConvoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
