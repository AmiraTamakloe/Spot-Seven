import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketAuthGuard } from './authentication/ws-jwt-auth.guard';
import { AuthenticationController } from './controllers/authentication/authentication.controller';
import { ChatController } from './controllers/chat/chat.controller';
import { ConfigurationController } from './controllers/configuration/configuration.controller';
import { GameController } from './controllers/game/game.controller';
import { PreferencesController } from './controllers/preferences/preferences.controller';
import { ReplayController } from './controllers/replay/replay.controller';
import { UserController } from './controllers/users/users.controller';
import { AppGateway } from './gateways/app/app.gateway';
import { ChatGateway } from './gateways/chat/chat.gateway';
import { ConfigurationGateway } from './gateways/configuration/configuration.gateway';
import { FriendshipGateway } from './gateways/friendship/friendship.gateway';
import { GameCreateGateway } from './gateways/game-create/game-create.gateway';
import { GameSessionGateway } from './gateways/game-session/game-session.gateway';
import { ObserverGateway } from './gateways/observer/observer.gateway';
import { WaitingRoomGateway } from './gateways/waiting-room/waiting-room.gateway';
import { ChatMessage } from './model/database/chat-message.entity';
import { Chat } from './model/database/chat.entity';
import { DuelHighScore } from './model/database/duel-highscore.entity';
import { Friendship } from './model/database/friendship.entity';
import { GameConstantEntity } from './model/database/game-constant.entity';
import { History } from './model/database/game-history.entity';
import { Game } from './model/database/game.entity';
import { HighScore } from './model/database/highscore.entity';
import { Preferences } from './model/database/preferences.entity';
import { ReplayEventEntity } from './model/database/replay-event.entity';
import { Replay } from './model/database/replay.entity';
import { SoloHighScore } from './model/database/solo-highscore.entity';
import { User } from './model/database/user.entity';
import { AuthenticationService } from './services/authentication/authentication.service';
import { BitmapService } from './services/bitmap/bitmap.service';
import { ChatService } from './services/chat/chat.service';
import { DifferencesService } from './services/differences/differences.service';
import { FileService } from './services/file/file.service';
import { FriendshipService } from './services/friendship/friendship.service';
import { GameConstantsService } from './services/game-constants/game-constants.service';
import { GameHistoryService } from './services/game-history/game-history.service';
import { GameManagerService } from './services/game-manager/game-manager.service';
import { GameService } from './services/game/game.service';
import { HighScoreService } from './services/high-score/high-score.service';
import { HintService } from './services/hints/hint.service';
import { MessageFormatterService } from './services/message-formatter/message-formatter.service';
import { PreferencesService } from './services/preferences/preferences.service';
import { ReplayService } from './services/replay/replay.service';
import { UserService } from './services/user/user.service';
import { WaitingRoomService } from './services/waiting-room/waiting-room.service';
import { Statistic } from './model/database/statistic.entity';
import { StatisticService } from './services/statistics/statistic.service';
import { GoogleAuthService } from './authentication/google-jwt-auth.guard';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: ['@app/.env'] }),
        PassportModule.register({ property: 'payload' }),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '24h' },
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('POSTGRES_USER'),
                password: configService.get<string>('POSTGRES_PASSWORD'),
                database: configService.get<string>('DB_DATABASE'),
                entities: [
                    User,
                    Game,
                    GameConstantEntity,
                    History,
                    HighScore,
                    SoloHighScore,
                    DuelHighScore,
                    Preferences,
                    Replay,
                    ReplayEventEntity,
                    Friendship,
                    Chat,
                    ChatMessage,
                    Statistic,
                ],
                synchronize: configService.get<boolean>('DB_SYNC'),
            }),
        }),
        TypeOrmModule.forFeature([
            User,
            Game,
            GameConstantEntity,
            History,
            HighScore,
            SoloHighScore,
            DuelHighScore,
            Preferences,
            Replay,
            ReplayEventEntity,
            Friendship,
            User,
            Chat,
            ChatMessage,
            Statistic,
        ]),
    ],
    controllers: [
        AuthenticationController,
        GameController,
        ConfigurationController,
        UserController,
        ReplayController,
        ChatController,
        PreferencesController,
    ],
    providers: [
        Logger,
        BitmapService,
        GameService,
        ConfigurationGateway,
        DifferencesService,
        GameSessionGateway,
        WaitingRoomGateway,
        FileService,
        GameCreateGateway,
        ObserverGateway,
        MessageFormatterService,
        WaitingRoomService,
        GameManagerService,
        GameConstantsService,
        HintService,
        GameHistoryService,
        HighScoreService,
        PreferencesService,
        FriendshipService,
        UserService,
        FriendshipGateway,
        AuthenticationService,
        SocketAuthGuard,
        ReplayService,
        AppGateway,
        ChatService,
        ChatGateway,
        StatisticService,
        GoogleAuthService,
    ],
})
export class AppModule {}
