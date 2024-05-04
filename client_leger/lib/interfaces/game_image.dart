import 'dart:async';
import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:client_leger/environments/environment.dart';
import 'package:client_leger/interfaces/image_area.dart';
import 'package:client_leger/services/interceptor.dart';
import 'package:flutter/material.dart';
import 'package:http_interceptor/http/intercepted_client.dart';
import 'package:image/image.dart' as img;

class GameImage extends ChangeNotifier {
  final String baseUrl = environment['uploadUrl'];
  final httpClient = InterceptedClient.build(
      interceptors: [AuthenticationInterceptor()],
      retryPolicy: AuthenticationInterceptor());
  late ui.Image displayableImage;
  late img.Image image;
  late String imagePath;
  late ImageArea imageArea;
  final Completer<bool> displayableImageCompleter = Completer<bool>();

  GameImage(this.imagePath, this.imageArea) {
    httpClient.get(Uri.parse(imagePath)).then((response) async {
      if (response.statusCode == HttpStatus.ok) {
        final Uint8List bytes = response.bodyBytes;
        image = img.decodeImage(bytes)!;
        final ui.Codec codec =
            await ui.instantiateImageCodec(img.encodeBmp(image));
        ui.FrameInfo frameInfo = await codec.getNextFrame();
        displayableImage = frameInfo.image;
        displayableImageCompleter.complete(true);
      }
    });
  }

  Future<bool> getDisplayableImage() {
    return displayableImageCompleter.future;
  }

  void loadNewImage(String newPath) {
    httpClient.get(Uri.parse(newPath)).then((response) async {
      if (response.statusCode == HttpStatus.ok) {
        final Uint8List bytes = response.bodyBytes;
        image = img.decodeImage(bytes)!;
        final ui.Codec codec =
            await ui.instantiateImageCodec(img.encodeBmp(image));
        ui.FrameInfo frameInfo = await codec.getNextFrame();
        displayableImage = frameInfo.image;
        notifyListeners();
      }
    });
  }

  regenerateImage() async {
    final ui.Codec codec = await ui.instantiateImageCodec(img.encodeBmp(image));
    ui.FrameInfo frameInfo = await codec.getNextFrame();
    displayableImage = frameInfo.image;
    notifyListeners();
  }
}
