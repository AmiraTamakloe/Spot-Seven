import 'package:client_leger/classes/game-replay-commands/game_replay_command.dart';
import 'package:client_leger/interfaces/dto/replay_event.dto.dart';

class UseHintGameReplayCommand extends GameReplayCommand {
  final UseHintReplayDto eventDto;

  UseHintGameReplayCommand({required this.eventDto, required super.time});

  @override
  void action() {
    print('UseHintGameReplayCommand action');
  }
}
