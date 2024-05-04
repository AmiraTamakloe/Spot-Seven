import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSettingBasePageComponent } from './account-setting-base-page.component';

describe('AccountSettingBasePageComponent', () => {
    let component: AccountSettingBasePageComponent;
    let fixture: ComponentFixture<AccountSettingBasePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AccountSettingBasePageComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AccountSettingBasePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
