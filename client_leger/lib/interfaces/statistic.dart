class Statistic {
  int gamesPlayed;
  int gamesWon;
  int averageScore;
  String averageTime;

  Statistic({
    required this.gamesPlayed,
    required this.gamesWon,
    required this.averageScore,
    required this.averageTime,
  });

  Map<String, dynamic> toMap() {
    return {
      'gamesPlayed': gamesPlayed,
      'gamesWon': gamesWon,
      'averageScore': averageScore,
      'averageTime': averageTime,
    };
  }

  factory Statistic.fromJson(Map<String, dynamic> json) {
  try {
    return Statistic(
      gamesPlayed: json['gamesPlayed'],
      gamesWon: json['gamesWon'],
      averageScore: json['averageScore'],
      averageTime: json['averageTime'],
    );
  } catch (e) {
    throw FormatException('Failed to create Statistic: $e');
  }
}

}
