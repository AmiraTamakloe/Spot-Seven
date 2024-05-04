import { TimeLimitedWaitingRoom } from '@app/interfaces/waiting-room/waiting-room.interface';
import { BaseGameSession } from '@app/model/classes/game-sessions/base-game-session/base-game-session';
import { SECOND_IN_MILLISECONDS } from '@app/model/classes/game-sessions/game-session.constants';
import { Game, ExistingGame } from '@app/model/database/game.entity';
import { Coordinate } from '@app/model/dto/coordinate.dto';
import { TimeLimitedGameSession } from '@app/model/schema/game-session';
import { DifferencesService } from '@app/services/differences/differences.service';
import { GameService } from '@app/services/game/game.service';
import { GameConstants } from '@common/game-constants';
import { GuessResultTimeLimited, ResultType, SessionType } from '@common/model/guess-result';
import { WsException } from '@nestjs/websockets';
import { randomInt } from 'crypto';

export class TimeLimitedSession extends BaseGameSession implements TimeLimitedGameSession {
    // Instanciated in function called by constructor
    games!: ExistingGame[];
    originalDifferenceCount!: number;
    differencesFound: number = 0;

    gameService: GameService;
    isImproved: boolean;
    differencesMap: Map<string, Set<string>[]> = new Map();
    // eslint-disable-next-line max-params
    constructor(
        gameService: GameService,
        differencesService: DifferencesService,
        waitingRoom: TimeLimitedWaitingRoom,
        games: ExistingGame[],
        gameConstants: GameConstants,
        isImproved: boolean,
    ) {
        super(differencesService, waitingRoom, gameConstants);
        this.gameService = gameService;
        this.games = games;
        this.isImproved = isImproved;
    }

    async getRandomGame(): Promise<Game | undefined> {
        if (this.games.length > 0) {
            const gameId = randomInt(this.games.length);
            await this.loadGame(gameId);
            const currentGameDifferences = this.differencesMap.get(this.game._id);
            if (currentGameDifferences === undefined) {
                throw new WsException('Differences are not defined somehow');
            }
            const { newGame, differencesKeptIndexes } = await this.gameService.generateGameWithXDifferences(this.game, currentGameDifferences, 1);
            this.differences = new Array<Set<string>>();

            for (const difference of differencesKeptIndexes) {
                this.differences.push(currentGameDifferences[difference]);
                currentGameDifferences.splice(difference, 1);
            }

            const isGameToRemove = currentGameDifferences.length === 0 || !this.isImproved;
            if (isGameToRemove) {
                this.games.splice(gameId, 1);
            }

            this.differencesMap.set(this.game._id, currentGameDifferences);
            this.game = newGame;
            this.originalDifferenceCount = this.game.differencesCount;
            return this.game;
        }
    }

    async loadGame(index: number) {
        if (!this.differencesMap.has(this.games[index]._id)) {
            const differences = await this.prepareDifferences(this.games[index]);
            this.differencesMap.set(this.games[index]._id, differences);
        }
        this.game = this.games[index];
    }

    getWinner(): string | null {
        if (this.games.length !== 0 || this.game.differencesCount === this.originalDifferenceCount) {
            return null;
        }
        this.timer.stopTimer(false);
        return [...this.players.keys()][0];
    }

    async manageClick(coord: Coordinate, playerId: string): Promise<GuessResultTimeLimited> {
        const playerData = this.players.get(playerId);

        if (!playerData) {
            throw new WsException('Somehow, the player is not in the game ¯\\_(ツ)_/¯');
        }

        if (playerData.throttleEndTimestamp !== undefined && playerData.throttleEndTimestamp > Date.now()) {
            throw new WsException('You are currently throttled');
        }
        for (const [index, difference] of this.differences.entries()) {
            if (difference.has(coord.hash())) {
                this.incrementPlayerDifferencesFound();
                this.game.differencesCount--;
                const resultDifference = this.differences.splice(index, 1).pop();
                this.timer.addBonus(this.differenceFoundBonus);

                if (!resultDifference) {
                    throw new WsException('Difference is somehow not a difference');
                }
                const game = await this.getRandomGame();
                return {
                    sessionType: SessionType.TimeLimited,
                    type: ResultType.Success,
                    game,
                };
            }
        }

        playerData.throttleEndTimestamp = Date.now() + SECOND_IN_MILLISECONDS;
        return {
            sessionType: SessionType.TimeLimited,
            type: ResultType.Failure,
        };
    }

    incrementPlayerDifferencesFound() {
        this.players.forEach((value) => {
            value.differencesFound++;
        });
    }

    useHintMalus() {
        this.timer.addBonus(-this.hintPenalty);
    }
}
