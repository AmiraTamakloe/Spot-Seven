import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { CommunicationProtocol } from '@common/model/communication-protocole';
import { TokenType } from '@common/model/dto/jwt-tokens.dto';
import { Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class SocketAuthGuard {
    private logger = new Logger(SocketAuthGuard.name);

    constructor(private authenticationService: AuthenticationService) {}

    async verifyHandshake(socket: Socket): Promise<boolean> {
        const token = socket.handshake.query.token as string;

        if (token === undefined) {
            throw new WsException('The user is not logged in');
        }

        try {
            const res = await this.authenticationService.validateJwtToken(token, TokenType.REFRESH, CommunicationProtocol.WEBSOCKET);
            return res;
        } catch (e) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.logger.error(e);
            return false;
        }
    }

    async getUsername(socket: Socket): Promise<string> {
        const token = socket.handshake.query.token as string;
        return await this.authenticationService.getUsername(token);
    }
}
