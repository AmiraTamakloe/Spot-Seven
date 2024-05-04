class Preferences {
    String? userId;
    String? language;
    String? theme;
    String? music;
    
    Preferences({this.userId, this.language, this.theme, this.music});


    factory Preferences.fromJson(Map<String, dynamic> json) {
        return Preferences(
        userId: json['userId'],
        language: json['language'],
        theme: json['theme'],
        music: json['music'],
        );
    }
}
