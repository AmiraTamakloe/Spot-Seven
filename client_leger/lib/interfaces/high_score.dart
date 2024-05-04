class HighScore {
  String playerName;
  int time;

  HighScore({required this.playerName, required this.time});

  Map<String, dynamic> toMap() {
    return {
      'playerName': playerName,
      'time': time,
    };
  }

  factory HighScore.fromJson(Map<String, dynamic> json) {
    return HighScore(
      playerName: json['playerName'],
      time: json['time'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'playerName': playerName,
      'time': time,
    };
  }
}
