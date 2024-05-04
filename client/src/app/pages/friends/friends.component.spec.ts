import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendsComponent } from './friends.component';
import { FriendListComponent } from '@app/components/friend-list/friend-list.component';
import { PageBaseComponent } from '@app/pages/page-base-component/page-base-component.component';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import SpyObj = jasmine.SpyObj;
import { AccountService } from '@app/services/account/account.service';
import { FriendService } from '@app/services/friend/friend.service';

describe('FriendsComponent', () => {
    let component: FriendsComponent;
    let fixture: ComponentFixture<FriendsComponent>;
    let friendServiceSpy: SpyObj<FriendService>;
    let accountServiceSpy: SpyObj<AccountService>;

    beforeEach(async () => {
        friendServiceSpy = jasmine.createSpyObj('FriendService', [
            'getAllUsers',
            'getFriends',
            'getFriendRequests',
            'getFriendRequestsSent',
            'blockedUsers',
        ]);
        accountServiceSpy = jasmine.createSpyObj('AccountService', ['getUsername']);
        await TestBed.configureTestingModule({
            imports: [MatTabsModule, BrowserAnimationsModule],
            declarations: [FriendsComponent, FriendListComponent, PageBaseComponent],
            providers: [
                { provide: FriendService, useValue: friendServiceSpy },
                { provide: AccountService, useValue: accountServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(FriendsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
