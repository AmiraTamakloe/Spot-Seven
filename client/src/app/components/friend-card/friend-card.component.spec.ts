import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FriendCardComponent } from './friend-card.component';
import { FriendService } from '@app/services/friend/friend.service';
import SpyObj = jasmine.SpyObj;
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { AccountService } from '@app/services/account/account.service';

describe('FriendCardComponent', () => {
    let component: FriendCardComponent;
    let fixture: ComponentFixture<FriendCardComponent>;
    let friendServiceSpy: SpyObj<FriendService>;
    let accountServiceSpy: SpyObj<AccountService>;
    let modalSpy: SpyObj<MatDialog>;

    beforeEach(async () => {
        modalSpy = jasmine.createSpyObj('MatDialog', ['open']);
        friendServiceSpy = jasmine.createSpyObj('FriendService', [
            'blockUser',
            'getFriends',
            'sendFriendRequest',
            'acceptOrDeclineFriendRequest',
            'removeFriend',
            'removeFriendRequest',
            'unblockUser',
        ]);
        await TestBed.configureTestingModule({
            declarations: [FriendCardComponent],
            providers: [
                { provide: FriendService, useValue: friendServiceSpy },
                { provide: MatDialog, useValue: modalSpy },
                { provide: AccountService, useValue: accountServiceSpy },
            ],
        }).compileComponents();
        friendServiceSpy.getFriends.and.returnValue(of([]));
        fixture = TestBed.createComponent(FriendCardComponent);
        component = fixture.componentInstance;
        component.friend = { username: 'testUser', email: 'a@g', password: 'password' };
        component.status = 'Friends';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
