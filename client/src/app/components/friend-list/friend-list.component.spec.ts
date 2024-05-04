import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FriendCardComponent } from '@app/components/friend-card/friend-card.component';

import { FriendListComponent } from './friend-list.component';

describe('FriendListComponent', () => {
    let component: FriendListComponent;
    let fixture: ComponentFixture<FriendListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FriendListComponent, FriendCardComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FriendListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
