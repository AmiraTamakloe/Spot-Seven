/* eslint-disable @typescript-eslint/no-empty-function */
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { UserInfo } from '@app/interfaces/user-info';
import { SocketService } from '@app/services/socket/socket.service';
import { TokenService } from '@app/services/token/token.service';
import { of } from 'rxjs';
import { AccountService } from './account.service';
import SpyObj = jasmine.SpyObj;
import { getTranslocoTestingModules } from '@app/modules/transloco-testing.module';

describe('AccountService', () => {
    let service: AccountService;
    let httpMock: HttpTestingController;
    let socialAuthServiceSpy: SpyObj<SocialAuthService>;
    let tokenServiceSpy: SpyObj<TokenService>;
    let routerSpy: SpyObj<Router>;
    let socketServiceSpy: SpyObj<SocketService>;
    let baseUrl: string;

    beforeEach(() => {
        tokenServiceSpy = jasmine.createSpyObj('TokenService', ['setTokens', 'getRefreshToken', 'getUsername', 'removeTokens']);
        socialAuthServiceSpy = jasmine.createSpyObj('SocialAuthService', ['authState', 'verify', 'signOut']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['connect', 'disconnect']);
        socketServiceSpy.connect.and.resolveTo(undefined);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([{}]), ...getTranslocoTestingModules()],
            providers: [
                AccountService,
                { provide: SocialAuthService, useValue: socialAuthServiceSpy },
                { provide: TokenService, useValue: tokenServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: SocketService, useValue: socketServiceSpy },
            ],
        });

        Object.defineProperty(socialAuthServiceSpy, 'authState', { value: of({}) });
        service = TestBed.inject(AccountService);
        httpMock = TestBed.inject(HttpTestingController);
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        // The tests was failing in a very weird way because of ngOnDestroy
        spyOn(service, 'logOut').and.callFake(() => {});

        expect(service).toBeTruthy();
    });

    it('logInAccount should make a POST request to /auth/login', () => {
        spyOn(service, 'logOut').and.callFake(() => {});

        const info: UserInfo = { username: 'username', password: 'password' };
        service.logInAccount(info);
        const req = httpMock.expectOne(`${baseUrl}/auth/login`);
        expect(req.request.method).toEqual('POST');
        req.flush(info);
    });
});
