import 'package:client_leger/interfaces/game_mode.dart';
import 'package:client_leger/interfaces/match_creation_info.dart';

class CreateGameSessionDto {
  final String username;
  final GameMode gameMode;
  final FriendsGameType? friendsGameType;

  CreateGameSessionDto(
      {required this.username, required this.gameMode, this.friendsGameType});

  Map<String, dynamic> toMap() {
    return {
      'username': username,
      'gameMode': gameMode,
    };
  }
}

class CreateClassicGameSessionDto extends CreateGameSessionDto {
  String gameId;

  CreateClassicGameSessionDto({
    required super.username,
    required super.gameMode,
    super.friendsGameType,
    required this.gameId,
  });

  @override
  Map<String, dynamic> toMap() {
    if (friendsGameType == null) {
      return {
        'gameId': gameId,
        'username': username,
        'gameMode': gameMode.name,
      };
    } else {
      return {
        'gameId': gameId,
        'username': username,
        'gameMode': gameMode.name,
        'friendsGameType': friendsGameType.toString(),
      };
    }
  }
}

class CreateTimeLimitedGameSessionDto extends CreateGameSessionDto {
  CreateTimeLimitedGameSessionDto(
      {required super.username,
      required super.gameMode,
      super.friendsGameType});

  @override
  Map<String, dynamic> toMap() {
    return {
      'username': username,
      'gameMode': gameMode.name,
    };
  }
}
