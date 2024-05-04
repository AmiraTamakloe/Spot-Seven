import 'package:client_leger/classes/game-replay-commands/game_replay_command.dart';
import 'package:client_leger/interfaces/dto/replay_event.dto.dart';
import 'package:client_leger/services/replay_service.dart';

class EndGameGameReplayCommand extends GameReplayCommand {
  final EndGameReplayDto eventDto;

  EndGameGameReplayCommand({required this.eventDto, required super.time});

  @override
  void action() {
    ReplayService.to.handleEndGame(eventDto.response);
  }
}
