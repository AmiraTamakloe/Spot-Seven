import 'dart:convert';
import 'dart:io';

import 'package:client_leger/bindings/game-bindings.dart';
import 'package:client_leger/classes/game-replay-commands/game_replay_command.dart';
import 'package:client_leger/environments/environment.dart';
import 'package:client_leger/interfaces/base_game_info.dart';
import 'package:client_leger/interfaces/dto/replay_event.dto.dart';
import 'package:client_leger/interfaces/game_mode.dart';
import 'package:client_leger/pages/replay_game/replay_game_page.dart';
import 'package:client_leger/services/game_replay_command_factory_service.dart';
import 'package:client_leger/services/interceptor.dart';
import 'package:client_leger/services/modal_service.dart';
import 'package:client_leger/services/replay_service.dart';
import 'package:get/get.dart';
import 'package:http_interceptor/http/intercepted_client.dart';

class ReplayStartService extends GetxController {
  static ReplayStartService get to => Get.find();

  final httpClient = InterceptedClient.build(
      interceptors: [AuthenticationInterceptor()],
      retryPolicy: AuthenticationInterceptor());

  final String baseUrl = environment['serverUrl'];

  Future<void> viewAfterGameReplay() async {
    final response =
        await httpClient.get(Uri.parse('$baseUrl/replays/gameReplay'));

    if (response.statusCode != HttpStatus.ok) {
      ModalService.to.showInformationModal(Get.context!, 'Replay Error',
          'Error while getting after game replay');
      return;
    }

    _startReplayFromEvents(json.decode(response.body));
  }

  Future<void> viewReplay(String id) async {
    final response = await httpClient.get(Uri.parse('$baseUrl/replays/$id'));

    if (response.statusCode != HttpStatus.ok) {
      ModalService.to.showInformationModal(Get.context!, 'Replay Error',
          'Error while getting after game replay');
      return;
    }

    _startReplayFromEvents(json.decode(response.body));
  }

  _startReplayFromEvents(Iterable rawEvents) {
    List<BaseReplayEventDto> events =
        rawEvents.map((event) => _parseEvents(event)).toList();

    if (events.isEmpty) {
      ModalService.to.showInformationModal(
          Get.context!, 'Replay Error', 'This replay is empty');
      return;
    }

    BaseGameInfo? gameInfo = _extractGameInfoFromReplay(events);

    if (gameInfo == null) {
      ModalService.to.showInformationModal(
          Get.context!, 'Replay Error', 'This replay is missing game info');
      return;
    }

    List<GameReplayCommand> commands = GameReplayCommandFactoryService.to
        .transformReplayEventsToCommands(events);

    // FIXME: This might not be the actual game mode, might need to store it in the GameInfo
    ReplayService.to.setGameMode(GameMode.classic);
    ReplayService.to.initReplay(gameInfo, commands);
    Get.off(() => ReplayGamePage(), binding: ReplayGameBindings());
  }

  BaseReplayEventDto _parseEvents(Map<String, dynamic> event) {
    switch (event['event']) {
      case 'gameStart':
        return GameStartReplayDto.fromJson(event);
      case 'guessDifference':
        return GuessDifferenceReplayDto.fromJson(event);
      case 'hintUsed':
        return UseHintReplayDto.fromJson(event);
      case 'message':
        return MessageReplayDto.fromJson(event);
      case 'endGame':
        return EndGameReplayDto.fromJson(event);
      default:
        throw Exception('Invalid event type');
    }
  }

  BaseGameInfo? _extractGameInfoFromReplay(List<BaseReplayEventDto> events) {
    BaseReplayEventDto firstEvent = events.first;

    if (firstEvent is! GameStartReplayDto) {
      return null;
    }

    return firstEvent.response;
  }
}
