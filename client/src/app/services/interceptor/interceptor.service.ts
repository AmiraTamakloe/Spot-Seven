import { HttpErrorResponse, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccountService } from '@app/services/account/account.service';
import { TokenExpiredError } from '@app/services/token/token-expired-error';
import { TokenService } from '@app/services/token/token.service';
import { Tokens } from '@common/tokens';
import { catchError, concatMap, from } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class InterceptorService implements HttpInterceptor {
    constructor(private accountService: AccountService, private tokenService: TokenService) {}

    intercept(request: HttpRequest<unknown>, next: HttpHandler) {
        if (this.isAuthRequest(request)) {
            return next.handle(request);
        }

        return from(this.addAuthToken(request)).pipe(
            concatMap((tokenizedRequest: HttpRequest<unknown>) => {
                return next.handle(tokenizedRequest).pipe(
                    catchError((error: HttpErrorResponse) => {
                        if (error.status !== HttpStatusCode.NotFound) {
                            this.accountService.logOut();
                        }
                        throw new Error(error.message);
                    }),
                );
            }),
        );
    }

    private async getAccessToken(): Promise<Tokens> {
        try {
            return this.tokenService.getTokens();
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                await this.tokenService.refreshToken();
                return this.tokenService.getTokens();
            }
            throw new Error('Unknown error');
        }
    }

    private async createAuthorizationHeaders(): Promise<HttpHeaders> {
        const headers = new HttpHeaders();
        const tokens: Tokens = await this.getAccessToken();

        return headers.append('Authorization', `Bearer ${tokens.accessToken}`);
    }

    private async addAuthToken(request: HttpRequest<unknown>): Promise<HttpRequest<unknown>> {
        const headers: HttpHeaders = await this.createAuthorizationHeaders();
        return request.clone({ headers });
    }

    private isAuthRequest(request: HttpRequest<unknown>): boolean {
        return request.url.includes('auth');
    }
}
