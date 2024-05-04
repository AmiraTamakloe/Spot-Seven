import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatMessage } from '@common/model/message';

import { TokenService } from '@app/services/token/token.service';
import { MessageComponent } from './message.component';

describe('MessageComponent', () => {
    let component: MessageComponent;
    let fixture: ComponentFixture<MessageComponent>;
    let message: ChatMessage;
    let tokenServiceMock: jasmine.SpyObj<TokenService>;

    beforeEach(async () => {
        tokenServiceMock = jasmine.createSpyObj(TokenService, ['getUsername']);
        tokenServiceMock.getUsername.and.returnValue('Messenger');

        await TestBed.configureTestingModule({
            declarations: [MessageComponent],
            providers: [{ provide: TokenService, useValue: tokenServiceMock }],
        }).compileComponents();

        message = {
            content: 'Hello World!',
            author: 'Messenger',
            time: Date.now().toString(),
            destination: 'chat_1',
        };

        fixture = TestBed.createComponent(MessageComponent);
        component = fixture.componentInstance;
        component.message = { chatMessage: message, authorId: 'Messenger' };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
