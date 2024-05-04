import 'package:client_leger/classes/game-replay-commands/game_replay_command.dart';
import 'package:client_leger/interfaces/dto/replay_event.dto.dart';

class GameStartGameReplayCommand extends GameReplayCommand {
  final GameStartReplayDto eventDto;

  GameStartGameReplayCommand({required this.eventDto, required super.time});

  @override
  void action() {
    print('Game Start action');
  }
}
