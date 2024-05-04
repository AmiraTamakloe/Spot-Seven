import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { ReplayEventDto } from '@common/model/events/replay.events';
import { EndGameGameReplayCommand } from './end-game-game-replay-command';

describe('EndGameGameReplayCommand', () => {
    let command: EndGameGameReplayCommand;
    let classicModeService: jasmine.SpyObj<ClassicModeService>;
    let replayEventDto: ReplayEventDto;

    beforeEach(() => {
        classicModeService = jasmine.createSpyObj('ClassicModeService', ['endGame']);
        replayEventDto = {
            time: 123,
        } as ReplayEventDto;

        command = new EndGameGameReplayCommand(classicModeService, replayEventDto);
    });

    it('should create an instance', () => {
        expect(command).toBeTruthy();
    });
});
