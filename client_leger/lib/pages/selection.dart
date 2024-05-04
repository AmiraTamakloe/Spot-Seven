import 'package:carousel_slider/carousel_slider.dart';
import 'package:client_leger/bindings/waiting_room_bindings.dart';
import 'package:client_leger/classes/language_constant.dart';
import 'package:client_leger/environments/environment.dart';
import 'package:client_leger/interfaces/game.dart';
import 'package:client_leger/interfaces/game_mode.dart';
import 'package:client_leger/interfaces/high_score.dart';
import 'package:client_leger/pages/waiting_room_page.dart';
import 'package:client_leger/services/game_selection_service.dart';
import 'package:flutter/material.dart';
import 'package:get/route_manager.dart';

class SelectionPage extends StatefulWidget {
  const SelectionPage({super.key});
  @override
  State<SelectionPage> createState() => _SelectionPageState();
}

class _SelectionPageState extends State<SelectionPage> {
  bool loaded = false;

  SelectionService selectionService = SelectionService();
  @override
  void initState() {
    super.initState();
    gamesGetter();
  }

  Future<void> gamesGetter() async {
    await selectionService.getGames();
    setState(() {
      loaded = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (loaded) {
      return MainBody(selectionService.games);
    } else {
      return const CircularProgressIndicator();
    }
  }
}

class MainBody extends StatelessWidget {
  final List<Game> games;

  const MainBody(this.games, {super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        body: Center(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.only(top: 135.0, bottom: 40),
                child: CarouselSlider.builder(
                  itemCount: games.length,
                  itemBuilder: (context, index, realIndex) {
                    final difficulty = games[index].difficulty;
                    final gameName = games[index].name;
                    final scores = [
                      games[index].soloHighScores,
                      games[index].duelHighScores
                    ];
                    final gameImage = games[index].originalImageFilename;
                    final id = games[index].id;
                    return buildGameCard(
                        difficulty, gameName, scores, gameImage, id, context);
                  },
                  options: CarouselOptions(
                    height: 480,
                  ),
                ),
              ),
              ElevatedButton(
                onPressed: () {
                  Get.toNamed('/home');
                },
                style: ElevatedButton.styleFrom(
                  textStyle: const TextStyle(fontFamily: 'Pirata'),
                  backgroundColor: Colors.white,
                ),
                child:
                    const Text("HOME", style: TextStyle(color: Colors.black)),
              ),
            ],
          ),
        ));
  }

  Widget buildGameCard(
          String difficulty,
          String gameName,
          List<List<HighScore>> scores,
          String gameImage,
          String gameId,
          BuildContext context) =>
      Container(
        margin: const EdgeInsets.symmetric(horizontal: 10),
        width: 900,
        decoration: BoxDecoration(
            color: Theme.of(context).inputDecorationTheme.fillColor,
            borderRadius: BorderRadius.all(Radius.circular(20))),
        child: Column(
          children: <Widget>[
            HeaderGame(difficulty: difficulty, gameName: gameName),
            Row(
              children: [
                GameOptions(
                  gameImage: gameImage,
                  gameId: gameId,
                  gameName: gameName,
                ),
                ScoresGame(scores: scores),
              ],
            )
          ],
        ),
      );
}

class GameOptions extends StatelessWidget {
  final String gameImage;
  final String gameName;
  final String gameId;
  final String baseUrl = environment['uploadUrl'];
  GameOptions({
    super.key,
    required this.gameImage,
    required this.gameId,
    required this.gameName,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.only(top: 30.0),
        child: Column(
          children: [
            Image.network(
              '$baseUrl/$gameImage',
              height: 320,
              width: 500,
            ),
            GameButtons(gameId: gameId, gameName: gameName),
          ],
        ),
      ),
    );
  }
}

class ScoresGame extends StatelessWidget {
  final List<List<HighScore>> scores;

