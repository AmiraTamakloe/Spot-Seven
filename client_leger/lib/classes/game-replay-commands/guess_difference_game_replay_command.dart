import 'package:client_leger/classes/game-replay-commands/game_replay_command.dart';
import 'package:client_leger/interfaces/dto/replay_event.dto.dart';
import 'package:client_leger/services/replay_service.dart';

class GuessDifferenceGameReplayCommand extends GameReplayCommand {
  final GuessDifferenceReplayDto eventDto;

  GuessDifferenceGameReplayCommand(
      {required this.eventDto, required super.time});

  @override
  void action() {
    ReplayService.to.handleClickResponse(
        eventDto.response, eventDto.body.imageArea, eventDto.body.coordinate);
  }
}
