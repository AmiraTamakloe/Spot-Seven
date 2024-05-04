import { GameReplayCommand } from '@app/interfaces/game-replay-command';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
// import { ChatMessage } from '@common/model/message';
import { ReplayEventDto } from '@common/model/events/replay.events';

export class MessageGameReplayCommand implements GameReplayCommand {
    time: number;
    // private classicModeService: ClassicModeService;
    // private replayEventDto: ReplayEventDto;

    constructor(classicModeService: ClassicModeService, replayEventDto: ReplayEventDto) {
        this.time = replayEventDto.time;
        // this.classicModeService = classicModeService;
        // this.replayEventDto = replayEventDto;
    }

    action() {
        // FIX ME this.classicModeService.receiveMessage(this.replayEventDto.body as ChatMessage);
    }
}
