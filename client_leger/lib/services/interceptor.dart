import 'dart:io';

import 'package:client_leger/environments/environment.dart';
import 'package:client_leger/services/token_service.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:http_interceptor/http_interceptor.dart';

class HttpClient {
  static final HttpClient _httpClient = HttpClient._internal();
  Client client =
      InterceptedClient.build(interceptors: [AuthenticationInterceptor()]);
  factory HttpClient() {
    return _httpClient;
  }
  HttpClient._internal();
}

class AuthenticationInterceptor extends RetryPolicy
    implements InterceptorContract {
  final String baseUrl = environment['serverUrl'];

  @override
  Future<BaseRequest> interceptRequest({required BaseRequest request}) async {
    if (kDebugMode) {
      print("Intercepting request to ${request.url.toString()}");
    }
    request.headers["Content-Type"] = "application/json;charset=UTF-8";

    if (request.url.toString().contains('auth')) {
      return request;
    }

    //return request if i logout and topbar try to load
    if (request.url.toString().contains('topbar')) {
      return request;
    }

    final tokens = await TokenService().getTokens();
    request.headers['Authorization'] = 'Bearer ${tokens.accessAsString()}';

    return request;
  }

  @override
  Future<bool> shouldAttemptRetryOnResponse(BaseResponse response) async {
    if (response.statusCode == HttpStatus.unauthorized ||
        response.statusCode == HttpStatus.forbidden) {
      await TokenService().refreshTokens();
      return true;
    }
    return false;
  }

  @override
  Future<http.BaseResponse> interceptResponse(
      {required http.BaseResponse response}) async {
    return response;
  }

  @override
  Future<bool> shouldInterceptRequest() async {
    return true;
  }

  @override
  Future<bool> shouldInterceptResponse() async {
    return true;
  }
}
