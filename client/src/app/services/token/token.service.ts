import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtTokensDto } from '@common/model/dto/jwt-tokens.dto';
import { RefreshDto } from '@common/model/dto/refresh.dto';
import { JwtPayload, RawPayload, RefreshToken, Tokens } from '@common/tokens';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TokenExpiredError } from './token-expired-error';
import { EPOCH_TO_SECONDS, REFRESH_TOKEN_KEY } from './token.constants';
@Injectable({
    providedIn: 'root',
})
export class TokenService {
    private accessToken: string | null = null;
    private accessTokenPayload: JwtPayload | null = null;
    private readonly baseUrl: string = environment.serverUrl;
    private http: HttpClient;

    // @ts-expect-error - We don't need to read this value, only inject it
    constructor(private httpBackend: HttpBackend) {
        // This solved circular dependency between TokenService and InterceptorService
        this.http = new HttpClient(httpBackend);
    }

    // WHAT THIS SHOULD DO
    // 1. Set the access token and refresh token in local storage
    // 2. Get the access token and refresh token from local storage
    // 3. verify if token is expired

    setTokens(tokens: Tokens): void {
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
        this.accessToken = tokens.accessToken;
        this.accessTokenPayload = this.decodeToken();
    }

    getUsername(): string {
        if (this.accessTokenPayload === null) {
            const refreshToken: RefreshToken = this.getRefreshToken();
            const base64Payload = refreshToken.split('.')[1];
            const rawPayload: RawPayload = JSON.parse(atob(base64Payload));

            return rawPayload.username;
        }

        return this.accessTokenPayload.username;
    }

    getTokens(): Tokens {
        const refreshToken: RefreshToken | null = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken === null) {
            throw new TokenExpiredError('No refresh token found');
        }
        if (this.accessToken === null) {
            throw new TokenExpiredError('No access token found');
        }

        if (this.isAccessTokenExpired()) {
            throw new TokenExpiredError('Access token expired');
        }

        return { accessToken: this.accessToken, refreshToken };
    }

    getRefreshToken(): RefreshToken {
        const refreshToken: RefreshToken | null = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken === null) {
            throw new TokenExpiredError('No refresh token found');
        }

        return refreshToken;
    }

    async refreshToken(): Promise<void> {
        const refreshToken = this.getRefreshToken();
        const username = this.getUsername();
        if (refreshToken === null || username === null) {
            // this.modalService.createInformationModal('Error', 'The session has expired. Please log in again.');
            throw new Error('No user or refresh token');
        }

        const refreshDto: RefreshDto = {
            username,
            refreshToken,
        };
        const tokens = await firstValueFrom(this.http.post<JwtTokensDto>(`${this.baseUrl}/auth/refresh`, refreshDto));
        this.setTokens(tokens);
    }

    removeTokens(): void {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        this.accessTokenPayload = null;
        this.accessToken = null;
    }

    private isAccessTokenExpired(): boolean {
        if (this.accessToken === null || this.accessTokenPayload === null) {
            return true;
        }
        return new Date() > this.accessTokenPayload.expiresAt;
    }

    private decodeToken(): JwtPayload {
        if (this.accessToken === null) {
            throw new Error('No access token found');
        }

        const base64Payload = this.accessToken.split('.')[1];
        const rawPayload: RawPayload = JSON.parse(atob(base64Payload));

        return {
            createdAt: new Date(rawPayload.iat * EPOCH_TO_SECONDS),
            expiresAt: new Date(rawPayload.exp * EPOCH_TO_SECONDS),
            username: rawPayload.username,
        };
    }
}
