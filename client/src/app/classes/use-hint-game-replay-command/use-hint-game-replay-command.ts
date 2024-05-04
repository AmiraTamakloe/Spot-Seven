import { GameReplayCommand } from '@app/interfaces/game-replay-command';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { ReplayEventDto } from '@common/model/events/replay.events';
import { Hint } from '@common/model/hints';

export class UseHintGameReplayCommand implements GameReplayCommand {
    time: number;
    private classicModeService: ClassicModeService;
    private replayEventDto: ReplayEventDto;

    constructor(classicModeService: ClassicModeService, replayEventDto: ReplayEventDto) {
        this.time = replayEventDto.time;
        this.classicModeService = classicModeService;
        this.replayEventDto = replayEventDto;
    }

    action() {
        this.classicModeService.hintCallback(this.replayEventDto.response as Hint);
    }
}
