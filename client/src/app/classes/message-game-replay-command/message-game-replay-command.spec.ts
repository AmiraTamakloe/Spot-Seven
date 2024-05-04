import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { ReplayEventDto } from '@common/model/events/replay.events';
import { ChatMessage } from '@common/model/message';
import { MessageGameReplayCommand } from './message-game-replay-command';

describe('MessageGameReplayCommand', () => {
    let command: MessageGameReplayCommand;
    let classicModeService: jasmine.SpyObj<ClassicModeService>;
    let replayEventDto: ReplayEventDto;

    beforeEach(() => {
        classicModeService = jasmine.createSpyObj('ClassicModeService', ['receiveMessage']);
        replayEventDto = {
            time: 123,
            body: {} as ChatMessage,
        } as ReplayEventDto;

        command = new MessageGameReplayCommand(classicModeService, replayEventDto);
    });

    it('should create an instance', () => {
        expect(command).toBeTruthy();
    });
});
