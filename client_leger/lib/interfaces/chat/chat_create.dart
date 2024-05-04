class CreateChat {
  String name;
  String userId;

  CreateChat({
    required this.name,
    required this.userId,
  });

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'userId': userId,
    };
  }

  factory CreateChat.fromJson(Map<String, dynamic> json) {
    return CreateChat(
      name: json['name'],
      userId: json['userId'],
    );
  }
}