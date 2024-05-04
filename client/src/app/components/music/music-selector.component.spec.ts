import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreferencesDto } from '@app/interfaces/preferences';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import SpyObj = jasmine.SpyObj;
import { MusicSelectorComponent } from './music-selector.component';
import { of } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';

describe('MusicSelectorComponent', () => {
    let component: MusicSelectorComponent;
    let fixture: ComponentFixture<MusicSelectorComponent>;
    let preferencesServiceSpy: SpyObj<PreferencesService>;

    // eslint-disable-next-line prefer-const
    preferencesServiceSpy = jasmine.createSpyObj('PreferencesService', ['getAccountPreferences', 'updateAccountPreferences']);
    const preferencesDto: PreferencesDto = { userId: 'test', language: 'en', theme: 'light' };
    preferencesServiceSpy.getAccountPreferences.and.returnValue(of(preferencesDto));
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [MatDialogModule, { provide: PreferencesService, useValue: preferencesServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(MusicSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
