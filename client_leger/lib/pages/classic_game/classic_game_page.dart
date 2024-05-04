import 'package:client_leger/pages/game.dart';
import 'package:client_leger/services/classic_service.dart';
import 'package:client_leger/services/replay_service.dart';
import 'package:client_leger/services/replay_start_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ClassicGamePage extends GamePage {
  ClassicGamePage({super.key}) : super(Get.find<ClassicService>());

  @override
  State<GamePage> createState() {
    return ClassicGamePageState();
  }
}

class ClassicGamePageState extends GamePageState {
  seeReplay() {
    ReplayService.to.canSaveReplay = true;
    ReplayStartService.to.viewAfterGameReplay();
  }

  @override
  getDialogButtons() {
    return [
      ElevatedButton(
        onPressed: () {
          dispose();
        },
        child: const Text(
          "Retour à l'accueil",
          style: TextStyle(
            fontSize: 20.0,
            color: Colors.black,
            fontFamily: 'Pirata',
          ),
        ),
      ),
      if (!widget.gameService.isObservingPlayer)
        ElevatedButton(
          onPressed: () {
            seeReplay();
          },
          child: const Text(
            "Revoir la partie",
            style: TextStyle(
              fontSize: 20.0,
              color: Colors.black,
              fontFamily: 'Pirata',
            ),
          ),
        ),
    ];
  }
}
