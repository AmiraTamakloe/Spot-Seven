export interface JwtTokensDto {
    accessToken: string;
    refreshToken: string;
}

export enum TokenType {
    ACCESS,
    REFRESH,
}
