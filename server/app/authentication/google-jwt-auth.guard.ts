/* eslint-disable no-console */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

@Injectable()
export class GoogleAuthService {
    private readonly client: OAuth2Client;

    constructor() {
        this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');
    }

    async verifyIdToken(token: string): Promise<TokenPayload> {
        try {
            const ticket = await this.client.verifyIdToken({
                idToken: token,
            });
            const payload = ticket.getPayload() as TokenPayload;
            return payload;
        } catch (error) {
            throw new HttpException('Google authentication failed', HttpStatus.BAD_REQUEST);
        }
    }
}
