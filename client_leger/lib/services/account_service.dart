import 'dart:convert';
import 'dart:io';

import 'package:client_leger/environments/environment.dart';
import 'package:client_leger/interfaces/user-info.dart';
import 'package:client_leger/services/interceptor.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/services/token_service.dart';
import 'package:get/get.dart';
import 'package:http_interceptor/http_interceptor.dart';

class AccountService extends GetxController {
  // TODO: remove username and set user.username
  String username = '';
  late UserInfo user;

  final String baseUrl = environment['serverUrl'];
  final httpClient =
      InterceptedClient.build(interceptors: [AuthenticationInterceptor()]);

  static AccountService get to => Get.find();

  Future<UserInfo> getAccountInfo() async {
    final response = await httpClient.get(Uri.parse('$baseUrl/auth/$username'));
    if (response.statusCode == HttpStatus.ok) {
      final decodedResponse =
          json.decode(response.body) as Map<String, dynamic>;
      return UserInfo.fromJson(decodedResponse);
    }
    throw Exception('Failed to load account info');
  }

  Future<int> logInAccount(String username, String password) async {
    final response = await httpClient.post(Uri.parse('$baseUrl/auth/login'),
        body: jsonEncode(<String, String>{
          'username': username,
          'password': password,
        }));
    if (response.statusCode == HttpStatus.created) {
      final decodedResponse =
          json.decode(response.body) as Map<String, dynamic>;
      TokenService().setTokens(
          decodedResponse["accessToken"], decodedResponse["refreshToken"]);

      this.username = username;
    }
    return response.statusCode;
  }

  getUsername() {
    return this.username;
  }

  Future<void> logout() async {
    await httpClient.post(Uri.parse('$baseUrl/auth/logout'),
        body: jsonEncode(<String, String>{
          'username': username,
        }));

    TokenService().removeTokens();
    try {
      SocketService.to.disconnect();
    } on ClientException catch (ce) {
      print("Error while disconnecting ${ce.message}");
    }
    Get.delete<SocketService>(force: true);
    Get.toNamed('/login');
  }

  Future<bool> isLoggedIn() async {
    return await TokenService().isLoggedIn();
  }

  Future<int> registerAccount(UserInfo user) async {
    final response = await httpClient.post(
      Uri.parse('$baseUrl/auth/signup'),
      body: jsonEncode(user.toMap()),
    );
    return response.statusCode;
  }

  getAvatarUrl(String imageName) async {
    final response =
        await httpClient.get(Uri.parse('$baseUrl/auth/avatar/$imageName'));
    if (response.statusCode == HttpStatus.ok) {
      return response.body;
    }
    throw Exception('Failed to load avatar');
  }

  updateAccountParameters(UserInfo user) async {
    final response = await httpClient.put(
      Uri.parse('$baseUrl/auth/parameter'),
      body: jsonEncode(user.toMap()),
    );
    if (response.statusCode == HttpStatus.ok) {
      username = user.username;
      return response.body;
    }
    return false;
  }
}
