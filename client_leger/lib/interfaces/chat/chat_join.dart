class JoinChat {
  String chatID;
  String user;

  JoinChat({required this.chatID, required this.user});

  Map<String, dynamic> toMap() {
    return {
      'chatID': chatID,
      'user': user,
    };
  }
  factory JoinChat.fromJson(Map<String, dynamic> json) {
    return JoinChat(
      chatID: json['chatID'],
      user: json['user'],
    );
  }
}
