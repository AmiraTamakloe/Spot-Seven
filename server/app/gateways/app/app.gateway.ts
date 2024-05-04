import { SocketAuthGuard } from '@app/authentication/ws-jwt-auth.guard';
import { GATEWAY_CONFIGURATION_OBJECT, MAX_EVENT_LISTENERS } from '@app/gateways/gateway.constants';
import { ReplayService } from '@app/services/replay/replay.service';
import { UserService } from '@app/services/user/user.service';
import { WSValidationPipe } from '@app/validation-pipes/web-socket/web-socket.validation-pipe';
import { Injectable, Logger, UsePipes } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { instrument } from '@socket.io/admin-ui';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(GATEWAY_CONFIGURATION_OBJECT)
@Injectable()
@UsePipes(new WSValidationPipe({ transform: true }))
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer()
    server!: Server;

    logger: Logger = new Logger(AppGateway.name);

    constructor(private socketAuthGuard: SocketAuthGuard, private userService: UserService, private replayService: ReplayService) {}

    async handleConnection(socket: Socket) {
        // This fixes the MaxListenersExceededWarning warning.
        // It was caused because there are many disconnect handlers added per gateway
        // See https://github.com/nestjs/nest/issues/7249 and https://github.com/nestjs/nest/issues/6026
        socket.setMaxListeners(MAX_EVENT_LISTENERS);

        this.socketAuthGuard.verifyHandshake(socket);
        this.logger.log(`Socket client connected ${socket.id}`);

        const username = await this.socketAuthGuard.getUsername(socket);

        this.userService.setConnectedUserSocketId(username, socket.id);
    }

    afterInit(server: Server) {
        instrument(server, {
            namespaceName: '/admin',
            auth: false,
            mode: 'development',
        });
    }

    async handleDisconnect(socket: Socket) {
        this.logger.log(`Disconnecting socket client ${socket.id}`);

        const username = await this.socketAuthGuard.getUsername(socket);

        this.replayService.deleteReplayForUser(username);

        this.userService.setConnectedUserSocketId(username, '');
    }
}
