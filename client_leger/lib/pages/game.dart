import 'package:client_leger/base-widgets/wrapper_widget.dart';
import 'package:client_leger/classes/language_constant.dart';
import 'package:client_leger/interfaces/game.dart';
import 'package:client_leger/interfaces/image_area.dart';
import 'package:client_leger/pages/game_page/game_canva.dart';
import 'package:client_leger/services/account_service.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/services/replay_service.dart';
import 'package:client_leger/services/time_limited_service.dart';
import 'package:client_leger/services/waiting_room_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

abstract class GamePage extends StatefulWidget {
  final GameService gameService;
  const GamePage(this.gameService, {super.key});

  @override
  State<GamePage> createState() {
    return GamePageState();
  }
}

class TimeLimitedGamePage extends GamePage {
  TimeLimitedGamePage({super.key}) : super(Get.find<TimeLimitedService>());
}

class ReplayGamePage extends GamePage {
  ReplayGamePage({super.key}) : super(Get.find<ReplayService>());
}

class GamePageState extends State<GamePage> {
  getEndGameMessage(EndGameStatus status) {
    if (!widget.gameService.isObservingPlayer) {
      switch (status) {
        case EndGameStatus.win:
          return translation(context).wonGame;
        case EndGameStatus.lose:
          return translation(context).lostGame;
        case EndGameStatus.forfeit:
          return translation(context).forfeit;
      }
    } else {
      return translation(context).observerEnd;
    }
  }

  List<Widget> getDialogButtons() {
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
    ];
  }

  dialogBuilder(BuildContext context, EndGameStatus status) {
    Get.dialog(
      AlertDialog(
        title: Text(getEndGameMessage(status)),
        actions: getDialogButtons(),
      ),
    );
  }

  AbstractGameButtons getGameButtons() {
    return GameButtons(widget.gameService);
  }

  @override
  void dispose() {
    super.dispose();
    Get.offAndToNamed("/home");
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
        future: widget.gameService.getGame(),
        builder: (BuildContext buildContext, AsyncSnapshot<Game> snapshot) {
          if (snapshot.hasData) {
            widget.gameService.isGameEnded().then((value) {
              dialogBuilder(context, value);
            });
            return Scaffold(
              body: Column(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: <Widget>[
                  GameHeader(widget.gameService),
                  GameCanvas(widget.gameService),
                  getGameButtons(),
                ],
              ),
            );
          } else {
            return const WrapperWidget(child: CircularProgressIndicator());
          }
        });
  }
}

class GameHeader extends StatelessWidget {
  final GameService gameService;

  const GameHeader(this.gameService, {super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        GameHeaderName(gameService.game!.name),
        GameHeaderInfo(gameService),
      ],
    );
  }
}

class GameHeaderName extends StatelessWidget {
  final String gameName;
  const GameHeaderName(this.gameName, {super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        Text(
          gameName,
          style: TextStyle(
            fontSize: 30.0,
            color: Theme.of(context).primaryColor,
            fontFamily: 'Pirata',
          ),
        ),
      ],
    );
  }
}

// ignore: must_be_immutable
class GameHeaderInfo extends StatefulWidget {
  GameService gameService;
  late int differencesFound;
  late int timer = 0;

  GameHeaderInfo(this.gameService, {super.key}) {
    differencesFound = gameService.differencesFoundObs.value;
    timer = gameService.timerValue.value;
  }

  @override
  State<GameHeaderInfo> createState() => _GameHeaderInfoState();
}

