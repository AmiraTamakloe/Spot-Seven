import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';

class TokenPayload {
  final String username;
  final DateTime expiresAt;
  final DateTime createdAt;

  TokenPayload(this.username, this.expiresAt, this.createdAt);

  bool isExpired() {
    return DateTime.now().isAfter(expiresAt);
  }
}

class RawTokens {
  final String accessToken;
  final String refreshToken;

  RawTokens(this.accessToken, this.refreshToken);
}

class Tokens {
  final JWT? accessToken;
  final JWT? refreshToken;

  Tokens(this.accessToken, this.refreshToken);

  String accessAsString() {
    return accessToken!.payload;
  }

  String refreshAsString() {
    return refreshToken!.payload;
  }
}
