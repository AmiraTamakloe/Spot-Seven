class Player {
  String socketId;
  String username;

  Player({
    required this.socketId,
    required this.username,
  });

  factory Player.mapToType(Map<String, dynamic> map) {
    return switch (map) {
      {'socketId': String socketId, 'username': String username} =>
        Player(socketId: socketId, username: username),
      _ => throw const FormatException('Cannot construct Player.'),
    };
  }

  Map<String, dynamic> toJson() {
    return {
      'socketId': socketId,
      'username': username,
    };
  }
}
