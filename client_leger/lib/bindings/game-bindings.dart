import 'package:client_leger/services/classic_service.dart';
import 'package:client_leger/services/game_replay_command_factory_service.dart';
import 'package:client_leger/services/replay_service.dart';
import 'package:client_leger/services/replay_start_service.dart';
import 'package:client_leger/services/time_limited_service.dart';
import 'package:get/instance_manager.dart';

class TimeLimitedBindings extends Bindings {
  @override
  void dependencies() {
    Get.put<TimeLimitedService>(TimeLimitedService(), permanent: true);
  }
}

class ClassicBindings extends Bindings {
  @override
  void dependencies() {
    Get.put<ClassicService>(ClassicService(), permanent: true);
    Get.put<ReplayStartService>(ReplayStartService(), permanent: true);
    Get.put<ReplayService>(ReplayService(), permanent: true);
    Get.put<GameReplayCommandFactoryService>(GameReplayCommandFactoryService());
  }
}

class ReplayGameBindings extends Bindings {
  @override
  void dependencies() {
    Get.put<ReplayService>(ReplayService(), permanent: true);
  }
}
