import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatBubbleBarComponent } from './chat-bubble-bar.component';

describe('ChatBubbleBarComponent', () => {
    let component: ChatBubbleBarComponent;
    let fixture: ComponentFixture<ChatBubbleBarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [],
            declarations: [ChatBubbleBarComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatBubbleBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
