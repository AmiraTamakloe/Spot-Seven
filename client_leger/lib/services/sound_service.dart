import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:audioplayers/audioplayers.dart';
import 'package:client_leger/constants/preferences.dart';
import 'package:client_leger/environments/environment.dart';
import 'package:client_leger/interfaces/preferences.dart';
import 'package:client_leger/services/account_service.dart';
import 'package:client_leger/services/interceptor.dart';
import 'package:client_leger/services/preferences_service.dart';
import 'package:file_picker/file_picker.dart';
import 'package:get/get.dart';
import 'package:http_interceptor/http_interceptor.dart';

class SoundService extends GetxController {
  final AudioPlayer audioPlayer = AudioPlayer();
  String selectedWinningSoundEffect = MusicType.tadaa.name;
  final String baseUrl = environment['serverUrl'];

  Uint8List fileBytes = Uint8List(0);
  String loadedMusic = '';

  final PreferencesService preferencesService = PreferencesService();

  final httpClient = InterceptedClient.build(
      interceptors: [AuthenticationInterceptor()],
      retryPolicy: AuthenticationInterceptor());

  Preferences preferences = Preferences(
      userId: '',
      language: LanguageType.english.value,
      theme: ThemeType.dark.value,
      music: MusicType.goodresult.value);

  Future<void> setNewWinningSoundEffect(String music) async {
    selectedWinningSoundEffect = music;
    preferences = preferencesService.preferences;
    preferences.music = selectedWinningSoundEffect;
    await preferencesService.updateAccountPreferences(
        preferences, PreferencesCategory.music.name);
  }

  Future<String> getWinningSoundEffect() async {
    final userInfo = await AccountService.to.getAccountInfo();
    final userId = userInfo.id!;
    await preferencesService.getAccountPreferences(userId);
    preferences = preferencesService.preferences;
    selectedWinningSoundEffect = preferences.music!;
    if (selectedWinningSoundEffect == MusicType.uploaded.name) {
      loadedMusic = await getMusic(userId);
    }
    return selectedWinningSoundEffect;
  }

  Future<void> playVictoryMusicFromAsset(String music) async {
    try {
      audioPlayer.play(AssetSource('victory-music/$music'));
    } catch (e) {
      print('Error playing sound from URL: $music\nError: $e');
    }
  }

  Future<void> playGoodSoundEffect() async {
    try {
      audioPlayer.play(AssetSource('audio/good.mp3'));
    } catch (e) {
      print('Error playing sound from URL: good.mp3\nError: $e');
    }
  }

  Future<void> playWrongSoundEffect() async {
    try {
      audioPlayer.play(AssetSource('audio/wrong.mp3'));
    } catch (e) {
      print('Error playing sound from URL: wrong.mp3\nError: $e');
    }
  }

  Future<void> playWinningSoundEffect() async {
    String winningSoundEffect = await getWinningSoundEffect();
    if (winningSoundEffect.contains('mp3')) {
      playVictoryMusicFromAsset(winningSoundEffect);
    } else {
      playMusicFromBytes(base64Decode(loadedMusic));
    }
  }

  playMusicFromBytes(Uint8List bytes) {
    audioPlayer.play(BytesSource(bytes));
  }

  Future<void> uploadVictoryMusic() async {
    try {
      FilePickerResult? result =
          await FilePicker.platform.pickFiles(withData: true);
      if (result != null) {
        fileBytes = (result.files.single.bytes!);
        playMusicFromBytes(fileBytes);
        final userInfo = await AccountService.to.getAccountInfo();
        final userId = userInfo.id!;
        saveMusic(userId, fileBytes);
      }
    } catch (e) {
      print('Error playing sound from URL: uploadedMusic\nError: $e');
    }
  }

  Future<String> getMusic(String userId) async {
    try {
      final response =
          await httpClient.get(Uri.parse('$baseUrl/preferences/$userId/music'));
      if (response.statusCode == HttpStatus.ok) {
        return response.body;
      }
    } catch (e) {
      print(e);
    }
    return '';
  }

  Future<void> saveMusic(String userId, Uint8List music) async {
    try {
      await httpClient.put(
        Uri.parse('$baseUrl/preferences/music/uploaded'),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode({
          'userId': userId,
          'music': music,
        }),
      );
    } catch (e) {
      print(e);
    }
  }
}
