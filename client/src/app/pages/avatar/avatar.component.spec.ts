import { ComponentFixture, TestBed } from '@angular/core/testing';
import SpyObj = jasmine.SpyObj;
import { AvatarComponent } from './avatar.component';
import { PageBaseComponent } from '@app/pages/page-base-component/page-base-component.component';
import { AccountService } from '@app/services/account/account.service';
import { of } from 'rxjs';
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';

describe('AvatarComponent', () => {
    let component: AvatarComponent;
    let fixture: ComponentFixture<AvatarComponent>;
    let accountServiceSpy: SpyObj<AccountService>;

    beforeEach(async () => {
        accountServiceSpy = jasmine.createSpyObj('AccountService', ['getUser', 'getAvatarUrl', 'updateAccountParameters']);
        accountServiceSpy.getUser.and.returnValue(of({ username: 'testUser', avatar: 'avatar1', password: 'password' }));
        await TestBed.configureTestingModule({
            declarations: [AvatarComponent, PageBaseComponent],
            providers: [{ provide: AccountService, useValue: accountServiceSpy }],
            imports: [...getTranslocoTestingModules()],
        }).compileComponents();

        fixture = TestBed.createComponent(AvatarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
