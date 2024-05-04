import 'package:client_leger/classes/language_constant.dart';
import 'package:client_leger/interfaces/base_waiting_room.dart';
import 'package:client_leger/interfaces/game_mode.dart';
import 'package:client_leger/interfaces/match_creation_info.dart';
import 'package:client_leger/interfaces/player.dart';
import 'package:client_leger/interfaces/socket_event.dart';
import 'package:client_leger/interfaces/waiting_room_status.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/services/waiting_room_service.dart';
import 'package:flutter/material.dart';

class WaitingRoomWidget extends StatefulWidget {
  final BaseWaitingRoom waitingRoom;
  final GameMode gameMode;
  final String gameId;

  const WaitingRoomWidget(
      {super.key,
      required this.waitingRoom,
      required this.gameMode,
      required this.gameId});

  @override
  State<WaitingRoomWidget> createState() => _WaitingRoomWidgetState();
}

class _WaitingRoomWidgetState extends State<WaitingRoomWidget> {
  late String creatorName;

  @override
  void initState() {
    super.initState();
    creatorName = widget.waitingRoom.creator.username;

    setUpEventListeners();
  }

  setUpEventListeners() {
    SocketService.to
        .on(SocketEvent.waitingRoomStateUpdate, _updateWaitingRoomState);
  }

  _updateWaitingRoomState(updateInfo) {
    if (widget.waitingRoom.id == updateInfo['waitingRoomId']) {
      widget.waitingRoom.joinState =
          stringToWaitingStatus(updateInfo['updatedState']);
    }
  }

  _isRoomJoinable() {
    return widget.waitingRoom.joinState != WaitingRoomStatus.full;
  }

  _isRoomLaunchable() {
    return widget.waitingRoom.waitingPlayers.isNotEmpty;
  }

  _isInWaitingRoom() {
    for (Player player in widget.waitingRoom.waitingPlayers) {
      if (player.username == WaitingRoomService.to.playerUsername) return true;
    }
    return false;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      alignment: Alignment.center,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16.0),
        border: Border.all(color: const Color.fromARGB(255, 80, 79, 79)),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.5),
            spreadRadius: 5,
            blurRadius: 7,
            offset: const Offset(0, 3),
          ),
        ],
        color: Colors.lightBlue[100],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            WaitingRoomService.to.isPlayerTheCreator(widget.waitingRoom)
                ? translation(context).myRoomName
                : translation(context).creatorRoomName,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 20,
              fontFamily: 'Pirata',
              color: Colors.black,
            ),
          ),
          Container(
            padding: const EdgeInsets.all(8.0),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16.0),
              border: Border.all(color: const Color.fromARGB(255, 14, 14, 14)),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.5),
                  spreadRadius: 2,
                  blurRadius: 1,
                  offset: const Offset(0, 3),
                ),
              ],
              color: const Color.fromARGB(255, 49, 187, 187),
            ),
            child: Text(
              creatorName,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 20,
                fontFamily: 'Pirata',
                color: Colors.black,
              ),
            ),
          ),
          widget.waitingRoom.friendsGameType != null
              ? Text(
                  widget.waitingRoom.friendsGameType!.type ==
                          InternalFriendsGameType.friendsOnly
                      ? translation(context).friendsOnly
                      : translation(context).friendsOfFriendsOnly,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 20,
                    fontFamily: 'Pirata',
                    color: Colors.black,
                  ),
                )
              : const SizedBox(
                  height: 10,
                ),
          Text(
            translation(context).players,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 20,
              fontFamily: 'Pirata',
              color: Colors.black,
            ),
          ),
          Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16.0),
                border:
                    Border.all(color: const Color.fromARGB(255, 14, 14, 14)),
              ),
              padding: const EdgeInsets.all(8.0),
              child: Center(
                child: Row(
                  children: [TeamWidget(waitingRoom: widget.waitingRoom)],
                ),
              )),
          WaitingRoomButtons(
              isRoomJoinable: _isRoomJoinable(),
              waitingRoomId: widget.waitingRoom.id,
              isCreator:
                  WaitingRoomService.to.isPlayerTheCreator(widget.waitingRoom),
              gameId: widget.gameId,
              isLaunchable: _isRoomLaunchable(),
              isInRoom: _isInWaitingRoom())
        ],
      ),
    );
  }
}

