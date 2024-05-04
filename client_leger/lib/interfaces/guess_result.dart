import 'dart:convert';
import 'dart:typed_data';

import 'package:client_leger/interfaces/game.dart';

class ClassicSuccessGuessResult extends GuessResult {
  List<Coordinate> difference;

  ClassicSuccessGuessResult(super.sessionType, super.type, this.difference);

  factory ClassicSuccessGuessResult.fromJson(Map<String, dynamic> jsonData) {
    Uint8List b64DecData = base64.decode(jsonData["difference"]);
    var buffer = b64DecData.buffer.asByteData();
    final List<Coordinate> difference = [];
    for (int i = 0; i < buffer.lengthInBytes; i += coordinateEncodingLength) {
      final Coordinate coordinate = Coordinate(
          buffer.getUint16(i, Endian.little),
          buffer.getUint16(i + 2, Endian.little));
      difference.add(coordinate);
    }
    return ClassicSuccessGuessResult(
        SessionType.fromInt(jsonData["sessionType"]),
        ResultType.fromInt(jsonData["type"]),
        difference);
  }
}

class TimeLimitedSuccessGuessResult extends GuessResult {
  ExistingGame game;
  TimeLimitedSuccessGuessResult(super.sessionType, super.type, this.game);

  factory TimeLimitedSuccessGuessResult.fromJson(
      Map<String, dynamic> jsonData) {
    return TimeLimitedSuccessGuessResult(
        SessionType.fromInt(jsonData["sessionType"]),
        ResultType.fromInt(jsonData["type"]),
        ExistingGame.fromJson(jsonData["game"]));
  }
}

class GuessResult {
  SessionType sessionType = SessionType.classic;
  ResultType type = ResultType.success;

  GuessResult(this.sessionType, this.type);

  factory GuessResult.fromJson(Map<String, dynamic> jsonData) {
    return GuessResult(SessionType.fromInt(jsonData["sessionType"]),
        ResultType.fromInt(jsonData["type"]));
  }
}

enum ResultType {
  success,
  failure;

  static ResultType fromInt(int data) => switch (data) {
        0 => success,
        1 => failure,
        _ => throw Exception("Invalid ResultType")
      };
}

enum SessionType {
  classic,
  timeLimited;

  static SessionType fromInt(int data) => switch (data) {
        0 => classic,
        1 => timeLimited,
        _ => throw Exception("Invalid SessionType")
      };
}
