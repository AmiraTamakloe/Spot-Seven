import 'package:client_leger/classes/language_constant.dart';
import 'package:client_leger/interfaces/game_mode.dart';
import 'package:client_leger/interfaces/match_creation_info.dart';
import 'package:client_leger/services/waiting_room_service.dart';
import 'package:client_leger/widgets/top_bar.dart';
import 'package:client_leger/widgets/waiting_room.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class WaitingRoomPage extends StatefulWidget {
  final GameMode gameMode;
  final String gameId;
  final String gameName;

  WaitingRoomPage(this.gameMode, this.gameId, this.gameName, {super.key});

  @override
  State<WaitingRoomPage> createState() => _WaitingRoomPageState();
}

class _WaitingRoomPageState extends State<WaitingRoomPage> {
  @override
  void initState() {
    WaitingRoomService.to.resetWaitingRoomPage();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    WaitingRoomService.to.setGameMode(widget.gameMode);
    WaitingRoomService.to.gameId = widget.gameId;
    WaitingRoomService.to.fetchWaitingRooms(widget.gameId);
    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            TopBar(),
            Column(
              children: [
                if (widget.gameMode == GameMode.timeLimited)
                  Text(
                    translation(context).timeLimitWaitingPage,
                    style: TextStyle(
                      fontSize: 30,
                      fontFamily: 'Pirata',
                      color: Theme.of(context).primaryColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                if (widget.gameMode == GameMode.timeLimitedImproved)
                  Text(
                    translation(context).timeLimitImprovedWaitingPage,
                    style: TextStyle(
                      fontSize: 30,
                      fontFamily: 'Pirata',
                      color: Theme.of(context).primaryColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                if (widget.gameMode == GameMode.classic)
                  Text(
                    translation(context).classicWaitingPage + widget.gameName,
                    style: TextStyle(
                      fontSize: 30,
                      fontFamily: 'Pirata',
                      color: Theme.of(context).primaryColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                if (widget.gameMode == GameMode.classicTeam)
                  Text(
                    translation(context).classicWaitingTeamPage +
                        widget.gameName,
                    style: TextStyle(
                      fontSize: 30,
                      fontFamily: 'Pirata',
                      color: Theme.of(context).primaryColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                const SizedBox(height: 40),
                ElevatedButton.icon(
                  onPressed: () {
                    Get.toNamed('/home');
                  },
                  icon: Icon(Icons.home, color: Theme.of(context).primaryColor),
                  style: ElevatedButton.styleFrom(),
                  label: Text(translation(context).home,
                      style: const TextStyle(
                          color: Colors.white, fontFamily: 'Pirata')),
                ),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    ElevatedButton(
                      onPressed: !WaitingRoomService.to.isPlayerInWaitingRoom()
                          ? () async {
                              if (WaitingRoomService.to
                                  .isGameModeTimeLimited(widget.gameMode)) {
                                await WaitingRoomService.to
                                    .createTimeLimitedWaitingRoom(
                                        widget.gameMode);
                              } else {
                                await WaitingRoomService.to
                                    .createClassicWaitingRoom(
                                        widget.gameMode, widget.gameId);
                              }
                            }
                          : null,
                      style: WaitingRoomService.to.isPlayerInWaitingRoom()
                          ? ElevatedButton.styleFrom(
                              backgroundColor: Colors.grey)
                          : ElevatedButton.styleFrom(),
                      child: Text(
                        "Créer une salle d'attente",
                        style: TextStyle(
                          fontFamily: 'Pirata',
                          color: Theme.of(context).primaryColor,
                        ),
                      ),
                    ),
                    ElevatedButton(
                      onPressed: !WaitingRoomService.to.isPlayerInWaitingRoom()
                          ? () async {
                              if (WaitingRoomService.to
                                  .isGameModeTimeLimited(widget.gameMode)) {
                                await WaitingRoomService.to
                                    .createTimeLimitedWaitingRoom(
                                        widget.gameMode,
                                        FriendsGameType(InternalFriendsGameType
                                            .friendsOnly));
                              } else {
                                await WaitingRoomService.to
                                    .createClassicWaitingRoom(
                                        widget.gameMode,
                                        widget.gameId,
                                        FriendsGameType(InternalFriendsGameType
                                            .friendsOnly));
                              }
                            }
                          : null,
                      style: WaitingRoomService.to.isPlayerInWaitingRoom()
                          ? ElevatedButton.styleFrom(
                              backgroundColor: Colors.grey)
                          : ElevatedButton.styleFrom(),
                      child: Text(
                        translation(context).createFriendsOnly,
                        style: TextStyle(
                          fontFamily: 'Pirata',
                          color: Theme.of(context).primaryColor,
                        ),
                      ),
                    ),
                    ElevatedButton(
                      onPressed: !WaitingRoomService.to.isPlayerInWaitingRoom()
                          ? () async {
                              if (WaitingRoomService.to
                                  .isGameModeTimeLimited(widget.gameMode)) {
                                await WaitingRoomService.to
                                    .createTimeLimitedWaitingRoom(
                                        widget.gameMode,
                                        FriendsGameType(InternalFriendsGameType
                                            .friendsOfFriends));
                              } else {
                                await WaitingRoomService.to
                                    .createClassicWaitingRoom(
                                        widget.gameMode,
                                        widget.gameId,
                                        FriendsGameType(InternalFriendsGameType
                                            .friendsOfFriends));
                              }
                            }
                          : null,
                      style: WaitingRoomService.to.isPlayerInWaitingRoom()
                          ? ElevatedButton.styleFrom(
                              backgroundColor: Colors.grey)
                          : ElevatedButton.styleFrom(),
                      child: Text(
                        translation(context).createFriendsOfFriends,
                        style: TextStyle(
                          fontFamily: 'Pirata',
                          color: Theme.of(context).primaryColor,
                        ),
                      ),
                    ),
                  ],
                ),
                SingleChildScrollView(
                  child: Obx(
                    () => GridView.builder(
                      physics: const ScrollPhysics(),
                      scrollDirection: Axis.vertical,
                      shrinkWrap: true,
                      itemCount: WaitingRoomService.to
                              .isGameModeTimeLimited(widget.gameMode)
                          ? WaitingRoomService.to.timeLimitWaitingRooms.length
                          : WaitingRoomService
                              .to.classicGameWaitingRooms.length,
                      itemBuilder: (_, index) {
                        return WaitingRoomWidget(
                          waitingRoom: WaitingRoomService.to
                                  .isGameModeTimeLimited(widget.gameMode)
                              ? WaitingRoomService
                                  .to.timeLimitWaitingRooms[index]
                              : WaitingRoomService
                                  .to.classicGameWaitingRooms[index],
                          gameMode: widget.gameMode,
                          gameId: widget.gameId,
                        );
                      },
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 30,
                        mainAxisSpacing: 15,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