  const ScoresGame({
    super.key,
    required this.scores,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Container(
        height: MediaQuery.of(context).size.height / 2.5,
        width: MediaQuery.of(context).size.width / 5,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
          color: Theme.of(context).appBarTheme.backgroundColor,
        ),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.only(top: 20.0),
              child: Text(
                translation(context).topScores,
                style: TextStyle(color: Theme.of(context).primaryColor),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: SizedBox(
                height: MediaQuery.of(context).size.height / 4,
                child: Row(
                  children: [
                    Expanded(child: TopScores(scores: scores[0])),
                    VerticalDivider(
                      width: 50,
                      thickness: 1,
                      indent: 0,
                      endIndent: 0,
                      color: Theme.of(context).primaryColor,
                    ),
                    Expanded(child: TopScores(scores: scores[1])),
                  ],
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}

class TopScores extends StatelessWidget {
  final List<HighScore> scores;
  const TopScores({
    super.key,
    required this.scores,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          '${scores[0].playerName} : ${scores[0].time}',
          style: TextStyle(color: Theme.of(context).primaryColor),
          textAlign: TextAlign.center,
        ),
        Text(
          '${scores[1].playerName} : ${scores[1].time}',
          style: TextStyle(color: Theme.of(context).primaryColor),
          textAlign: TextAlign.center,
        ),
        Text(
          '${scores[2].playerName} : ${scores[2].time}',
          style: TextStyle(color: Theme.of(context).primaryColor),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

class HeaderGame extends StatelessWidget {
  final String? gameName;
  final String? difficulty;
  const HeaderGame({super.key, this.difficulty, this.gameName});
  @override
  Widget build(BuildContext context) {
    return Row(
      children: <Widget>[
        Padding(
          padding: const EdgeInsets.only(left: 33.0, top: 22.0),
          child: RichText(
            text: TextSpan(
              style: DefaultTextStyle.of(context).style,
              children: <TextSpan>[
                TextSpan(
                  text: '$gameName',
                  style: const TextStyle(color: Colors.white, fontSize: 20),
                ),
              ],
            ),
          ),
        ),
        const Spacer(),
        Padding(
          padding: const EdgeInsets.only(right: 33.0, top: 22.0),
          child: RichText(
            text: TextSpan(
              style: DefaultTextStyle.of(context).style,
              children: <TextSpan>[
                TextSpan(
                  text: '$difficulty',
                  style: const TextStyle(color: Colors.white, fontSize: 20),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class GameButtons extends StatelessWidget {
  final String gameId;
  final String gameName;
  const GameButtons({
    super.key,
    required this.gameId,
    required this.gameName,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
        padding: const EdgeInsets.only(top: 30.0, left: 65, right: 65),
        child: Row(
          children: [
            ElevatedButton(
              onPressed: () {
                Get.to(
                    () => WaitingRoomPage(GameMode.classic, gameId, gameName),
                    binding: WaitingRoomBinding());
              },
              style: ElevatedButton.styleFrom(
                textStyle: const TextStyle(fontFamily: 'Pirata'),
                backgroundColor: Colors.white,
              ),
              child: Text(translation(context).classicPlay,
                  style: const TextStyle(color: Colors.black)),
            ),
            const Spacer(),
            ElevatedButton(
              onPressed: () {
                Get.to(
                    () =>
                        WaitingRoomPage(GameMode.classicTeam, gameId, gameName),
                    binding: WaitingRoomBinding());
              },
              style: ElevatedButton.styleFrom(
                textStyle: const TextStyle(fontFamily: 'Pirata'),
                backgroundColor: Colors.white,
              ),
              child: Text(translation(context).multiplayerPlay,
                  style: const TextStyle(color: Colors.black)),
            ),
          ],
        ));
  }

  GameMode getGameMode(BuildContext context) {
    final settings = ModalRoute.of(context)?.settings;
    if (settings == null) {
      throw const FormatException(
          'Failed to get Game Mode from ModalRoute settings.');
    }

    final uri = Uri.parse(settings.name ?? '');
    final gameModeSegment = uri.pathSegments.last;
    final gameModeValue = parseGameMode(gameModeSegment);
    return gameModeValue;
  }
}
