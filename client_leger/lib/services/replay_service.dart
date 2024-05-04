import 'dart:async';
import 'dart:io';

import 'package:client_leger/classes/game-replay-commands/game_replay_command.dart';
import 'package:client_leger/classes/replay_executor.dart';
import 'package:client_leger/environments/environment.dart';
import 'package:client_leger/interfaces/base_game_info.dart';
import 'package:client_leger/interfaces/differences_list.dart';
import 'package:client_leger/interfaces/error-notifier.dart';
import 'package:client_leger/interfaces/game.dart';
import 'package:client_leger/interfaces/replay_speed.dart';
import 'package:client_leger/services/classic_service.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/services/interceptor.dart';
import 'package:get/get.dart';
import 'package:http_interceptor/http/intercepted_client.dart';

class ReplayService extends ClassicService {
  bool canSaveReplay = false;
  bool isPaused = false;

  final httpClient = InterceptedClient.build(
      interceptors: [AuthenticationInterceptor()],
      retryPolicy: AuthenticationInterceptor());

  final String replaysEndpoint = '${environment["serverUrl"]}/replays';

  late BaseGameInfo replayGameInfo;
  late List<GameReplayCommand> replayCommands;

  static ReplayService get to => Get.find();

  ReplayExecutor? _replayExecutor;

  saveAfterGameReplay() async {
    final response =
        await httpClient.post(Uri.parse('$replaysEndpoint/gameReplay'));

    if (response.statusCode != HttpStatus.created) {
      // FIXME: Show error to user
      return;
    }
  }

  Future<void> _deleteAfterGameReplay() async {
    await httpClient.delete(Uri.parse('$replaysEndpoint/gameReplay'));
  }

  initReplay(
      BaseGameInfo replayGameInfo, List<GameReplayCommand> replayCommands) {
    this.replayGameInfo = replayGameInfo;
    this.replayCommands = replayCommands;
    setupGame();
  }

  @override
  Future<void> setupGame() async {
    resetToDefault();
    _setupReplay();
  }

  @override
  resetToDefault() {
    differencesFoundObs = differencesFound.obs;
    gameCompleter = Completer<Game>();
    endGameCompleter = Completer<EndGameStatus>();
    originalCanvasBlink = DifferencesList();
    modifiedCanvasBlink = DifferencesList();
    originalErrorNotifier = ErrorNotifier();
    modifiedErrorNotifier = ErrorNotifier();
  }

  _setupReplay() {
    _replayExecutor = ReplayExecutor(replayCommands);

    setGameInfos(replayGameInfo);

    _replayExecutor!.restart();
  }

  changeReplaySpeed(Speed speed) {
    if (_replayExecutor == null) {
      return;
    }

    _replayExecutor!.speed = speed.value;
  }

  pause() {
    if (_replayExecutor == null) {
      return;
    }

    _replayExecutor!.pause();
    isPaused = true;
  }

  resume() {
    if (_replayExecutor == null) {
      return;
    }

    _replayExecutor!.resume();
    isPaused = false;
  }

  restart() {
    if (_replayExecutor == null) {
      return;
    }

    _replayExecutor!.restart();
  }

  @override
  void giveUp() {
    _deleteAfterGameReplay();
    _replayExecutor!.end();
    _replayExecutor = null;
    Get.toNamed('/home');
  }
}
