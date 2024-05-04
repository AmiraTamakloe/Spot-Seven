abstract class GameReplayCommand {
  final int time;
  void action();

  GameReplayCommand({required this.time});
}
