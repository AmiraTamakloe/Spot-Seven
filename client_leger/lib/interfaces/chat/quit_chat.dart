class QuitChat {
  String chatID;
  String user;

  QuitChat({required this.chatID, required this.user});

  Map<String, dynamic> toMap() {
    return {
      'chatID': chatID,
      'user': user,
    };
  }
  factory QuitChat.fromJson(Map<String, dynamic> json) {
    return QuitChat(
      chatID: json['chatID'],
      user: json['user'],
    );
  }
}
