import 'package:client_leger/classes/game-replay-commands/game_replay_command.dart';
import 'package:client_leger/interfaces/dto/replay_event.dto.dart';

class MessageGameReplayCommand extends GameReplayCommand {
  final MessageReplayDto eventDto;

  MessageGameReplayCommand({required this.eventDto, required super.time});

  @override
  void action() {
    print('MessageGameReplayCommand action');
  }
}
