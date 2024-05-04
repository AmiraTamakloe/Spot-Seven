import 'package:client_leger/interfaces/game_mode.dart';

enum InternalFriendsGameType {
  friendsOnly,
  friendsOfFriends;
}

class FriendsGameType {
  final InternalFriendsGameType type;
  FriendsGameType(this.type);

  @override
  String toString() {
    switch (type) {
      case InternalFriendsGameType.friendsOnly:
        return 'Friends only';
      case InternalFriendsGameType.friendsOfFriends:
        return 'Friends of friends';
    }
  }
}

gameTypeFromString(String value) {
  switch (value) {
    case 'Friends only':
      return InternalFriendsGameType.friendsOnly;
    case 'Friends of friends':
      return InternalFriendsGameType.friendsOfFriends;
  }
}

class MatchCreationInfo {
  final GameMode gameMode;
  final FriendsGameType friendsGameType;
  final String gameId;

  MatchCreationInfo(
      {required this.gameMode,
      required this.friendsGameType,
      required this.gameId});
}

enum WaitingRoomType { solo, team }

class JoinWaitingRoomDto {
  final String username;
  final String waitingRoomId;
  final WaitingRoomType waitingRoomType;
  int? teamNumber;

  JoinWaitingRoomDto(
      {required this.username,
      required this.waitingRoomId,
      required this.waitingRoomType,
      this.teamNumber});

  Map<String, dynamic> toMap() {
    if (teamNumber != null) {
      return {
        'username': username,
        'waitingRoomId': waitingRoomId,
        'type': waitingRoomType.name,
        'teamNumber': teamNumber,
      };
    }
    return {
      'username': username,
      'waitingRoomId': waitingRoomId,
      'waitingRoomType': waitingRoomType.name,
    };
  }
}
