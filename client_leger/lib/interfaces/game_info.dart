import 'package:client_leger/interfaces/game.dart';
import 'package:client_leger/interfaces/game_mode.dart';

class GameInfo {
  ExistingGame game;
  final String username;
  final List<String>? otherPlayersUsername;
  final GameMode gameMode;
  final int initialTime;
  final int hintPenalty;
  final int differenceFoundBonus;

  GameInfo({
    required this.game,
    required this.username,
    this.otherPlayersUsername,
    required this.gameMode,
    required this.initialTime,
    required this.hintPenalty,
    required this.differenceFoundBonus,
  });

  factory GameInfo.fromJson(Map<String, dynamic> json) {
    return GameInfo(
      game: ExistingGame.fromJson(json['game']),
      username: json['username'] as String,
      otherPlayersUsername: (json['otherPlayersUsername'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      gameMode: parseGameMode(json['gameMode']),
      initialTime: json['initialTime'] as int,
      hintPenalty: json['hintPenalty'] as int,
      differenceFoundBonus: json['differenceFoundBonus'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'game': game.toJson(),
      'username': username,
      'otherPlayersUsername': otherPlayersUsername,
      'gameMode': getGameModeString(gameMode),
      'initialTime': initialTime,
      'hintPenalty': hintPenalty,
      'differenceFoundBonus': differenceFoundBonus,
    };
  }
}

class PlayingGameInfo {
  Game game;
  int initialTime;
  int hintPenalty;
  int differenceFoundBonus;
  List<String> usernames;

  PlayingGameInfo(
      {required this.game,
      required this.initialTime,
      required this.hintPenalty,
      required this.differenceFoundBonus,
      required this.usernames});

  factory PlayingGameInfo.fromJson(Map<String, dynamic> jsonData) {
    return PlayingGameInfo(
        game: Game.fromJson(jsonData["game"]),
        initialTime: jsonData["initialTime"],
        hintPenalty: jsonData["hintPenalty"],
        differenceFoundBonus: jsonData["differenceFoundBonus"],
        usernames: jsonData["usernames"].cast<String>());
  }
}
