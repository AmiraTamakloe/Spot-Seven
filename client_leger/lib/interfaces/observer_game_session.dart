import 'package:client_leger/interfaces/base_game_info.dart';
import 'package:client_leger/interfaces/game_mode.dart';
import 'package:client_leger/interfaces/player.dart';

class ObserverGameSession {
  String gameRoomId;
  String observersRoomId;
  String gameName;
  GameMode gameMode;
  List<Player> currentObservers;
  List<dynamic> currentDifferencesFound;

  ObserverGameSession({
    required this.gameRoomId,
    required this.observersRoomId,
    required this.gameName,
    required this.gameMode,
    required this.currentObservers,
    required this.currentDifferencesFound,
  });

  factory ObserverGameSession.mapToType(Map<String, dynamic> map) {
    return switch (map) {
      {
        'gameRoomId': String gameRoomId,
        'observersRoomId': String observersRoomId,
        'gameName': String gameName,
        'gameMode': String gameMode,
        'currentObservers': List<dynamic> currentObservers,
        'currentDifferencesFound': List<dynamic> currentDifferencesFound,
      } =>
        ObserverGameSession(
          gameRoomId: gameRoomId,
          observersRoomId: observersRoomId,
          gameName: gameName,
          gameMode: parseGameMode(gameMode),
          currentObservers: currentObservers
              .map((player) => Player.mapToType(player as Map<String, dynamic>))
              .toList(),
          currentDifferencesFound: currentDifferencesFound,
        ),
      _ => throw const FormatException('Cannot construct ObserverGameSession.'),
    };
  }

  Map<String, dynamic> toMap() {
    return {
      'gameRoomId': gameRoomId,
      'observersRoomId': observersRoomId,
      'gameName': gameName,
      'gameMode': gameMode.name,
      'currentObservers':
          currentObservers.map((player) => player.toJson()).toList(),
      'currentDifferencesFound': currentDifferencesFound,
    };
  }
}

class ObserversGameInfo {
  ObserverGameSession observersGameSession;
  BaseGameInfo gameInfo;

  ObserversGameInfo({
    required this.observersGameSession,
    required this.gameInfo,
  });

  factory ObserversGameInfo.mapToType(Map<String, dynamic> map) {
    return switch (map) {
      {
        'observersGameSession': dynamic observersGameSession,
        'gameInfo': dynamic gameInfo,
      } =>
        ObserversGameInfo(
          observersGameSession:
              ObserverGameSession.mapToType(observersGameSession),
          gameInfo: BaseGameInfo.fromJson(gameInfo),
        ),
      _ => throw const FormatException('Cannot construct ObserverGameInfo.'),
    };
  }

  Map<String, dynamic> toMap() {
    return {
      'observersGameSession': observersGameSession.toMap(),
      'gameInfo': gameInfo.toJson(),
    };
  }
}
