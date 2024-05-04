class SelectChat {
  String id;
  String user;

  SelectChat({
    required this.id,
    required this.user,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'user': user,
    };
  }

  factory SelectChat.fromJson(Map<String, dynamic> json) {
    return SelectChat(
      id: json['id'],
      user: json['user'],
    );
  }
}