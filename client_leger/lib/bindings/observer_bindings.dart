import 'package:client_leger/services/classic_service.dart';
import 'package:client_leger/services/observer_service.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/services/time_limited_service.dart';
import 'package:get/instance_manager.dart';

class ObserverBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<SocketService>(SocketService(), permanent: true);
    Get.put<ObserverService>(ObserverService(), permanent: true);
    Get.put<ClassicService>(ClassicService(), permanent: true);
    Get.put<TimeLimitedService>(TimeLimitedService(), permanent: true);
  }
}
