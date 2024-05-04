import { defaultDuelHighScores, defaultSoloHighScores } from '@app/constants/configuration.constants';
import { GATEWAY_CONFIGURATION_OBJECT } from '@app/gateways/gateway.constants';
import { ModifyGameDto } from '@app/model/dto/modify-game-dto';
import { GameService } from '@app/services/game/game.service';
import { WSValidationPipe } from '@app/validation-pipes/web-socket/web-socket.validation-pipe';
import { ConfigurationEvent } from '@common/model/events/configuration.events';
import { Injectable, UsePipes } from '@nestjs/common';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway(GATEWAY_CONFIGURATION_OBJECT)
@Injectable()
@UsePipes(new WSValidationPipe({ transform: true }))
export class ConfigurationGateway {
    @WebSocketServer()
    private server!: Server;
    constructor(private gameService: GameService) {}

    @SubscribeMessage(ConfigurationEvent.ReinitializeScores)
    async reinitializeScore(@MessageBody() modifyGameDto: ModifyGameDto): Promise<void> {
        await this.gameService.updateGame(modifyGameDto.gameId, false, defaultSoloHighScores);
        await this.gameService.updateGame(modifyGameDto.gameId, true, defaultDuelHighScores);

        this.server.emit(ConfigurationEvent.ReinitializeWasDone);
    }

    @SubscribeMessage(ConfigurationEvent.ReinitializeAllScores)
    async reinitializeAllScore(): Promise<void> {
        for (const game of await this.gameService.getGames()) {
            await this.gameService.updateGame(game._id, false, defaultSoloHighScores);
            await this.gameService.updateGame(game._id, true, defaultDuelHighScores);
        }

        this.server.emit(ConfigurationEvent.ReinitializeWasDone);
    }
}
