import 'package:client_leger/base-widgets/wrapper_widget.dart';
import 'package:client_leger/bindings/observer_bindings.dart';
import 'package:client_leger/classes/language_constant.dart';
import 'package:client_leger/pages/observer_selection_page.dart';
import 'package:client_leger/services/game_selection_service.dart';
import 'package:client_leger/services/modal_service.dart';
import 'package:client_leger/widgets/top_bar.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  bool isDarkMode = false;

  final lightModeBackground = [
    const Color(0xFFB0DFE8),
    const Color(0xFFDDE7E9),
    const Color(0xFF11CFCF)
  ];
  final darkModeBackground = [
    const Color.fromARGB(255, 2, 44, 53),
    const Color.fromARGB(255, 158, 159, 230),
    const Color.fromARGB(255, 15, 0, 102)
  ];
  List<String> members = [
    'Amira',
    'Elena',
    'Faneva',
    'Jacob',
    'Murielle',
    'Stefan'
  ];
  bool loaded = false;

  SelectionService selectionService = SelectionService();
  @override
  void initState() {
    super.initState();
    gamesGetter();
  }

  Future<void> gamesGetter() async {
    await selectionService.getGames();
    loaded = true;
  }

  @override
  Widget build(BuildContext context) {
    return WrapperWidget(
      child: Scaffold(
        body: Container(
          height: MediaQuery.of(context).size.height,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12.5),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: Theme.of(context).brightness == Brightness.light
                  ? lightModeBackground
                  : darkModeBackground,
              stops: const [0.0, 0.5, 1.0],
            ),
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TopBar(),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 20.0, vertical: 10.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const SizedBox(width: 20.0),
                      Expanded(
                        child: Text(
                          '# 103',
                          textAlign: TextAlign.start,
                          style: TextStyle(
                            fontSize: 50.0,
                            fontFamily: 'Pirata',
                            color: Theme.of(context).primaryColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 20.0, vertical: 10.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Expanded(
                        child: Text(
                          'SPOT\nSEVEN',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 90.0,
                            fontFamily: 'Pirata',
                            color: Theme.of(context).primaryColor,
                          ),
                        ),
                      ),
                      Expanded(
                        child: Image.asset(
                          './assets/logo/logo.png',
                          height: 300,
                          width: 300,
                        ),
                      ),
                    ],
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 80),
                        child: ElevatedButton(
                          onPressed: () {
                            if (loaded) {
                              if (selectionService.games.isEmpty) {
                                selectionService.getGames().then((value) => {
                                      if (selectionService.games.isEmpty)
                                        ModalService.to.showInformationModal(
                                            context,
                                            translation(context)
                                                .noGamesAvailable,
                                            translation(context).goCreate)
                                    });
                              } else {
                                Get.toNamed('/selection');
                              }
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            fixedSize: const Size(450, 108),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10.0),
                            ),
                            padding: const EdgeInsets.symmetric(
                                vertical: 20, horizontal: 10),
                          ),
                          child: FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Row(
                              children: [
                                Icon(
                                  Icons.star_rounded,
                                  size: 40,
                                  color: Theme.of(context).primaryColor,
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  translation(context).classicMode,
                                  style: TextStyle(
                                    fontFamily: 'Pirata',
                                    fontSize: 40,
                                    color: Theme.of(context).primaryColor,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 80),
                        child: ElevatedButton(
                          onPressed: () {
                            if (loaded) {
                              if (selectionService.games.isEmpty) {
                                ModalService.to.showInformationModal(
                                    context,
                                    translation(context).noGamesAvailable,
                                    translation(context).goCreate);
                              } else {
                                ModalService.to.showTimeLimitedSelection(
                                  context,
                                  translation(context).gameMode,
                                  translation(context).chooseLimitGameMode,
                                );
                              }
                            } else {}
                          },
                          style: ElevatedButton.styleFrom(
                            fixedSize: const Size(450, 108),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10.0),
                            ),
                            padding: const EdgeInsets.symmetric(
                                vertical: 25, horizontal: 10),
                          ),
                          child: FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Row(
                              children: [
                                Icon(
                                  Icons.timer_rounded,
                                  size: 40,
                                  color: Theme.of(context).primaryColor,
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  translation(context).timeLimitedMode,
                                  style: TextStyle(
                                    fontFamily: 'Pirata',
                                    fontSize: 40,
                                    color: Theme.of(context).primaryColor,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 80),
                        child: ElevatedButton(
                          onPressed: () {
                            Get.to(const ObserverSelectionPage(),
                                binding: ObserverBinding());
                          },
                          style: ElevatedButton.styleFrom(
                            fixedSize: const Size(450, 108),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10.0),
                            ),
                            padding: const EdgeInsets.symmetric(
                                vertical: 25, horizontal: 10),
                          ),
                          child: FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Row(
                              children: [
                                Icon(
                                  Icons.remove_red_eye_rounded,
                                  size: 40,
                                  color: Theme.of(context).primaryColor,
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  translation(context).observerMode,
                                  style: TextStyle(
                                    fontFamily: 'Pirata',
                                    fontSize: 40,
                                    color: Theme.of(context).primaryColor,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(
                  height: 100.0,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: members.map((member) {
                      return Padding(
                        padding: const EdgeInsets.all(25),
                        child: Text(
                          member,
                          style: TextStyle(
                            fontFamily: 'Pirata',
                            fontSize: 15.0,
                            color: Theme.of(context).primaryColor,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
