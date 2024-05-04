enum GameMode {
  classic,
  classicTeam,
  timeLimited,
  timeLimitedImproved,
}

GameMode parseGameMode(String value) {
  switch (value) {
    case 'classic':
      return GameMode.classic;
    case 'classicTeam':
      return GameMode.classicTeam;
    case 'timeLimited':
      return GameMode.timeLimited;
    case 'timeLimitedImproved':
      return GameMode.timeLimitedImproved;
    default:
      throw ArgumentError('Invalid GameMode value: $value');
  }
}

String getGameModeString(GameMode mode) {
  switch (mode) {
    case GameMode.classic:
      return 'classic';
    case GameMode.classicTeam:
      return 'classicTeam';
    case GameMode.timeLimited:
      return 'timeLimited';
    case GameMode.timeLimitedImproved:
      return 'timeLimitedImproved';
  }
}
