import 'package:client_leger/interfaces/game.dart';
import 'package:client_leger/interfaces/guess_result.dart';
import 'package:client_leger/interfaces/image_area.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:get/get.dart';

class TimeLimitedService extends GameService {
  static TimeLimitedService get to => Get.find();

  @override
  handleRawResponse(
      rawGuessResult, ImageArea imageArea, Coordinate coordinate) {
    GuessResult guessResult = GuessResult.fromJson(rawGuessResult);

    if (guessResult.type == ResultType.success) {
      guessResult = TimeLimitedSuccessGuessResult.fromJson(rawGuessResult);
    }

    handleClickResponse(guessResult, imageArea, coordinate);
  }

  @override
  handleClickResponse(
      GuessResult guessResult, ImageArea imageArea, Coordinate coordinate) {
    if (guessResult.type == ResultType.success) {
      onDifferencesFound((guessResult as TimeLimitedSuccessGuessResult).game);
    } else {
      onErrorFound(imageArea, coordinate);
    }
  }

  @override
  // ignore: avoid_renaming_method_parameters
  onDifferencesFound(dynamic game) {
    if (game is ExistingGame) {
      differencesFound += 1;
      gameInfo.game = game;
      originalCanvasImage
          .loadNewImage("$uploadsUrl/${game.originalImageFilename}");
      modifiedCanvasImage
          .loadNewImage("$uploadsUrl/${game.modifiedImageFilename}");
    }
  }

  @override
  differencesFoundHandler(result) {
    final TimeLimitedSuccessGuessResult guessResult =
        TimeLimitedSuccessGuessResult.fromJson(result);
    onDifferencesFound(guessResult.game);
  }

  @override
  initializeObserverState() {
    // TODO: set up differences
  }
}
