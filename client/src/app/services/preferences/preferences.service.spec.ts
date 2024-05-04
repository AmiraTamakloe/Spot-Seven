import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AccountService } from '@app/services/account/account.service';
import { PreferencesService } from './preferences.service';
import SpyObj = jasmine.SpyObj;

describe('PreferencesService', () => {
    let httpMock: HttpTestingController;
    let service: PreferencesService;
    let accountServiceSpy: SpyObj<AccountService>;

    beforeEach(() => {
        accountServiceSpy = jasmine.createSpyObj('AccountService', ['isLoggedIn', 'getUser']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: AccountService, useValue: accountServiceSpy }],
        });
        service = TestBed.inject(PreferencesService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
