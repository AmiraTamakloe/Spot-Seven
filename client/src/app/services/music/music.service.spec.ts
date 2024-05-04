import { TestBed } from '@angular/core/testing';

import { MusicService } from './music.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PreferencesDto } from '@app/interfaces/preferences';
import { PreferencesService } from '@app/services/preferences/preferences.service';
import SpyObj = jasmine.SpyObj;
import { of } from 'rxjs';

describe('MusicService', () => {
    let service: MusicService;
    let preferencesServiceSpy: SpyObj<PreferencesService>;

    // eslint-disable-next-line prefer-const
    preferencesServiceSpy = jasmine.createSpyObj('PreferencesService', ['getAccountPreferences', 'updateAccountPreferences']);
    const preferencesDto: PreferencesDto = { userId: 'test', language: 'en', theme: 'light' };
    preferencesServiceSpy.getAccountPreferences.and.returnValue(of(preferencesDto));

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: PreferencesService, useValue: preferencesServiceSpy }],
        });
        service = TestBed.inject(MusicService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
