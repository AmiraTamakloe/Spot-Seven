class ChatMessage {
  String author;
  String content;
  DateTime time;
  String destination;

  ChatMessage({
    required this.author,
    required this.content,
    required this.time,
    required this.destination,
  });

  Map<String, dynamic> toMap() {
    return {
      'author': author,
      'content': content,
      'time': time,
      'destination': destination,
    };
  }

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      author: json['author'],
      content: json['content'],
      time: DateTime.fromMillisecondsSinceEpoch(json['time']),
      destination: "",
    );
  }
}
