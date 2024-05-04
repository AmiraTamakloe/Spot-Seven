import 'package:client_leger/bindings/game-bindings.dart';
import 'package:client_leger/interfaces/replay_speed.dart';
import 'package:client_leger/pages/classic_game/classic_game_page.dart';
import 'package:client_leger/pages/game.dart';
import 'package:client_leger/services/replay_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ReplayGamePage extends GamePage {
  ReplayGamePage({super.key}) : super(Get.find<ReplayService>());

  @override
  State<GamePage> createState() {
    return _ReplayGamePageState();
  }
}

class _ReplayGamePageState extends ClassicGamePageState {
  @override
  seeReplay() {
    // Removes the modal
    Navigator.of(context, rootNavigator: true).pop();
    ReplayService.to.setupGame();
    Get.to(ReplayGamePage(),
        binding: ReplayGameBindings(), preventDuplicates: false);
  }

  @override
  AbstractGameButtons getGameButtons() {
    return ReplayGameButtons(widget.gameService as ReplayService);
  }
}

class ReplayGameButtons extends AbstractGameButtons {
  const ReplayGameButtons(ReplayService super.gameService, {super.key});

  @override
  List<Widget> getButtons(context) {
    return [
      Column(
        children: [
          Row(
            children: [
              ElevatedButton(
                onPressed: () {
                  (gameService as ReplayService)
                      .changeReplaySpeed(Speed.timesOne);
                },
                child: const Text(
                  "x1",
                  style: TextStyle(
                      fontSize: 20.0,
                      fontFamily: 'Pirata',
                      color: Colors.black),
                ),
              ),
              ElevatedButton(
                onPressed: () {
                  (gameService as ReplayService)
                      .changeReplaySpeed(Speed.timeTwo);
                },
                child: const Text(
                  "x2",
                  style: TextStyle(
                      fontSize: 20.0,
                      fontFamily: 'Pirata',
                      color: Colors.black),
                ),
              ),
              ElevatedButton(
                onPressed: () {
                  (gameService as ReplayService)
                      .changeReplaySpeed(Speed.timeFour);
                },
                child: const Text(
                  "x4",
                  style: TextStyle(
                      fontSize: 20.0,
                      fontFamily: 'Pirata',
                      color: Colors.black),
                ),
              ),
              ElevatedButton(
                onPressed: () {
                  if ((gameService as ReplayService).isPaused) {
                    (gameService as ReplayService).resume();
                  } else {
                    (gameService as ReplayService).pause();
                  }
                },
                child: Text(
                  (gameService as ReplayService).isPaused ? "Resume" : "Pause",
                  style: const TextStyle(
                      fontSize: 20.0,
                      fontFamily: 'Pirata',
                      color: Colors.black),
                ),
              )
            ],
          ),
          Row(
            children: [
              ElevatedButton(
                onPressed: () {
                  gameService.giveUp();
                },
                child: const Text(
                  "Accueil",
                  style: TextStyle(
                      fontSize: 20.0,
                      fontFamily: 'Pirata',
                      color: Colors.black),
                ),
              ),
              if ((gameService as ReplayService).canSaveReplay)
                ElevatedButton(
                  onPressed: () async {
                    (gameService as ReplayService).canSaveReplay = false;
                    await (gameService as ReplayService).saveAfterGameReplay();
                  },
                  child: const Text(
                    "Sauvegarder",
                    style: TextStyle(
                        fontSize: 20.0,
                        fontFamily: 'Pirata',
                        color: Colors.black),
                  ),
                ),
            ],
          ),
        ],
      ),
    ];
  }
}
