import 'dart:convert';

import 'package:client_leger/constants/preferences.dart';
import 'package:client_leger/environments/environment.dart';
import 'package:client_leger/interfaces/preferences.dart';
import 'package:client_leger/services/interceptor.dart';
import 'package:get/get.dart';
import 'package:http_interceptor/http_interceptor.dart';

class PreferencesService extends GetxController {
  Preferences preferences = Preferences(
      userId: '',
      language: LanguageType.english.value,
      theme: ThemeType.dark.value,
      music: MusicType.goodresult.value);

  final String baseUrl = environment['serverUrl'];

  final httpClient = InterceptedClient.build(
      interceptors: [AuthenticationInterceptor()],
      retryPolicy: AuthenticationInterceptor());

  Future<void> getAccountPreferences(String userId) async {
    try {
      final response =
          await httpClient.get(Uri.parse('$baseUrl/preferences/$userId'));
      if (response.statusCode == 200) {
        Map<String, dynamic> jsonMap = jsonDecode(response.body);
        preferences = Preferences.fromJson(jsonMap);
      }
    } catch (e) {
      print(e);
    }
  }

  Future<void> updateAccountPreferences(
      Preferences preferences, String type) async {
    try {
      await httpClient.put(
        Uri.parse('$baseUrl/preferences/$type'),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode({
          'userId': preferences.userId,
          'language': preferences.language,
          'theme': preferences.theme,
          'music': preferences.music,
        }),
      );
    } catch (e) {
      print(e);
    }
  }
}
