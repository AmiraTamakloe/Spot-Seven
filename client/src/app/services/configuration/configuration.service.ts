import { Injectable } from '@angular/core';
import { GameSelectionService } from '@app/services/game-selection/game-selection.service';
import { SocketService } from '@app/services/socket/socket.service';
import { ConfigurationEvent } from '@common/model/events/configuration.events';

@Injectable({
    providedIn: 'root',
})
export class ConfigurationService {
    constructor(private socketService: SocketService, private gameSelectionService: GameSelectionService) {
        this.socketService.on(ConfigurationEvent.ReinitializeWasDone, () => {
            this.gameSelectionService.fetchGames();
        });
    }

    reinitializeScores(gameId: string) {
        this.socketService.send(ConfigurationEvent.ReinitializeScores, { gameId });
    }

    reinitializeAllScores() {
        this.socketService.send(ConfigurationEvent.ReinitializeAllScores);
    }
}
