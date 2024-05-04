import 'dart:async';

import 'package:client_leger/bindings/game-bindings.dart';
import 'package:client_leger/environments/environment.dart';
import 'package:client_leger/interfaces/base_game_info.dart';
import 'package:client_leger/interfaces/differences_list.dart';
import 'package:client_leger/interfaces/dto/end_game_result.dto.dart';
import 'package:client_leger/interfaces/dto/guess.dart';
import 'package:client_leger/interfaces/error-notifier.dart';
import 'package:client_leger/interfaces/game.dart';
import 'package:client_leger/interfaces/game_image.dart';
import 'package:client_leger/interfaces/game_info.dart';
import 'package:client_leger/interfaces/game_mode.dart';
import 'package:client_leger/interfaces/guess_result.dart';
import 'package:client_leger/interfaces/image_area.dart';
import 'package:client_leger/interfaces/observer_game_session.dart';
import 'package:client_leger/interfaces/socket_event.dart';
import 'package:client_leger/pages/classic_game/classic_game_page.dart';
import 'package:client_leger/pages/game.dart';
import 'package:client_leger/services/account_service.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/services/sound_service.dart';
import 'package:get/get.dart';

enum EndGameStatus { win, lose, forfeit }

abstract class GameService extends GetxController {
  final String uploadsUrl = environment['uploadUrl'];
  late GameMode gameMode;
  bool isObservingPlayer = false;
  late ObserverGameSession? observerGameSession = null;

  static GameService get to => Get.find();

  Completer<Game> gameCompleter = Completer<Game>();
  Completer<EndGameStatus> endGameCompleter = Completer<EndGameStatus>();

  late GameInfo gameInfo;
  Game? game;
  late int initialTime;
  late int hintPenalty;
  late int differenceFoundBonus;
  int? throttleEndTimestamp;
  late SocketService socketService;
  int differencesFound = 0;
  late RxInt differencesFoundObs;

  ErrorNotifier originalErrorNotifier = ErrorNotifier();
  ErrorNotifier modifiedErrorNotifier = ErrorNotifier();
  DifferencesList originalCanvasBlink = DifferencesList();
  DifferencesList modifiedCanvasBlink = DifferencesList();
  SoundService soundService = SoundService();
  late GameImage originalCanvasImage;
  late GameImage modifiedCanvasImage;
  int timerCounter = 0;
  late RxInt timerValue;

  Future<void> setupGame() async {
    resetToDefault();

    _setupEventListeners();
  }

  _setupEventListeners() {
    SocketService.to.on(SocketEvent.gameStart, setGameInfosFromJson);

    SocketService.to.on(SocketEvent.differenceFound, differencesFoundHandler);
    SocketService.to.on(SocketEvent.endGame, (dynamic rawEndGameResult) {
      handleEndGame(EndGameResultDto.fromJson(rawEndGameResult));
    });
    SocketService.to
        .on(SocketEvent.observersSessionUpdate, updateObserversGameSession);
    SocketService.to.on(SocketEvent.observerGameStart, setObserverGameInfo);
  }

  setGameMode(GameMode gameMode) {
    this.gameMode = gameMode;
  }

  void resetToDefault() {
    game = null;
    differencesFoundObs = differencesFound.obs;
    gameCompleter = Completer<Game>();
    endGameCompleter = Completer<EndGameStatus>();
    originalCanvasBlink = DifferencesList();
    modifiedCanvasBlink = DifferencesList();
    originalErrorNotifier = ErrorNotifier();
    modifiedErrorNotifier = ErrorNotifier();
  }

  void setGameInfosFromJson(dynamic gameInfoJson) {
    switch (gameMode) {
      case GameMode.classic:
      case GameMode.classicTeam:
        Get.to(() => ClassicGamePage(), binding: ClassicBindings());
        break;
      case GameMode.timeLimited:
      case GameMode.timeLimitedImproved:
        Get.to(() => TimeLimitedGamePage());
        break;
    }
    final BaseGameInfo baseGameInfo = BaseGameInfo.fromJson(gameInfoJson);
    setGameInfos(baseGameInfo);
  }

  void setGameInfos(BaseGameInfo baseGameInfo) {
    resetToDefault();
    gameInfo = GameInfo(
        game: baseGameInfo.game,
        gameMode: gameMode,
        username: AccountService.to.username,
        initialTime: baseGameInfo.initialTime,
        hintPenalty: baseGameInfo.hintPenalty,
        differenceFoundBonus: baseGameInfo.differenceFoundBonus,
        otherPlayersUsername: baseGameInfo.usernames
            .map((username) =>
                username != AccountService.to.username ? username : null)
            .whereType<String>()
            .toList());
    game = gameInfo.game;
    initialTime = gameInfo.initialTime;
    hintPenalty = gameInfo.hintPenalty;
    isObservingPlayer = false;
    differenceFoundBonus = gameInfo.differenceFoundBonus;
    gameCompleter.complete(game!);
    timerCounter = initialTime;
    timerValue = timerCounter.obs;
    Timer.periodic(const Duration(seconds: 2), (timer) {
      if (timerCounter == 0) {
        timer.cancel();
      }
      timerCounter--;
      timerValue.value = timerCounter;
    });
  }

