import 'package:client_leger/classes/game-replay-commands/end_game_game_replay_command.dart';
import 'package:client_leger/classes/game-replay-commands/game_replay_command.dart';
import 'package:client_leger/classes/game-replay-commands/game_start_game_replay_command.dart';
import 'package:client_leger/classes/game-replay-commands/guess_difference_game_replay_command.dart';
import 'package:client_leger/classes/game-replay-commands/message_game_replay_command.dart';
import 'package:client_leger/classes/game-replay-commands/use_hint_game_replay_command.dart';
import 'package:client_leger/interfaces/dto/replay_event.dto.dart';
import 'package:get/get.dart';

class GameReplayCommandFactoryService extends GetxController {
  static GameReplayCommandFactoryService get to => Get.find();

  List<GameReplayCommand> transformReplayEventsToCommands(
      List<BaseReplayEventDto> events) {
    List<GameReplayCommand> commands = [];

    for (BaseReplayEventDto event in events) {
      GameReplayCommand? command = _constructCommand(event);
      if (command != null) {
        commands.add(command);
      }
    }

    return commands;
  }

  GameReplayCommand? _constructCommand(BaseReplayEventDto event) {
    switch (event.event) {
      case ReplayEvent.gameStart:
        return GameStartGameReplayCommand(
            eventDto: event as GameStartReplayDto, time: event.time);
      case ReplayEvent.guessDifference:
        return GuessDifferenceGameReplayCommand(
            eventDto: event as GuessDifferenceReplayDto, time: event.time);
      case ReplayEvent.useHint:
        return UseHintGameReplayCommand(
            eventDto: event as UseHintReplayDto, time: event.time);
      case ReplayEvent.message:
        return MessageGameReplayCommand(
            eventDto: event as MessageReplayDto, time: event.time);
      case ReplayEvent.endGame:
        return EndGameGameReplayCommand(
            eventDto: event as EndGameReplayDto, time: event.time);
      default:
        return null;
    }
  }
}
