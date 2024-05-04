import { GATEWAY_CONFIGURATION_OBJECT } from '@app/gateways/gateway.constants';
import { WSValidationPipe } from '@app/validation-pipes/web-socket/web-socket.validation-pipe';
import { FriendshipEvent } from '@common/model/events/friendship.events';
import { Injectable, UsePipes } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway(GATEWAY_CONFIGURATION_OBJECT)
@Injectable()
@UsePipes(new WSValidationPipe({ transform: true }))
export class FriendshipGateway {
    @WebSocketServer()
    private server!: Server;

    async refreshData(): Promise<void> {
        this.server.emit(FriendshipEvent.RefreshData);
    }
}
