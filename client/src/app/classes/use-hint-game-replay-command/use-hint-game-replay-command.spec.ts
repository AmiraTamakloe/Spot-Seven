import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { ReplayEventDto } from '@common/model/events/replay.events';
import { Hint } from '@common/model/hints';
import { UseHintGameReplayCommand } from './use-hint-game-replay-command';

describe('UseHintGameReplayCommand', () => {
    let command: UseHintGameReplayCommand;
    let classicModeService: jasmine.SpyObj<ClassicModeService>;
    let replayEventDto: ReplayEventDto;

    beforeEach(() => {
        classicModeService = jasmine.createSpyObj('ClassicModeService', ['hintCallback']);

        replayEventDto = {
            time: 123,
            response: {} as Hint,
        } as ReplayEventDto;

        command = new UseHintGameReplayCommand(classicModeService, replayEventDto);
    });

    it('should create an instance', () => {
        expect(command).toBeTruthy();
    });
});
