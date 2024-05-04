import 'package:client_leger/classes/language_constant.dart';
import 'package:client_leger/interfaces/observer_game_session.dart';
import 'package:client_leger/services/observer_service.dart';
import 'package:flutter/material.dart';

class ObserverRoomWidget extends StatefulWidget {
  final ObserverGameSession observerGameSession;

  const ObserverRoomWidget({super.key, required this.observerGameSession});

  @override
  State<ObserverRoomWidget> createState() => _ObserverRoomWidgetState();
}

class _ObserverRoomWidgetState extends State<ObserverRoomWidget> {
  @override
  void initState() {
    super.initState();
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
          const SizedBox(
            height: 10,
          ),
          Container(
            decoration: BoxDecoration(
              border:
                  Border(bottom: BorderSide(width: 2.0, color: Colors.black)),
            ),
            child: Text(
              ObserverService.to
                      .isGameModeClassic(widget.observerGameSession.gameMode)
                  ? '${translation(context).currentGameSession} ${widget.observerGameSession.gameName}'
                  : translation(context).timeLimitedMode,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 20,
                fontFamily: 'Pirata',
                color: Colors.black,
              ),
            ),
          ),
          const SizedBox(
            height: 20,
          ),
          if (widget.observerGameSession.currentObservers.isNotEmpty)
            Text(
              '👀 ' + translation(context).observerPresent,
              style: TextStyle(
                fontFamily: 'Pirata',
                fontSize: 20,
              ),
            ),
          if (widget.observerGameSession.currentObservers.isEmpty)
            Text(
              '👀 ' + translation(context).noObserverPresent,
              style: TextStyle(
                fontFamily: 'Pirata',
                fontSize: 20,
              ),
            ),
          const SizedBox(
            height: 20,
          ),
          ElevatedButton(
            onPressed: () async => {
              await ObserverService.to.joinGameSession(
                  widget.observerGameSession.gameRoomId,
                  widget.observerGameSession.gameMode)
            },
            style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF07487C)),
            child: Text(translation(context).startObservingGame,
                style: const TextStyle(
                  color: Colors.white,
                  fontFamily: 'Pirata',
                  fontSize: 25,
                )),
          ),
        ],
      ),
    );
  }
}
