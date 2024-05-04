import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { ReplayEventDto } from '@common/model/events/replay.events';
import { Guess } from '@common/model/guess';
import { GuessResultClassic } from '@common/model/guess-result';
import { GuessDifferenceGameReplayCommand } from './guess-difference-game-replay-command';

describe('GuessDifferenceGameReplayCommand', () => {
    let command: GuessDifferenceGameReplayCommand;
    let classicModeService: jasmine.SpyObj<ClassicModeService>;
    let replayEventDto: ReplayEventDto;

    beforeEach(() => {
        classicModeService = jasmine.createSpyObj('ClassicModeService', ['handleClickCallback']);
        replayEventDto = {
            time: 123,
            body: {} as Guess,
            response: {} as GuessResultClassic,
        } as ReplayEventDto;

        command = new GuessDifferenceGameReplayCommand(classicModeService, replayEventDto);
    });

    it('should create an instance', () => {
        expect(command).toBeTruthy();
    });
});
