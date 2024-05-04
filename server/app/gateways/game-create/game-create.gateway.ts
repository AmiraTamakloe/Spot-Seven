import { GATEWAY_CONFIGURATION_OBJECT } from '@app/gateways/gateway.constants';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { CreateTemporaryGameDto } from '@app/model/dto/game/create-temporary-game.dto';
import { TemporaryGameInfo } from '@app/model/dto/game/temporary-game-info.dto';
import { TemporaryGame } from '@app/model/schema/temporary-game';
import { BitmapService } from '@app/services/bitmap/bitmap.service';
import { DifferencesService } from '@app/services/differences/differences.service';
import { GameService } from '@app/services/game/game.service';
import { WSValidationPipe } from '@app/validation-pipes/web-socket/web-socket.validation-pipe';
import { Difficulty } from '@common/model/difficulty';
import { GameCreateEvent } from '@common/model/events/game-create.events';
import { ClassSerializerInterceptor, Injectable, UseInterceptors, UsePipes } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(GATEWAY_CONFIGURATION_OBJECT)
@Injectable()
@UsePipes(new WSValidationPipe({ transform: true }))
export class GameCreateGateway implements OnGatewayDisconnect {
    @WebSocketServer()
    private server!: Server;

    constructor(private gameService: GameService, private bitmapService: BitmapService, private differencesService: DifferencesService) {}

    @SubscribeMessage(GameCreateEvent.CreateTemporaryGame)
    async createTemporaryGame(
        @ConnectedSocket() socket: Socket,
        @MessageBody() createTemporaryGameDto: CreateTemporaryGameDto,
    ): Promise<TemporaryGameInfo> {
        const { leftImage, rightImage } = await this.bitmapService.decodeImages(createTemporaryGameDto.leftImage, createTemporaryGameDto.rightImage);
        const differences = this.differencesService.findDifferences(leftImage, rightImage, createTemporaryGameDto.detectionRadius);
        const difficulty = this.differencesService.computeDifficulty(differences);
        const differencesCount = differences.length;
        const differencesImage = this.differencesService.getDifferencesImage(differences);
        if (difficulty === Difficulty.Invalid) {
            return new TemporaryGameInfo(false, differencesCount, differencesImage);
        }

        const temporaryGame = new TemporaryGame(createTemporaryGameDto.detectionRadius, difficulty);
        this.gameService.createTemporaryGame(socket.id, {
            temporaryGame,
            originalImageBase64: createTemporaryGameDto.leftImage,
            modifiedImageBase64: createTemporaryGameDto.rightImage,
            differences,
        });
        return new TemporaryGameInfo(true, differencesCount, differencesImage);
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @SubscribeMessage(GameCreateEvent.CreateGame)
    async createGame(@ConnectedSocket() socket: Socket, @MessageBody() createGameDto: CreateGameDto): Promise<string> {
        const pendingGame = this.gameService.getTemporaryGame(socket.id);

        if (pendingGame === undefined) {
            throw new WsException('No temporary game was created');
        }

        const game = await this.gameService.createGame(pendingGame, createGameDto.name);
        this.gameService.deleteTemporaryGame(socket.id);

        this.server.emit(GameCreateEvent.GameWasCreated, game);

        return 'Game created';
    }

    handleDisconnect(socket: Socket) {
        this.gameService.deleteTemporaryGame(socket.id);
    }
}
