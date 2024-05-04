import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatService } from '@app/services/chat/chat.service';
import { TokenService } from '@app/services/token/token.service';
import { CreateChatComponent } from './create-chat.component';
import SpyObj = jasmine.SpyObj;

describe('CreateChatComponent', () => {
    let component: CreateChatComponent;
    let fixture: ComponentFixture<CreateChatComponent>;
    let chatServiceSpy: SpyObj<ChatService>;
    let tokenServiceSpy: SpyObj<TokenService>;

    beforeEach(async () => {
        chatServiceSpy = jasmine.createSpyObj(ChatService, ['createChat', 'getUserId', 'getUsername', 'getChatList']);
        tokenServiceSpy = jasmine.createSpyObj(TokenService, ['getUsername']);
        await TestBed.configureTestingModule({
            declarations: [CreateChatComponent],
            imports: [HttpClientTestingModule],
            providers: [
                { provide: ChatService, useValue: chatServiceSpy },
                { provide: TokenService, useValue: tokenServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
