import 'package:client_leger/bindings/game-bindings.dart';
import 'package:client_leger/interfaces/game_mode.dart';
import 'package:client_leger/interfaces/observer_game_session.dart';
import 'package:client_leger/interfaces/socket_event.dart';
import 'package:client_leger/pages/classic_game/classic_game_page.dart';
import 'package:client_leger/pages/game.dart';
import 'package:client_leger/services/classic_service.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/services/time_limited_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ObserverService extends GetxController {
  static ObserverService get to => Get.find();

  ObserverGameSession? currentObserverGameSession;
  late BuildContext currentContext;
  RxList<ObserverGameSession> observersGameSessions =
      <ObserverGameSession>[].obs;

  @override
  void onInit() async {
    await setUpEventListeners();
    super.onInit();
  }

  setUpEventListeners() async {
    SocketService.to
        .on(SocketEvent.observerGameSessionsUpdate, _updateSessions);
  }

  _updateSessions(observersSessions) {
    observersGameSessions.clear();
    for (var observerSession in observersSessions) {
      observersGameSessions.add(ObserverGameSession.mapToType(observerSession));
    }
  }

  joinGameSession(String gameSessionId, GameMode gameMode) async {
    SocketService.to.send(SocketEvent.startObservingGameSession, gameSessionId);
    if (isGameModeClassic(gameMode)) {
      await ClassicService.to.setupGame();
      Get.to(() => ClassicGamePage(), binding: ClassicBindings());
    } else {
      await TimeLimitedService.to.setupGame();
      Get.to(() => TimeLimitedGamePage(), binding: TimeLimitedBindings());
    }
  }

  fetchGameSessions() {
    SocketService.to.send(SocketEvent.fetchObserverGameSessions);
  }

  isGameModeClassic(GameMode gameMode) {
    return gameMode == GameMode.classic || gameMode == GameMode.classicTeam;
  }
}
