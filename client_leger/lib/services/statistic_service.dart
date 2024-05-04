import 'dart:convert';
import 'package:client_leger/interfaces/statistic.dart';
import 'package:client_leger/services/interceptor.dart';
import 'package:get/get.dart';
import 'package:client_leger/environments/environment.dart';
import 'package:http_interceptor/http/intercepted_client.dart';

class StatisticService extends GetxController {
  late Statistic statistics;
  final String baseUrl = environment['serverUrl'];

    final httpClient = InterceptedClient.build(
      interceptors: [AuthenticationInterceptor()],
      retryPolicy: AuthenticationInterceptor());

  Future<void> getStatistics(String userId) async {
    final response = await httpClient.get(Uri.parse('$baseUrl/users/$userId/statistic'));
    if (response.statusCode == 200) {
      final userStats = json.decode(response.body);
      statistics = Statistic.fromJson(userStats);
    }
  }
}