class WaitingRoomButtons extends StatelessWidget {
  final bool isRoomJoinable;
  final bool isCreator;
  final String waitingRoomId;
  final String gameId;
  final bool isLaunchable;
  final bool isInRoom;

  const WaitingRoomButtons(
      {super.key,
      required this.isRoomJoinable,
      required this.waitingRoomId,
      required this.isCreator,
      required this.gameId,
      required this.isLaunchable,
      required this.isInRoom});

  @override
  Widget build(BuildContext context) {
    if (!isCreator) {
      if (isInRoom) {
        return ElevatedButton(
            onPressed: () => WaitingRoomService.to.leaveWaitingRoom(),
            style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF07487C)),
            child: Text(translation(context).leaveRoom,
                style: const TextStyle(
                    color: Colors.white, fontFamily: 'Pirata')));
      }
      return ElevatedButton(
        onPressed: isRoomJoinable
            ? () async {
                await WaitingRoomService.to
                    .joinWaitingRoom(waitingRoomId, context);
              }
            : null,
        style: isRoomJoinable
            ? ElevatedButton.styleFrom(backgroundColor: const Color(0xFF07487C))
            : ElevatedButton.styleFrom(
                backgroundColor: const Color.fromARGB(255, 108, 108, 109)),
        child: isRoomJoinable
            ? Text(translation(context).joinWaitingRoom,
                style:
                    const TextStyle(color: Colors.white, fontFamily: 'Pirata'))
            : Text(translation(context).waitingRoomFull,
                style: const TextStyle(
                    color: Color.fromARGB(255, 15, 14, 14),
                    fontFamily: 'Pirata')),
      );
    }
    return Center(
        child: Column(
      children: [
        ElevatedButton(
            onPressed: () async {
              if (!isLaunchable) {
                return;
              }
              WaitingRoomService.to.launchGame();
            },
            style: isLaunchable
                ? ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF07487C))
                : ElevatedButton.styleFrom(
                    backgroundColor: const Color.fromARGB(255, 80, 80, 83)),
            child: Text(translation(context).launchGame,
                style: const TextStyle(
                    color: Colors.white, fontFamily: 'Pirata'))),
        const SizedBox(height: 10),
        ElevatedButton(
            onPressed: () async {
              await WaitingRoomService.to.cancelWaitingRoom(gameId);
            },
            style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF07487C)),
            child: Text(translation(context).cancelWaitingRoom,
                style: const TextStyle(
                    color: Colors.white, fontFamily: 'Pirata'))),
      ],
    ));
  }
}

class TeamWidget extends StatelessWidget {
  final BaseWaitingRoom waitingRoom;
  const TeamWidget({super.key, required this.waitingRoom});

  @override
  Widget build(BuildContext context) {
    if (waitingRoom.gameMode == GameMode.classicTeam) {
      final teamWaitingRoom = waitingRoom as ClassicTeamWaitingRoom;
      return Expanded(
          child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: teamWaitingRoom.teams.map((team) {
          return Container(
              padding: const EdgeInsets.all(8.0),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16.0),
                border:
                    Border.all(color: const Color.fromARGB(255, 14, 14, 14)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.5),
                    spreadRadius: 2,
                    blurRadius: 1,
                    offset: const Offset(0, 3),
                  ),
                ],
                color: const Color.fromARGB(255, 49, 187, 187),
              ),
              alignment: Alignment.center,
              child: Expanded(
                  child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("Team ${teamWaitingRoom.teams.indexOf(team) + 1}"),
                  ...team.map((player) => Text(
                        player.username,
                        style: const TextStyle(
                            fontSize: 16.0, fontFamily: 'Pirata'),
                      )),
                ],
              )));
        }).toList(),
      ));
    }
    return Column(
        children: waitingRoom.waitingPlayers.map((player) {
      return Container(
        padding: const EdgeInsets.all(8.0),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16.0),
          border: Border.all(color: const Color.fromARGB(255, 14, 14, 14)),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.5),
              spreadRadius: 2,
              blurRadius: 1,
              offset: const Offset(0, 3),
            ),
          ],
          color: const Color.fromARGB(255, 49, 187, 187),
        ),
        alignment: Alignment.center,
        child: Text(
          player.username,
          style: const TextStyle(fontSize: 16.0, fontFamily: 'Pirata'),
        ),
      );
    }).toList());
  }
}
