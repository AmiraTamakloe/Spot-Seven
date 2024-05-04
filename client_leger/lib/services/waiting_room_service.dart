import 'package:client_leger/classes/language_constant.dart';
import 'package:client_leger/interfaces/base_waiting_room.dart';
import 'package:client_leger/interfaces/constants/time_limit_room_id.dart';
import 'package:client_leger/interfaces/dto/create_game_session.dart';
import 'package:client_leger/interfaces/game_mode.dart';
import 'package:client_leger/interfaces/match_creation_info.dart';
import 'package:client_leger/interfaces/socket_event.dart';
import 'package:client_leger/services/account_service.dart';
import 'package:client_leger/services/classic_service.dart';
import 'package:client_leger/services/modal_service.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/services/time_limited_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class WaitingRoomService extends GetxController {
  static WaitingRoomService get to => Get.find();
  String playerUsername = '';
  late GameMode gameMode;
  late String userId;
  late String? gameId;

  late RxBool hasFriends;
  late BuildContext currentContext;
  RxList<BaseWaitingRoom> timeLimitWaitingRooms = <BaseWaitingRoom>[].obs;
  RxList<BaseWaitingRoom> classicGameWaitingRooms = <BaseWaitingRoom>[].obs;

  void resetWaitingRoomPage() async {
    final userInfo = await AccountService.to.getAccountInfo();
    playerUsername = userInfo.username;
    userId = userInfo.id!;
    hasFriends = false.obs;

    await setUpEventListeners();
  }

  setGameMode(GameMode gameMode) {
    this.gameMode = gameMode;
    switch (gameMode) {
      case GameMode.classic:
      case GameMode.classicTeam:
        ClassicService.to.setupGame();
        ClassicService.to.setGameMode(gameMode);
        break;
      case GameMode.timeLimited:
      case GameMode.timeLimitedImproved:
        TimeLimitedService.to.setupGame();
        TimeLimitedService.to.setGameMode(gameMode);
        break;
    }
  }

  setUpEventListeners() async {
    SocketService.to.on(SocketEvent.gameSessionCanceled, _showCanceledModal);

    SocketService.to.on(
        SocketEvent.timeLimitWaitingRoomsUpdate, _updateTimeLimitWaitingRooms);
    SocketService.to
        .on(SocketEvent.classicWaitingRoomsUpdate, _updateClassicWaitingRooms);

    SocketService.to.on(SocketEvent.timeLimitWaitingRoomsUpdateFriends,
        _updateTimeLimitWaitingRooms);
    SocketService.to.on(SocketEvent.classicWaitingRoomsUpdateFriends,
        _updateClassicWaitingRooms);
    SocketService.to.on(SocketEvent.verifyFriendships, (dynamic res) {
      bool ans = res as bool;
      hasFriends = ans.obs;
    });
  }

  _showCanceledModal(response) async {
    ModalService.to.close(currentContext);
    await ModalService.to.showInformationModal(
        currentContext, translation(currentContext).canceledGame, response);
  }

  _updateTimeLimitWaitingRooms(waitingRooms) {
    timeLimitWaitingRooms.clear();
    for (var waitingRoom in waitingRooms) {
      BaseWaitingRoom baseWaitingRoom = BaseWaitingRoom.mapToType(waitingRoom);
      if (isUserAllowedInRoom(baseWaitingRoom) &&
          baseWaitingRoom.gameMode == gameMode) {
        BaseWaitingRoom baseWaitingRoom;
        if (waitingRoom['gameMode'] == GameMode.classicTeam.name) {
          baseWaitingRoom = ClassicTeamWaitingRoom.mapToType(waitingRoom);
        } else {
          baseWaitingRoom = BaseWaitingRoom.mapToType(waitingRoom);
        }
        if (baseWaitingRoom.gameMode == gameMode) {
          timeLimitWaitingRooms.add(baseWaitingRoom);
        }
      }
    }
  }

  _updateClassicWaitingRooms(updatedGameWaitingRooms) {
    if (gameId == updatedGameWaitingRooms['gameId']) {
      classicGameWaitingRooms.clear();

      for (var updatedWaitingRoom in updatedGameWaitingRooms['rooms']) {
        final baseWaitingRoom = BaseWaitingRoom.mapToType(updatedWaitingRoom);
        if (isUserAllowedInRoom(baseWaitingRoom) &&
            gameMode == baseWaitingRoom.gameMode) {
          BaseWaitingRoom waitingRoom;
          if (updatedWaitingRoom['gameMode'] == GameMode.classicTeam.name) {
            waitingRoom = ClassicTeamWaitingRoom.mapToType(updatedWaitingRoom);
          } else {
            waitingRoom = BaseWaitingRoom.mapToType(updatedWaitingRoom);
          }
          if (baseWaitingRoom.gameMode == gameMode) {
            classicGameWaitingRooms.add(waitingRoom);
          }
        }
      }
    }
  }

  createClassicWaitingRoom(GameMode gameMode, String gameId,
      [FriendsGameType? friendsGameType]) {
    final createClassicGameSessionDto = CreateClassicGameSessionDto(
        gameId: gameId,
        gameMode: gameMode,
        username: playerUsername,
        friendsGameType: friendsGameType);
    SocketService.to
        .send(SocketEvent.startWaitingRoom, createClassicGameSessionDto);
  }

  createTimeLimitedWaitingRoom(GameMode gameMode,
      [FriendsGameType? friendsGameType]) {
    final createLimitedGameSessionDto = CreateTimeLimitedGameSessionDto(
        gameMode: gameMode,
        username: playerUsername,
        friendsGameType: friendsGameType);
    SocketService.to
        .send(SocketEvent.startWaitingRoom, createLimitedGameSessionDto);
  }

  joinWaitingRoom(String waitingRoomId, [BuildContext? context]) async {
    if (gameMode == GameMode.classicTeam) {
      int teamNumber = await ModalService.to
          .showTeamSelection(context!, "Quelle équipe voulez-vous rejoindre ?");
      final JoinWaitingRoomDto joinWaitingRoomDto = JoinWaitingRoomDto(
          username: playerUsername,
          waitingRoomId: waitingRoomId,
          waitingRoomType: WaitingRoomType.team,
          teamNumber: teamNumber);
      SocketService.to.send(SocketEvent.joinWaitingRoom, joinWaitingRoomDto);
      return;
    }
    final JoinWaitingRoomDto joinWaitingRoomDto = JoinWaitingRoomDto(
        username: playerUsername,
        waitingRoomId: waitingRoomId,
        waitingRoomType: WaitingRoomType.solo);
    SocketService.to.send(SocketEvent.joinWaitingRoom, joinWaitingRoomDto);
  }

  launchGame() {
    SocketService.to.send(SocketEvent.launchGameSession);
  }

  cancelWaitingRoom([String? gameId]) async {
    if (_isGameModeTimeLimit(gameId)) {
      await SocketService.to.send(SocketEvent.cancelWaitingRoom);
    } else {
      await SocketService.to.send(SocketEvent.cancelWaitingRoom, gameId);
    }
  }

  leaveWaitingRoom() async {
    await SocketService.to.send(SocketEvent.playerLeftWaitingRoom);
  }

  fetchWaitingRooms(String currentGameId) async {
    await SocketService.to.send(SocketEvent.fetchWaitingRooms, currentGameId);
  }

  _isGameModeTimeLimit(dynamic gameId) {
    return gameId == null || gameId == TIME_LIMIT_ID || gameId == '';
  }

  isGameModeTimeLimited(GameMode gameMode) {
    return gameMode == GameMode.timeLimited ||
        gameMode == GameMode.timeLimitedImproved;
  }

  isPlayerTheCreator(BaseWaitingRoom waitingRoom) {
    return waitingRoom.creator.username == playerUsername;
  }

  bool isUserAllowedInRoom(BaseWaitingRoom waitingRoom) {
    if (waitingRoom.friendsGameType == null) {
      return true;
    } else if (waitingRoom.friendsUserIdAllowed!.contains(userId) ||
        waitingRoom.creator.username == playerUsername) {
      return true;
    }
    return false;
  }

  bool isPlayerInWaitingRoom() {
    for (final waitingRoom in timeLimitWaitingRooms) {
      if (waitingRoom.creator == playerUsername) {
        return true;
      }
      for (final player in waitingRoom.waitingPlayers) {
        if (player.username == playerUsername) {
          return true;
        }
      }
    }
    for (final waitingRoom in classicGameWaitingRooms) {
      if (waitingRoom.creator == playerUsername) {
        return true;
      }
      for (final player in waitingRoom.waitingPlayers) {
        if (player.username == playerUsername) {
          return true;
        }
      }
    }
    return false;
  }
}
