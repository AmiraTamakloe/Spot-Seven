import 'game.dart';

class BaseGameInfo {
  final String sessionId;
  final ExistingGame game;
  final int initialTime;
  final int hintPenalty;
  final int differenceFoundBonus;
  final List<String> usernames;

  BaseGameInfo({
    required this.sessionId,
    required this.game,
    required this.initialTime,
    required this.hintPenalty,
    required this.differenceFoundBonus,
    required this.usernames,
  });

  factory BaseGameInfo.fromJson(Map<String, dynamic> json) {
    return BaseGameInfo(
      sessionId: json['sessionId'],
      game: ExistingGame.fromJson(json['game']),
      initialTime: json['initialTime'] as int,
      hintPenalty: json['hintPenalty'] as int,
      differenceFoundBonus: json['differenceFoundBonus'] as int,
      usernames: List<String>.from(json['usernames'] as List),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'sessionId': sessionId,
      'game': game.toJson(),
      'initialTime': initialTime,
      'hintPenalty': hintPenalty,
      'differenceFoundBonus': differenceFoundBonus,
      'usernames': usernames,
    };
  }
}
