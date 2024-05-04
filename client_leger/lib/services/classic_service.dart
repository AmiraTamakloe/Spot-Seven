import 'package:client_leger/interfaces/game.dart';
import 'package:client_leger/interfaces/guess_result.dart';
import 'package:client_leger/interfaces/image_area.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:get/get.dart';
import 'package:image/image.dart' as img;

class ClassicService extends GameService {
  static ClassicService get to => Get.find();

  @override
  handleRawResponse(
      rawGuessResult, ImageArea imageArea, Coordinate coordinate) {
    GuessResult guessResult = GuessResult.fromJson(rawGuessResult);

    if (guessResult.type == ResultType.success) {
      guessResult = ClassicSuccessGuessResult.fromJson(rawGuessResult);
    }

    handleClickResponse(guessResult, imageArea, coordinate);
  }

  @override
  handleClickResponse(
      GuessResult guessResult, ImageArea imageArea, Coordinate coordinate) {
    if (guessResult.type == ResultType.success) {
      onDifferencesFound((guessResult as ClassicSuccessGuessResult).difference);
    } else {
      onErrorFound(imageArea, coordinate);
    }
  }

  @override
  onDifferencesFound(dynamic differences) {
    if (differences is List<Coordinate>) {
      differencesFound += 1;
      for (Coordinate coordinate in differences) {
        img.Pixel pixel = originalCanvasImage.image
            .getPixelSafe(coordinate.dx.toInt(), coordinate.dy.toInt());
        modifiedCanvasImage.image
            .setPixel(coordinate.dx.toInt(), coordinate.dy.toInt(), pixel);
      }
      modifiedCanvasImage.regenerateImage();
      originalCanvasBlink.clearDifferences();
      modifiedCanvasBlink.clearDifferences();
      makeBlink(differences);
    }
  }

  @override
  differencesFoundHandler(dynamic result) {
    final ClassicSuccessGuessResult guessResult =
        ClassicSuccessGuessResult.fromJson(result);
    onDifferencesFound(guessResult.difference);
  }

  @override
  initializeObserverState() async {
    // We know that this is set because setObserversGameInfo is already called
    for (dynamic currentDifference
        in observerGameSession!.currentDifferencesFound) {
      final ClassicSuccessGuessResult classicGuessResult =
          ClassicSuccessGuessResult.fromJson(currentDifference);

      for (Coordinate coordinate in classicGuessResult.difference) {
        img.Pixel pixel = originalCanvasImage.image
            .getPixelSafe(coordinate.dx.toInt(), coordinate.dy.toInt());
        modifiedCanvasImage.image
            .setPixel(coordinate.dx.toInt(), coordinate.dy.toInt(), pixel);
      }
    }
    await modifiedCanvasImage.regenerateImage();
  }
}
