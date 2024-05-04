import { GameReplayCommand } from '@app/interfaces/game-replay-command';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { EndGameResultDto } from '@common/model/dto/end-game-result';
import { ReplayEventDto } from '@common/model/events/replay.events';

export class EndGameGameReplayCommand implements GameReplayCommand {
    time: number;
    private classicModeService: ClassicModeService;
    private replayEventDto: ReplayEventDto;

    constructor(classicModeService: ClassicModeService, replayEventDto: ReplayEventDto) {
        this.time = replayEventDto.time;
        this.classicModeService = classicModeService;
        this.replayEventDto = replayEventDto;
    }

    action() {
        this.classicModeService.endGame(this.replayEventDto.response as EndGameResultDto);
    }
}
