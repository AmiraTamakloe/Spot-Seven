import { GoogleAuthService } from '@app/authentication/google-jwt-auth.guard';
import { USED_USERNAME_RANDOM_NUMBER_MAX, USERNAME_RANDOM_NUMBER_MAX } from '@app/index.constants';
import { User } from '@app/model/database/user.entity';
import { GoogleUserDto } from '@app/model/dto/google-user-dto';
import { UserDto } from '@app/model/dto/user-dto';
import { UserService } from '@app/services/user/user.service';
import { CommunicationProtocol } from '@common/model/communication-protocole';
import { JwtTokensDto, TokenType } from '@common/model/dto/jwt-tokens.dto';
import { RawPayload } from '@common/tokens';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class AuthenticationService {
    constructor(private userService: UserService, private jwtService: JwtService, private googleAuthService: GoogleAuthService) {}

    async logIn(username: string, password: string): Promise<JwtTokensDto> {
        if (this.userService.isUserConnected(username)) {
            throw new HttpException('User already connected', HttpStatus.UNAUTHORIZED);
        }

        if (await this.userService.verifyUserAndPasswordValid(username, password)) {
            return this.generateAndSetTokens(username);
        }
        throw new HttpException('Incorrect username or password', HttpStatus.BAD_REQUEST);
    }

    async logInGoogle(info: GoogleUserDto): Promise<JwtTokensDto> {
        await this.googleAuthService.verifyIdToken(info.idToken);
        const user = await this.userService.getUserByEmail(info.email);
        if (!user) {
            const generatedUsername = await this.generateUsername(info.firstName, info.lastName);
            await this.userService.createGoogleUserAccount(generatedUsername, info.email);
            return this.generateAndSetTokens(generatedUsername);
        }
        if (this.userService.isUserConnected(user.username)) {
            throw new HttpException('User already connected', HttpStatus.UNAUTHORIZED);
        }
        return this.generateAndSetTokens(user.username);
    }

    async signUp(userDto: UserDto): Promise<User> {
        const user = await this.userService.getUser(userDto.username);
        if (user !== null) {
            throw new HttpException('Username already exists', HttpStatus.CONFLICT);
        }
        return await this.userService.createUser(userDto.username, userDto.password, userDto.email, userDto.avatar);
    }

    async refreshTokens(username: string, refreshToken: string): Promise<JwtTokensDto> {
        if (username === undefined || (await this.userService.getUser(username)) === null) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        if (!this.userService.isUserConnected(username)) {
            throw new HttpException('User not connected', HttpStatus.UNAUTHORIZED);
        }
        const oldTokens = this.getTokens(username);
        if (oldTokens.refreshToken !== refreshToken) {
            throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
        }

        return this.generateAndSetTokens(username);
    }

    async logOut(username: string): Promise<void> {
        this.userService.disconnectUser(username);
    }

    async validateJwtToken(token: string, tokenType: TokenType, communicationProtocol: CommunicationProtocol): Promise<boolean> {
        await this.jwtService.verifyAsync(token).catch((error: Error) => {
            if (error.message === 'jwt expired') {
                this.throwProtocolException('Invalid token', communicationProtocol);
            }
        });

        const username: string = this.jwtService.decode<RawPayload>(token).username;

        if (!this.userService.isUserConnected(username)) {
            this.throwProtocolException('User not connected', communicationProtocol);
        }

        const tokens = this.getTokens(username);

        if (tokenType === TokenType.ACCESS) {
            return tokens.accessToken === token;
        } else {
            return tokens.refreshToken === token;
        }
    }

    async getUsername(token: string): Promise<string> {
        return this.jwtService.decode<RawPayload>(token).username;
    }

    private throwProtocolException(errorMessage: string, communicationProtocol: CommunicationProtocol): void {
        switch (communicationProtocol) {
            case CommunicationProtocol.WEBSOCKET:
                throw new WsException(errorMessage);
            case CommunicationProtocol.HTTP:
                throw new HttpException(errorMessage, HttpStatus.UNAUTHORIZED);
        }
    }

    private generateTokens(username: string): JwtTokensDto {
        const payload = { username };
        const accessToken: string = this.jwtService.sign(payload, { expiresIn: '2h' });
        const refreshToken: string = this.jwtService.sign(payload, { expiresIn: '24h' });
        return { accessToken, refreshToken };
    }

    private generateAndSetTokens(username: string): JwtTokensDto {
        const tokens = this.generateTokens(username);
        this.userService.setConnectedUserTokens(username, tokens);
        return tokens;
    }

    private getTokens(username: string): JwtTokensDto {
        const tokens = this.userService.getUserConnectionData(username)?.token;
        if (tokens === undefined) {
            throw new HttpException('User not connected', HttpStatus.UNAUTHORIZED);
        }

        return tokens;
    }

    private async generateUsername(firstName: string, lastName: string): Promise<string> {
        let username = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
        username += Math.floor(Math.random() * USERNAME_RANDOM_NUMBER_MAX);
        let exists = await this.userService.getUser(username);
        while (exists) {
            username += Math.floor(Math.random() * USED_USERNAME_RANDOM_NUMBER_MAX);
            exists = await this.userService.getUser(username);
        }
        return username;
    }
}
