import { TestBed } from '@angular/core/testing';

import { InterceptorService } from './interceptor.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import SpyObj = jasmine.SpyObj;
import { AccountService } from '@app/services/account/account.service';
import { TokenService } from '@app/services/token/token.service';

describe('InterceptorService', () => {
    let service: InterceptorService;
    let accountServiceSpy: SpyObj<AccountService>;
    let tokenServiceSpy: SpyObj<TokenService>;

    beforeEach(() => {
        accountServiceSpy = jasmine.createSpyObj('AccountService', ['refreshToken', 'logOut']);
        tokenServiceSpy = jasmine.createSpyObj('TokenService', ['getTokens', 'setAccessToken', 'setRefreshToken']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: AccountService, useValue: accountServiceSpy },
                { provide: TokenService, useValue: tokenServiceSpy },
            ],
        });
        service = TestBed.inject(InterceptorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
