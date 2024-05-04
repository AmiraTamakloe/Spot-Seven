import { GameInfo } from '@app/interfaces/game-info';
import { GameReplayCommand } from '@app/interfaces/game-replay-command';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { ReplayEventDto } from '@common/model/events/replay.events';

export class GameStartGameReplayCommand implements GameReplayCommand {
    time: number;
    private classicModeService: ClassicModeService;
    private replayEventDto: ReplayEventDto;

    constructor(classicModeService: ClassicModeService, replayEventDto: ReplayEventDto) {
        this.time = replayEventDto.time;
        this.classicModeService = classicModeService;
        this.replayEventDto = replayEventDto;
    }

    action() {
        const gameInfo = this.replayEventDto.response as unknown as GameInfo;
        this.classicModeService.gameInfo = gameInfo;
        this.classicModeService.afterViewInitialize();
    }
}
