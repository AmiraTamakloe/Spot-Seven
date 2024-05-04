import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserModalCardComponent } from './user-modal-card.component';
import { AccountService } from '@app/services/account/account.service';
import { FriendService } from '@app/services/friend/friend.service';
import SpyObj = jasmine.SpyObj;
import { of } from 'rxjs';

describe('UserModalCardComponent', () => {
    let component: UserModalCardComponent;
    let fixture: ComponentFixture<UserModalCardComponent>;
    let friendServiceSpy: SpyObj<FriendService>;
    let accountServiceSpy: SpyObj<AccountService>;

    beforeEach(async () => {
        accountServiceSpy = jasmine.createSpyObj('AccountService', ['getAvatarUrl']);
        friendServiceSpy = jasmine.createSpyObj('FriendService', ['sendFriendRequest']);
        await TestBed.configureTestingModule({
            declarations: [UserModalCardComponent],
            providers: [
                { provide: FriendService, useValue: friendServiceSpy },
                { provide: AccountService, useValue: accountServiceSpy },
            ],
        }).compileComponents();
        accountServiceSpy.getAvatarUrl.and.returnValue(of('avatar1.png'));
        fixture = TestBed.createComponent(UserModalCardComponent);
        component = fixture.componentInstance;
        component.user = { username: 'testUser', email: 'a@g', password: 'password', avatar: 'avatar1.png' };
        component.canInteract = true;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
