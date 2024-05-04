import 'dart:ui';

import 'package:client_leger/interfaces/high_score.dart';

class Game {
  String id;
  String name;
  String difficulty;
  int differencesCount;
  String originalImageFilename;
  String? modifiedImageFilename;
  List<HighScore> soloHighScores;
  List<HighScore> duelHighScores;

  Game(
      {required this.id,
      required this.name,
      required this.difficulty,
      required this.differencesCount,
      required this.originalImageFilename,
      required this.soloHighScores,
      required this.duelHighScores,
      this.modifiedImageFilename});

  factory Game.fromJson(Map<String, dynamic> json) {
    return Game(
      id: json['_id'],
      name: json['name'],
      difficulty: "" /*FIXME*/,
      differencesCount: json['differencesCount'],
      originalImageFilename: json['originalImageFilename'],
      modifiedImageFilename: json["modifiedImageFilename"],
      soloHighScores: (json['soloHighScores'] as List<dynamic>)
          .map((score) => HighScore.fromJson(score as Map<String, dynamic>))
          .toList(),
      duelHighScores: (json['duelHighScores'] as List<dynamic>)
          .map((score) => HighScore.fromJson(score as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'difficulty': difficulty.toString().split('.').last,
      'differencesCount': differencesCount,
      'originalImageFilename': originalImageFilename,
      'modifiedImageFilename': modifiedImageFilename,
      'soloHighScores': soloHighScores.map((score) => score.toJson()).toList(),
      'duelHighScores': duelHighScores.map((score) => score.toJson()).toList(),
    };
  }
}

class ExistingGame extends Game {
  @override
  ExistingGame(
      {required super.id,
      required super.name,
      required super.difficulty,
      required super.differencesCount,
      required super.originalImageFilename,
      required super.modifiedImageFilename,
      required super.soloHighScores,
      required super.duelHighScores});

  factory ExistingGame.fromJson(Map<String, dynamic> json) {
    return ExistingGame(
      id: json['_id'] as String,
      name: json['name'] as String,
      difficulty: '', // FIXME
      differencesCount: json['differencesCount'] as int,
      originalImageFilename: json['originalImageFilename'] as String,
      modifiedImageFilename: json['modifiedImageFilename'] as String,
      soloHighScores: (json['soloHighScores'] as List<dynamic>)
          .map((score) => HighScore.fromJson(score as Map<String, dynamic>))
          .toList(),
      duelHighScores: (json['duelHighScores'] as List<dynamic>)
          .map((score) => HighScore.fromJson(score as Map<String, dynamic>))
          .toList(),
    );
  }
}

class Coordinate extends Offset {
  Coordinate(int dx, int dy) : super(dx.toDouble(), dy.toDouble());

  factory Coordinate.fromJson(Map<String, dynamic> jsonData) {
    return Coordinate(jsonData["x"], jsonData["y"]);
  }

  Map<String, dynamic> toMap() {
    return {"x": dx, "y": dy};
  }
}

const coordinateEncodingLength = 4;
