class UserInfo {
  String? id;
  String username;
  String? password;
  String? email;
  String? avatar;

  UserInfo(
      {
        this.id,
        required this.username,
        this.password,
        this.email,
        this.avatar
      }
  );

  Map<String, dynamic> toMap() {
    return {
      '_id': id,
      'username': username,
      'password': password,
      'email': email,
      'avatar': avatar,
    };
  }

  factory UserInfo.fromJson(Map<String, dynamic> json) {
    try {
      return UserInfo(
        id: json['_id'],
        username: json['username'],
        password: json['saltedHashedPassword'],
        email: json['email'],
        avatar: json['avatar'],
      );
    } catch (e) {
      throw FormatException('Failed to create UserInfo: $e');
    }
  }
}
