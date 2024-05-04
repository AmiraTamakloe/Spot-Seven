import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { MatMenuModule } from '@angular/material/menu';
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';
import { AccountService } from '@app/services/account/account.service';
import { UserProfileDropdownComponent } from './user-profile-dropdown.component';
import { of } from 'rxjs';

describe('UserProfileDropdownComponent', () => {
    let component: UserProfileDropdownComponent;
    let accountServiceSpy: jasmine.SpyObj<AccountService>;
    let fixture: ComponentFixture<UserProfileDropdownComponent>;

    beforeEach(async () => {
        accountServiceSpy = jasmine.createSpyObj('AccountService', ['getUser']);
        accountServiceSpy.getUser.and.returnValue(of({ username: 'testUser', avatar: 'avatar1', password: 'password' }));

        await TestBed.configureTestingModule({
            declarations: [UserProfileDropdownComponent],
            providers: [{ provide: AccountService, useValue: accountServiceSpy }],
            imports: [HttpClientModule, MatMenuModule, ...getTranslocoTestingModules()],
        }).compileComponents();

        fixture = TestBed.createComponent(UserProfileDropdownComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
