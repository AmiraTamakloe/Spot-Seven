export type RefreshToken = string;
export type AccessToken = string;

export interface Tokens {
    accessToken: AccessToken;
    refreshToken: RefreshToken;
}

export interface JwtPayload {
    createdAt: Date;
    expiresAt: Date;
    username: string;
}

export interface RawPayload {
    iat: number;
    exp: number;
    username: string;
}
