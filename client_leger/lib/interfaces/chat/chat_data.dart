class ChatData {
  String chatId;
  String chatname;
  bool isOwner;

  ChatData(
      {required this.chatId, required this.chatname, required this.isOwner});

  Map<String, dynamic> toMap() {
    return {
      'chatId': chatId,
      'chatname': chatname,
      'isOwner': isOwner,
    };
  }

  factory ChatData.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'chatId': String chatId,
        'chatname': String chatname,
        'isOwner': bool isOwner,
      } =>
        ChatData(
          chatId: chatId,
          chatname: chatname,
          isOwner: isOwner,
        ),
      _ => throw const FormatException('Cannot construct ChatMessage.'),
    };
  }
}
