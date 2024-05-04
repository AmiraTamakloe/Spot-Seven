import 'dart:convert';

import 'package:client_leger/environments/environment.dart';
import 'package:client_leger/exceptions/token_exceptions.dart';
import 'package:client_leger/interfaces/tokens.dart';
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';
import 'package:http/http.dart' as http;

class TokenService {
  static final TokenService _tokenService = TokenService._internal();
  JWT? _accessToken;
  JWT? _refreshToken;
  TokenPayload? _tokenPayload;
  final String baseUrl = environment['serverUrl'];

  // Dart factory makes singletons easier
  factory TokenService() {
    return _tokenService;
  }

  // This creates the singleton
  TokenService._internal();

  Future<bool> isLoggedIn() async {
    if (_accessToken == null && _refreshToken == null) {
      return false;
    }
    return true;
  }

  Future<Tokens> getTokens() async {
    if (_accessToken == null || _refreshToken == null) {
      await refreshTokens();
    }
    return Tokens(_accessToken, _refreshToken);
  }

  void setTokens(String accessToken, String refreshToken) {
    _accessToken = JWT(accessToken);
    _refreshToken = JWT(refreshToken);
    final payload = JWT.decode(_accessToken!.payload).payload;
    _tokenPayload = TokenPayload(
      payload['username'],
      DateTime.fromMillisecondsSinceEpoch(payload['exp'] * 1000),
      DateTime.fromMillisecondsSinceEpoch(payload['iat'] * 1000),
    );
  }

  bool isAccessTokenExpired() {
    if (_tokenPayload == null) {
      throw TokenExpiredException('No tokens found');
    }
    return _tokenPayload!.isExpired();
  }

  void removeTokens() {
    _accessToken = null;
    _refreshToken = null;
    _tokenPayload = null;
  }

  String getUsername() {
    return _tokenPayload!.username;
  }

  Future<void> refreshTokens() async {
    final refreshDto = {
      "refreshToken": (await getTokens()).refreshAsString(),
      "username": getUsername(),
    };

    final http.Response response =
        await http.post(Uri.parse('$baseUrl/auth/refresh'), body: refreshDto);
    final jsonResponse = jsonDecode(response.body);
    TokenService().setTokens(
      jsonResponse['accessToken'],
      jsonResponse['refreshToken'],
    );
  }
}
