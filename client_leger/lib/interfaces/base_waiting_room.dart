import 'package:client_leger/interfaces/game.dart';
import 'package:client_leger/interfaces/game_mode.dart';
import 'package:client_leger/interfaces/match_creation_info.dart';

import 'player.dart';
import 'session_type.dart';
import 'waiting_room_status.dart';

getSessionTypeFromInt(int intValue) {
  if (intValue == 0) return SessionType.classic;
  return SessionType.timeLimited;
}

getRoomStatusFromString(String value) {
  switch (value) {
    case 'created':
      return WaitingRoomStatus.created;
    case 'joined':
      return WaitingRoomStatus.joined;
    case 'waiting':
      return WaitingRoomStatus.waiting;
    case 'full':
      return WaitingRoomStatus.full;
  }
}

getGameModeFromString(String value) {
  switch (value) {
    case 'classic':
      return GameMode.classic;
    case 'classicTeam':
      return GameMode.classicTeam;
    case 'timeLimited':
      return GameMode.timeLimited;
    case 'timeLimitedImproved':
      return GameMode.timeLimitedImproved;
  }
}

class BaseWaitingRoom {
  String id;
  Player creator;
  List<Player> waitingPlayers;
  SessionType sessionType;
  WaitingRoomStatus joinState;
  GameMode gameMode;
  FriendsGameType? friendsGameType;
  List<String>? friendsUserIdAllowed;

  BaseWaitingRoom({
    required this.id,
    required this.creator,
    required this.waitingPlayers,
    required this.sessionType,
    required this.joinState,
    required this.gameMode,
    this.friendsGameType,
    this.friendsUserIdAllowed,
  });

  factory BaseWaitingRoom.mapToType(Map<String, dynamic> map) {
    return switch (map) {
      {
        'id': String id,
        'creator': dynamic creator,
        'waitingPlayers': List<dynamic> waitingPlayers,
        'sessionType': dynamic sessionType,
        'joinState': dynamic joinState,
        'gameMode': dynamic gameMode,
      } =>
        BaseWaitingRoom(
            id: id,
            creator: Player.mapToType(creator),
            waitingPlayers: waitingPlayers
                .map((player) =>
                    Player.mapToType(player as Map<String, dynamic>))
                .toList(),
            sessionType: getSessionTypeFromInt(sessionType),
            joinState: getRoomStatusFromString(joinState),
            gameMode: getGameModeFromString(gameMode),
            friendsGameType: map['friendsGameType'] != null
                ? FriendsGameType(gameTypeFromString(map['friendsGameType']))
                : null,
            friendsUserIdAllowed:
                (map['friendsUserIdAllowed'] as List<dynamic>?)
                    ?.map((e) => e as String)
                    .toList()),
      _ => throw const FormatException('Cannot construct BaseWaitingRoom.'),
    };
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'creator': creator.toJson(),
      'waitingPlayers':
          waitingPlayers.map((player) => player.toJson()).toList(),
      'sessionType': sessionType.index,
      'joinState': joinState.name,
    };
  }
}

class ClassicSoloWaitingRoom extends BaseWaitingRoom {
  final Game game;
  ClassicSoloWaitingRoom({
    required super.id,
    required super.creator,
    required super.waitingPlayers,
    required super.sessionType,
    required super.joinState,
    required super.gameMode,
    required this.game,
  });

  factory ClassicSoloWaitingRoom.mapToType(Map<String, dynamic> map) {
    return switch (map) {
      {
        'id': String id,
        'creator': dynamic creator,
        'waitingPlayers': List<dynamic> waitingPlayers,
        'sessionType': dynamic sessionType,
        'joinState': dynamic joinState,
        'gameMode': dynamic gameMode,
        'game': dynamic game,
      } =>
        ClassicSoloWaitingRoom(
            id: id,
            creator: Player.mapToType(creator),
            waitingPlayers: waitingPlayers
                .map((player) =>
                    Player.mapToType(player as Map<String, dynamic>))
                .toList(),
            sessionType: getSessionTypeFromInt(sessionType),
            joinState: getRoomStatusFromString(joinState),
            gameMode: getGameModeFromString(gameMode),
            game: Game.fromJson(game)),
      _ =>
        throw const FormatException('Cannot construct ClassicSoloWaitingRoom.'),
    };
  }
}

class ClassicTeamWaitingRoom extends BaseWaitingRoom {
  final Game game;
  final List<List<Player>> teams;

  ClassicTeamWaitingRoom({
    required super.id,
    required super.creator,
    required super.waitingPlayers,
    required super.sessionType,
    required super.joinState,
    required super.gameMode,
    required this.game,
    required this.teams,
  });

  factory ClassicTeamWaitingRoom.mapToType(dynamic map) {
    List<List<Player>> teams = [];
    for (var team in map['teams']) {
      List<Player> teamPlayers = [];
      for (var player in team) {
        teamPlayers.add(Player.mapToType(player));
      }
      teams.add(teamPlayers);
    }
    return switch (map) {
      {
        'id': String id,
        'creator': dynamic creator,
        'waitingPlayers': List<dynamic> waitingPlayers,
        'sessionType': dynamic sessionType,
        'joinState': dynamic joinState,
        'gameMode': dynamic gameMode,
        'game': dynamic game,
      } =>
        ClassicTeamWaitingRoom(
            id: id,
            creator: Player.mapToType(creator),
            waitingPlayers: waitingPlayers
                .map((player) =>
                    Player.mapToType(player as Map<String, dynamic>))
                .toList(),
            sessionType: getSessionTypeFromInt(sessionType),
            joinState: getRoomStatusFromString(joinState),
            gameMode: getGameModeFromString(gameMode),
            game: Game.fromJson(game),
            teams: teams),
      _ =>
        throw const FormatException('Cannot construct ClassicSoloWaitingRoom.'),
    };
  }
}