  setObserverGameInfo(dynamic observersGameInfo) {
    final observersGameInfoSetup =
        ObserversGameInfo.mapToType(observersGameInfo);
    final BaseGameInfo baseGameInfo = observersGameInfoSetup.gameInfo;
    final ObserverGameSession observersGameSession =
        observersGameInfoSetup.observersGameSession;

    final GameInfo gameInfo = GameInfo(
        game: baseGameInfo.game,
        gameMode: observersGameSession.gameMode,
        username: AccountService.to.username,
        initialTime: baseGameInfo.initialTime,
        hintPenalty: baseGameInfo.hintPenalty,
        differenceFoundBonus: baseGameInfo.differenceFoundBonus,
        otherPlayersUsername: baseGameInfo.usernames
            .map((username) =>
                username != AccountService.to.username ? username : null)
            .whereType<String>()
            .toList());

    this.gameInfo = gameInfo;
    game = gameInfo.game;
    initialTime = gameInfo.initialTime;
    isObservingPlayer = true;
    observerGameSession = observersGameSession;
    gameCompleter.complete(gameInfo.game);
  }

  isGameModeClassic(ObserverGameSession observerGameSession) {
    return observerGameSession.gameMode == GameMode.classic ||
        observerGameSession.gameMode == GameMode.classicTeam;
  }

  updateObserversGameSession(mapObserverGameSession) {
    observerGameSession = ObserverGameSession.mapToType(mapObserverGameSession);
  }

  initializeObserverState();

  Future<Game> getGame() async {
    return gameCompleter.future;
  }

  Future<void> handleClick(ImageArea imageArea, int x, int y) async {
    if (isObservingPlayer) return;
    if (throttleEndTimestamp != null &&
        DateTime.now().millisecondsSinceEpoch < throttleEndTimestamp!) {
      return;
    }

    final Coordinate coordinate = Coordinate(x, y);

    SocketService.to
        .send(SocketEvent.guessDifference, Guess(coordinate, imageArea),
            (dynamic rawGuessResult) {
      handleRawResponse(rawGuessResult, imageArea, coordinate);
    });
  }

  differencesFoundHandler(dynamic result);

  // TODO: Combine ImageArea and Coordinate into a the Guess
  handleRawResponse(
      dynamic rawGuessResult, ImageArea imageArea, Coordinate coordinate);

  handleClickResponse(
      GuessResult guessResult, ImageArea imageArea, Coordinate coordinate);

  onErrorFound(ImageArea imageArea, Coordinate coordinate) {
    if (imageArea == ImageArea.original) {
      originalErrorNotifier.setError(coordinate);
    } else {
      modifiedErrorNotifier.setError(coordinate);
    }
    soundService.playWrongSoundEffect();
    throttleEndTimestamp = DateTime.now().millisecondsSinceEpoch + 1000;
  }

  onDifferencesFound(dynamic differences);

  makeBlink(List<Coordinate> differences) {
    for (Coordinate difference in differences) {
      originalCanvasBlink.addDifference(difference);
      modifiedCanvasBlink.addDifference(difference);
    }
    soundService.playGoodSoundEffect();
    originalCanvasBlink.doNotifyListeners();
    modifiedCanvasBlink.doNotifyListeners();
  }

  Future<bool> setOriginalGameImage() async {
    await getGame();
    originalCanvasImage = GameImage(
        "$uploadsUrl/${game!.originalImageFilename}", ImageArea.original);
    return originalCanvasImage.getDisplayableImage();
  }

  Future<bool> setModifiedGameImage() async {
    await getGame();
    modifiedCanvasImage = GameImage(
        "$uploadsUrl/${game!.modifiedImageFilename}", ImageArea.original);
    return modifiedCanvasImage.getDisplayableImage();
  }

  void handleEndGame(EndGameResultDto endGameResultDto) {
    EndGameStatus result;
    if (endGameResultDto.isWinner) {
      result = EndGameStatus.win;
      soundService.playWinningSoundEffect();
    } else if (endGameResultDto.isForfeit) {
      result = EndGameStatus.forfeit;
    } else {
      result = EndGameStatus.lose;
    }

    endGameCompleter.complete(result);
  }

  Future<EndGameStatus> isGameEnded() async {
    return endGameCompleter.future;
  }

  bool areCurrentObservers() {
    if (observerGameSession == null) return false;
    if (observerGameSession!.currentObservers.isNotEmpty) {
      return true;
    }
    return false;
  }

  void giveUp() async {
    SocketService.to.send(SocketEvent.giveUp);
    Get.toNamed('/home');
  }
}
