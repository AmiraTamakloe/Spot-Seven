import { Injectable } from '@angular/core';
import { GAMES_PER_PAGE } from '@app/constants/game-selection-panel-constants';
import { CommunicationService } from '@app/services/communication/communication.service';
import { SocketService } from '@app/services/socket/socket.service';
import { ConfigurationEvent } from '@common/model/events/configuration.events';
import { GameCreateEvent } from '@common/model/events/game-create.events';
import { ExistingGame } from '@common/model/game';

@Injectable({
    providedIn: 'root',
})
export class GameSelectionService {
    gamesToRender: ExistingGame[] = [];
    gamesLoaded: boolean = false;

    private gamePagePosition: number = 0;
    private numberOfPages: number = 0;
    private games: ExistingGame[] = [];

    constructor(private communicationService: CommunicationService, private socketService: SocketService) {
        this.fetchGames();

        this.socketService.on(ConfigurationEvent.GameWasDeleted, (deletedGameId: string) => {
            this.deleteGame(deletedGameId);
        });

        this.socketService.on(GameCreateEvent.GameWasCreated, (newGame: ExistingGame) => {
            this.games.push(newGame);
            this.loadGames();
        });
    }

    fetchGames(): void {
        this.games = [];
        this.gamesLoaded = false;
        const gamesObserver = {
            next: (games: ExistingGame[]) => {
                this.games = games;
                this.loadGames();
            },
        };
        this.communicationService.getAllGames().subscribe(gamesObserver);
    }

    isFirstPage(): boolean {
        return this.gamePagePosition === 0;
    }

    isLastPage(): boolean {
        return this.gamePagePosition >= this.numberOfPages - 1;
    }

    next(): void {
        if (this.gamePagePosition < this.numberOfPages - 1) {
            this.gamePagePosition++;
        }
        this.loadGames();
    }

    previous(): void {
        if (this.gamePagePosition > 0) {
            this.gamePagePosition--;
        }

        this.loadGames();
    }

    deleteGame(gameId: string): void {
        this.games = this.games.filter((game: ExistingGame) => {
            return game._id !== gameId;
        });
        this.loadGames();
    }

    private loadGames(): void {
        this.calculateNumberOfPages();
        this.gamesLoaded = false;
        this.gamesToRender = [];
        const max = this.gamePagePosition * GAMES_PER_PAGE + GAMES_PER_PAGE;
        for (let i = this.gamePagePosition * GAMES_PER_PAGE; i < max; i++) {
            if (i < this.games.length) {
                this.gamesToRender.push(this.games[i]);
            }
        }
        this.gamesLoaded = true;
    }

    private calculateNumberOfPages(): void {
        // FIXME: bug où this.games est undefined quand on joue au mode multi-joueurs plusieurs fois?
        this.numberOfPages = Math.ceil(this.games.length / GAMES_PER_PAGE);
    }
}
