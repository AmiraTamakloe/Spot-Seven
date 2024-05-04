import 'package:client_leger/interfaces/user-info.dart';

class Friendship {
  String id;
  UserInfo sender;
  UserInfo receiver;
  String? blockedUser;
  String status;

  Friendship({
    required this.id,
    required this.sender,
    required this.receiver,
    required this.status,
    this.blockedUser,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'sender': sender.toMap(),
      'receiver': receiver.toMap(),
      'status': status,
      'blockedUser': blockedUser,
    };
  }

  factory Friendship.fromJson(Map<String, dynamic> json) {
  try {
    return Friendship(
      id: json['_id'],
      sender: UserInfo.fromJson(json['sender']),
      receiver: UserInfo.fromJson(json['receiver']),
      status: json['status'],
      blockedUser: json['blockedUser'],
    );
  } catch (e) {
    throw FormatException('Failed to create Friendship: $e');
  }
}

}
