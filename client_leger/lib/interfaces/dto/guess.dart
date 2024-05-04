import "package:client_leger/interfaces/game.dart";
import "package:client_leger/interfaces/image_area.dart";

class Guess {
  final Coordinate coordinate;
  final ImageArea imageArea;

  Guess(this.coordinate, this.imageArea);

  toMap() {
    return {
      "imageArea": imageArea.toString(),
      "coordinate": coordinate.toMap()
    };
  }

  factory Guess.fromJson(Map<String, dynamic> json) {
    return Guess(Coordinate.fromJson(json["coordinate"]),
        ImageArea.values.firstWhere((e) => e.toString() == json["imageArea"]));
  }
}
