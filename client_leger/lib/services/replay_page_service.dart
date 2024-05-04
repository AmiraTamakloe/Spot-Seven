import 'dart:convert';
import 'dart:io';

import 'package:client_leger/environments/environment.dart';
import 'package:client_leger/interfaces/dto/replay.dto.dart';
import 'package:client_leger/services/interceptor.dart';
import 'package:get/get.dart';
import 'package:http_interceptor/http_interceptor.dart';

class ReplayPageService extends GetxController {
  static ReplayPageService get to => Get.find();

  RxList<ReplayDto> publicReplays = <ReplayDto>[].obs;
  RxList<ReplayDto> userReplays = <ReplayDto>[].obs;

  final httpClient = InterceptedClient.build(
      interceptors: [AuthenticationInterceptor()],
      retryPolicy: AuthenticationInterceptor());

  final String baseUrl = environment['serverUrl'];

  Future<void> getReplays() async {
    await getPublicReplays();
    await getUserReplays();
  }

  Future<void> getPublicReplays() async {
    final response = await httpClient.get(Uri.parse('$baseUrl/replays/all'));
    if (response.statusCode == HttpStatus.ok) {
      Iterable rawReplays = json.decode(response.body);
      publicReplays.value =
          rawReplays.map((replay) => ReplayDto.fromJson(replay)).toList();
    }
  }

  Future<void> getUserReplays() async {
    final response = await httpClient.get(Uri.parse('$baseUrl/replays'));
    if (response.statusCode == HttpStatus.ok) {
      Iterable rawReplays = json.decode(response.body);
      userReplays.value =
          rawReplays.map((replay) => ReplayDto.fromJson(replay)).toList();
    }
  }

  Future<void> deleteReplay(String replayId) async {
    await httpClient.delete(Uri.parse('$baseUrl/replays/$replayId'));
    _removeUserReplay(replayId);
  }

  _removeUserReplay(String replayId) {
    publicReplays.removeWhere((element) => element.id == replayId);
    userReplays.removeWhere((element) => element.id == replayId);
  }

  Future<void> toggleReplayVisibility(String replayId) async {
    await httpClient.patch(Uri.parse('$baseUrl/replays/$replayId'));
    _toggleVisibility(replayId);
  }

  _toggleVisibility(String replayId) {
    ReplayDto? replay =
        userReplays.firstWhereOrNull((element) => element.id == replayId);

    if (replay == null) {
      return;
    }

    replay.isPublic = !replay.isPublic;

    userReplays.refresh();

    if (replay.isPublic) {
      publicReplays.add(replay);
    } else {
      publicReplays.removeWhere((element) => element.id == replayId);
    }
  }
}