class _GameHeaderInfoState extends State<GameHeaderInfo> {
  @override
  void initState() {
    super.initState();
    widget.gameService.differencesFoundObs.listen((int value) {
      setState(() {
        widget.differencesFound = value;
      });
    });
    widget.gameService.timerValue.listen((int value) {
      setState(() {
        widget.timer = value;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        if (!widget.gameService.isObservingPlayer)
          Text(
            "${AccountService.to.username} (${widget.differencesFound} / ${widget.gameService.game!.differencesCount})",
            style: TextStyle(
              fontSize: 20.0,
              color: Theme.of(context).primaryColor,
              fontFamily: 'Pirata',
            ),
          ),
        if (widget.gameService.isObservingPlayer &&
            widget.gameService.gameInfo.otherPlayersUsername != null)
          Text(
            widget.gameService.gameInfo.otherPlayersUsername!.join(', '),
            style: TextStyle(
              fontFamily: 'Pirata',
              fontSize: 15,
              color: Theme.of(context).primaryColor,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        if (widget.gameService.isObservingPlayer)
          Container(
            width: 175,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.blue, width: 3),
              color: Color.fromRGBO(187, 229, 255, 1),
            ),
            padding: EdgeInsets.all(15),
            child: Column(
              children: [
                Text(
                  '👀 ' + translation(context).observerMode,
                  style: const TextStyle(
                    fontFamily: 'Pirata',
                    fontSize: 15,
                    color: Colors.black,
                  ),
                ),
              ],
            ),
          ),
        Text(
          "${widget.timer}",
          style: TextStyle(
            fontSize: 20.0,
            color: Theme.of(context).primaryColor,
            fontFamily: 'Pirata',
          ),
        ),
      ],
    );
  }
}

class GameCanvas extends StatelessWidget {
  final GameService gameService;
  const GameCanvas(this.gameService, {super.key});

  @override
  Widget build(BuildContext context) {
    Future<bool> isModifiedImageSet = gameService.setModifiedGameImage();

    if (gameService.isObservingPlayer) {
      isModifiedImageSet.then((_) {
        return gameService.initializeObserverState();
      });
    }

    return Center(
        child: Wrap(
      children: [
        FutureBuilder(
            future: gameService.setOriginalGameImage(),
            builder: (BuildContext context, AsyncSnapshot<bool> snapshot) {
              Widget gameCanva;
              if (snapshot.hasData) {
                gameCanva = GameCanva(
                    gameService.originalCanvasImage,
                    ImageArea.original,
                    gameService.originalCanvasBlink,
                    gameService.originalErrorNotifier,
                    gameService);
              } else {
                gameCanva = const CircularProgressIndicator();
              }
              return gameCanva;
            }),
        FutureBuilder(
            future: isModifiedImageSet,
            builder: (BuildContext context, AsyncSnapshot<bool> snapshot) {
              Widget gameCanva;
              if (snapshot.hasData) {
                gameCanva = GameCanva(
                    gameService.modifiedCanvasImage,
                    ImageArea.modified,
                    gameService.modifiedCanvasBlink,
                    gameService.modifiedErrorNotifier,
                    gameService);
              } else {
                gameCanva = const CircularProgressIndicator();
              }
              return gameCanva;
            }),
      ],
    ));
  }
}

abstract class AbstractGameButtons extends StatelessWidget {
  final GameService gameService;
  const AbstractGameButtons(this.gameService, {super.key});

  List<Widget> getButtons(BuildContext context);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: getButtons(context),
    );
  }
}

class GameButtons extends AbstractGameButtons {
  const GameButtons(super.gameService, {super.key});

  @override
  List<Widget> getButtons(context) {
    return [
      ElevatedButton(
        onPressed: () {
          gameService.giveUp();
        },
        child: const Text(
          "Abandonner la partie ",
          style: TextStyle(
              fontSize: 20.0, fontFamily: 'Pirata', color: Colors.black),
        ),
      ),
      ElevatedButton(
        onPressed: () {
          print("Hint button pressed");
        },
        child: const Text(
          "Indice",
          style: TextStyle(
              fontSize: 20.0, fontFamily: 'Pirata', color: Colors.black),
        ),
      ),
      Container(
        width: 175,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.blue, width: 3),
          color: Color.fromRGBO(187, 229, 255, 1),
        ),
        padding: EdgeInsets.all(15),
        child: Column(
          children: [
            Text(
              translation(context).informations,
              style: const TextStyle(
                fontFamily: 'Pirata',
                fontSize: 20,
                color: Colors.black,
              ),
            ),
            Text(
              // TODO: replace with difficulty
              translation(context).difficulty,
              style: const TextStyle(
                fontFamily: 'Pirata',
                fontSize: 15,
                color: Colors.black,
              ),
            ),
            Text(
              translation(context).hintsLeft,
              style: TextStyle(
                fontFamily: 'Pirata',
                fontSize: 15,
                color: Colors.black,
              ),
            ),
            if (!gameService.isObservingPlayer)
              Text(
                gameService.areCurrentObservers()
                    ? (translation(context).numberOfObservers) +
                        gameService.observerGameSession!.currentObservers.length
                            .toString()
                    : translation(context).noObserverPresent,
                style: TextStyle(
                  fontFamily: 'Pirata',
                  fontSize: 15,
                  color: Colors.black,
                ),
              ),
          ],
        ),
      ),
    ];
  }
}
