import 'package:client_leger/classes/language_constant.dart';
import 'package:client_leger/services/observer_service.dart';
import 'package:client_leger/widgets/observer_room.dart';
import 'package:client_leger/widgets/top_bar.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ObserverSelectionPage extends StatefulWidget {
  const ObserverSelectionPage({super.key});

  @override
  State<ObserverSelectionPage> createState() => _ObserverSelectionPageState();
}

class _ObserverSelectionPageState extends State<ObserverSelectionPage> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    ObserverService.to.fetchGameSessions();

    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            TopBar(),
            Column(
              children: [
                Text(
                  translation(context).observerPageTitle,
                  style: TextStyle(
                    fontSize: 35,
                    fontFamily: 'Pirata',
                    color: Colors.black,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 40),
                ElevatedButton.icon(
                  onPressed: () {
                    Get.toNamed('/home');
                  },
                  icon: const Icon(Icons.home),
                  label: const Text("PAGE D'ACCUEIL"),
                ),
                const SizedBox(height: 20),
                SingleChildScrollView(
                  child: Obx(
                    () => GridView.builder(
                      physics: const ScrollPhysics(),
                      scrollDirection: Axis.vertical,
                      shrinkWrap: true,
                      itemCount:
                          ObserverService.to.observersGameSessions.length,
                      itemBuilder: (_, index) {
                        return ObserverRoomWidget(
                          observerGameSession:
                              ObserverService.to.observersGameSessions[index],
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
