import { Injectable } from '@angular/core';
import { EndGameGameReplayCommand } from '@app/classes/end-game-game-replay-command/end-game-game-replay-command';
import { GameStartGameReplayCommand } from '@app/classes/game-start-game-replay-command/game-start-game-replay-command';
import { GuessDifferenceGameReplayCommand } from '@app/classes/guess-difference-game-replay-command/guess-difference-game-replay-command';
import { MessageGameReplayCommand } from '@app/classes/message-game-replay-command/message-game-replay-command';
import { UseHintGameReplayCommand } from '@app/classes/use-hint-game-replay-command/use-hint-game-replay-command';
import { GameReplayCommand } from '@app/interfaces/game-replay-command';
import { ClassicModeService } from '@app/services/classic-mode/classic-mode.service';
import { GameSessionEvent } from '@common/model/events/game-session.events';
import { ReplayEventDto } from '@common/model/events/replay.events';

@Injectable({
    providedIn: 'root',
})
export class GameReplayCommandFactoryService {
    transformReplayEventsToCommands(events: ReplayEventDto[], classicModeService: ClassicModeService): GameReplayCommand[] {
        return events.reduce((constructedCommands: GameReplayCommand[], replayEvent: ReplayEventDto) => {
            const gameReplayCommand = this.constructEvent(replayEvent, classicModeService);

            if (gameReplayCommand) {
                constructedCommands.push(gameReplayCommand);
            }

            return constructedCommands;
        }, []);
    }

    private constructEvent(replayEventDto: ReplayEventDto, classicGameService: ClassicModeService): GameReplayCommand | null {
        switch (replayEventDto.event) {
            case GameSessionEvent.GameStart:
                return new GameStartGameReplayCommand(classicGameService, replayEventDto);
            case GameSessionEvent.GuessDifference:
                return new GuessDifferenceGameReplayCommand(classicGameService, replayEventDto);
            case GameSessionEvent.UseHint:
                return new UseHintGameReplayCommand(classicGameService, replayEventDto);
            case GameSessionEvent.Message:
                return new MessageGameReplayCommand(classicGameService, replayEventDto);
            case GameSessionEvent.EndGame:
                return new EndGameGameReplayCommand(classicGameService, replayEventDto);
            default:
                return null;
        }
    }
}
