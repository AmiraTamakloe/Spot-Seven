import { GameReplayCommand } from '@app/interfaces/game-replay-command';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { ReplayEventDto } from '@common/model/events/replay.events';
import { Guess } from '@common/model/guess';
import { GuessResultClassic } from '@common/model/guess-result';

export class GuessDifferenceGameReplayCommand implements GameReplayCommand {
    time: number;
    private classicModeService: ClassicModeService;
    private replayEventDto: ReplayEventDto;

    constructor(classicModeService: ClassicModeService, replayEventDto: ReplayEventDto) {
        this.time = replayEventDto.time;
        this.classicModeService = classicModeService;
        this.replayEventDto = replayEventDto;
    }

    action() {
        this.classicModeService.handleClickCallback(this.replayEventDto.body as Guess, this.replayEventDto.response as GuessResultClassic);
    }
}
