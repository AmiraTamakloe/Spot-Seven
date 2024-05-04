import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { PreferencesDto } from '@app/interfaces/preferences';
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import { of } from 'rxjs';
import { LanguageDropdownComponent } from './language-dropdown.component';
import SpyObj = jasmine.SpyObj;

describe('LanguageDropdownComponent', () => {
    let component: LanguageDropdownComponent;
    let fixture: ComponentFixture<LanguageDropdownComponent>;
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
            declarations: [LanguageDropdownComponent],
            imports: [...getTranslocoTestingModules(), MatMenuModule],
            providers: [{ provide: PreferencesService, useValue: preferencesServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(LanguageDropdownComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
