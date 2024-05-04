import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { PreferencesDto } from '@app/interfaces/preferences';
import { AccountService } from '@app/services/account/account.service';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import { of } from 'rxjs';
import { ThemeSwitchComponent } from './theme-switch.component';
import SpyObj = jasmine.SpyObj;

describe('ThemeSwitchComponent', () => {
    let component: ThemeSwitchComponent;
    let fixture: ComponentFixture<ThemeSwitchComponent>;
    let preferencesServiceSpy: SpyObj<PreferencesService>;

    beforeEach(async () => {
        preferencesServiceSpy = jasmine.createSpyObj('PreferencesService', [
            'getAccountPreferences',
            'updateAccountPreferences',
            'canSetPreferences',
        ]);
        const preferencesDto: PreferencesDto = { userId: 'test', language: 'en', theme: 'light' };
        preferencesServiceSpy.getAccountPreferences.and.returnValue(of(preferencesDto));
        await TestBed.configureTestingModule({
            declarations: [ThemeSwitchComponent],
            providers: [AccountService, { provide: PreferencesService, useValue: preferencesServiceSpy }],
            imports: [HttpClientModule],
        }).compileComponents();

        fixture = TestBed.createComponent(ThemeSwitchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
