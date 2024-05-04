import 'dart:async';

import 'package:client_leger/classes/game-replay-commands/game_replay_command.dart';
import 'package:get/get.dart';
import 'package:get/get_rx/get_rx.dart';

class ReplayExecutor {
  List<GameReplayCommand> _initialCommands;
  List<GameReplayCommand> _commands;
  Timer? _timer;
  int _lastEntryTime = 0;
  RxBool isFinished = false.obs;
  RxInt _speed = 1.obs;

  ReplayExecutor(this._initialCommands)
      : _commands = List.from(_initialCommands);

  get speed => _speed;

  set speed(value) {
    _speed.value = value;
    pause();
    resume();
  }

  pause() {}

  resume() {}

  restart() {
    _lastEntryTime = 0;
    _commands = List.from(_initialCommands);
    _scheduleNextEntry();
  }

  end() {
    _commands.clear();
    _timer?.cancel();
    isFinished.value = true;
  }

  _scheduleNextEntry() {
    if (_commands.isEmpty) {
      end();
      return;
    }

    GameReplayCommand command = _commands.removeAt(0);

    if (_lastEntryTime == 0) {
      _lastEntryTime = command.time;
    }

    int timeToWait = (command.time - _lastEntryTime) ~/ speed.value;

    _timer = Timer(Duration(milliseconds: timeToWait), () {
      command.action();
      _lastEntryTime = command.time;
      _scheduleNextEntry();
    });
  }
}
