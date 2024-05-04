import 'package:client_leger/interfaces/chat/chat_message.dart';

class MessageData {
  ChatMessage chatMessage;
  String authorId;

  MessageData({required this.chatMessage, required this.authorId});

  Map<String, dynamic> toMap() {
    return {
      'chatMessage': chatMessage.toMap(),
      'authorId': authorId,
    };
  }

  factory MessageData.fromJson(Map<String, dynamic> json) {
    return MessageData(
      chatMessage: ChatMessage.fromJson(json['chatMessage']),
      authorId: json['authorId'],
    );
  }
}
