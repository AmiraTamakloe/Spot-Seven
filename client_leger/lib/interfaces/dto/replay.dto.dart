class ReplayDto {
  final String id;
  final String user;
  final String gameName;
  final String createdAt;
  bool isPublic;

  ReplayDto(
      {required this.id,
      required this.user,
      required this.gameName,
      required this.isPublic,
      required this.createdAt});

  factory ReplayDto.fromJson(Map<String, dynamic> json) {
    return ReplayDto(
      id: json['id'],
      user: json['user'],
      gameName: json['gameName'],
      isPublic: json['isPublic'],
      createdAt: json['createdAt'],
    );
  }
}
