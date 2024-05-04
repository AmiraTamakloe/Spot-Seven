import { RefreshToken } from '@common/tokens';

export class TokenExpiredError extends Error {
    name = 'TokenExpiredError';
    refreshToken: RefreshToken;

    constructor(public token: RefreshToken) {
        super('Token expired');
        this.refreshToken = token;
    }
}
