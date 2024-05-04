import 'package:client_leger/services/game_replay_command_factory_service.dart';
import 'package:client_leger/services/replay_page_service.dart';
import 'package:client_leger/services/replay_service.dart';
import 'package:client_leger/services/replay_start_service.dart';
import 'package:get/get.dart';

class ReplaysPageBindings extends Bindings {
  @override
  void dependencies() {
    Get.put<ReplayPageService>(ReplayPageService(), permanent: true);
    Get.put<ReplayStartService>(ReplayStartService(), permanent: true);
    Get.put<ReplayService>(ReplayService(), permanent: true);
    Get.put<GameReplayCommandFactoryService>(GameReplayCommandFactoryService());
  }
}
