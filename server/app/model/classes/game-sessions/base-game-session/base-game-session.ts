import { ID_LENGTH } from '@app/constants/game-session.constants';
import { WaitingRoom } from '@app/interfaces/waiting-room/waiting-room.interface';
import { Game } from '@app/model/database/game.entity';
import { Coordinate } from '@app/model/dto/coordinate.dto';
import { GameSession, PlayerData } from '@app/model/schema/game-session';
import { DifferencesService } from '@app/services/differences/differences.service';
import { GameConstants } from '@common/game-constants';
import { GameMode } from '@common/game-mode';
import { GuessResult } from '@common/model/guess-result';
import { Timer } from '@app/model/classes/timer/timer';

export abstract class BaseGameSession implements GameSession {
    roomId: string;
    game!: Game;
    timer: Timer;
    gameMode: GameMode;
    // FIXME: It will be instantied through DifferencesService
    differences!: Set<string>[];
    throttleEndTimestamp: number | undefined;
    startedTime: number;
    players: Map<string, PlayerData> = new Map();
    differencesService: DifferencesService;
    currentTime: number;
    updateTime: number;
    chatId: string;
    initialTime: number;
    hintPenalty: number;
    differenceFoundBonus: number;

    constructor(differencesService: DifferencesService, waitingRoom: WaitingRoom, gameConstants: GameConstants) {
        this.roomId = this.createRoomId(ID_LENGTH);
        this.startedTime = Date.now();
        this.differencesService = differencesService;
        this.initialTime = gameConstants.initialTime;
        this.hintPenalty = gameConstants.hintPenalty;
        this.currentTime = gameConstants.initialTime;
        this.updateTime = gameConstants.initialTime;
        this.differenceFoundBonus = gameConstants.differenceFoundBonus;
        this.chatId = waitingRoom.chatId;
        this.gameMode = waitingRoom.gameMode;
        this.timer = new Timer(this.roomId, this.initialTime);
        this.addPlayers(waitingRoom);
    }

    createRoomId(length: number): string {
        let id = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        while (id.length < length) {
            id += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return id;
    }

    isMultiplayer() {
        return this.gameMode === GameMode.ClassicTeam;
    }
    // Converts a Coordinate[][] to a Set<string>[] containing the hashed coordinates
    protected async prepareDifferences(game: Game): Promise<Set<string>[]> {
        const differences = await this.differencesService.loadDifferences(game.differencesFilename);
        return differences.map((difference) => new Set<string>(difference.map((coordinate) => coordinate.hash())));
    }

    private addPlayers(waitingRoom: WaitingRoom) {
        this.players.set(waitingRoom.creator.socketId, { username: waitingRoom.creator.username, differencesFound: 0, remainingHints: 3 });
        if (waitingRoom.waitingPlayers.length > 0) {
            for (const waitingPlayer of waitingRoom.waitingPlayers) {
                this.players.set(waitingPlayer.socketId, { username: waitingPlayer.username, differencesFound: 0, remainingHints: 3 });
            }
        }
    }

    abstract getWinner(playerId: string): string | null;
    abstract manageClick(coord: Coordinate, playerId: string): Promise<GuessResult>;
    abstract useHintMalus(): void;
}
