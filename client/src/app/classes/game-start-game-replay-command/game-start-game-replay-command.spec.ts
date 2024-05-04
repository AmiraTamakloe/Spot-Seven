import { GameInfo } from '@app/interfaces/game-info';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { ReplayEventDto } from '@common/model/events/replay.events';
import { GameStartGameReplayCommand } from './game-start-game-replay-command';

describe('GameStartGameReplayCommand', () => {
    let command: GameStartGameReplayCommand;
    let classicModeService: jasmine.SpyObj<ClassicModeService>;
    let replayEventDto: ReplayEventDto;

    beforeEach(() => {
        classicModeService = jasmine.createSpyObj('ClassicModeService', ['afterViewInitialize']);
        replayEventDto = {
            time: 123,
            response: {} as GameInfo,
        } as unknown as ReplayEventDto;

        command = new GameStartGameReplayCommand(classicModeService, replayEventDto);
    });

    it('should create an instance', () => {
        expect(command).toBeTruthy();
    });
});
