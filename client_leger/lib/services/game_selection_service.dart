import 'dart:convert';
import 'dart:io';

import 'package:client_leger/environments/environment.dart';
import 'package:client_leger/interfaces/game.dart';
import 'package:client_leger/services/interceptor.dart';
import 'package:get/get.dart';
import 'package:http_interceptor/http_interceptor.dart';

class SelectionService extends GetxController {
  static SelectionService get to => Get.find();
  List<Game> games = [];

  final String baseUrl = environment['serverUrl'];

  final httpClient = InterceptedClient.build(
      interceptors: [AuthenticationInterceptor()],
      retryPolicy: AuthenticationInterceptor());

  Future<void> getGames() async {
    final response = await httpClient.get(Uri.parse('$baseUrl/game'));
    if (response.statusCode == HttpStatus.ok) {
      Iterable l = json.decode(response.body);
      games = l.map((e) => Game.fromJson(e)).toList();
      update();
    }
  }
}
