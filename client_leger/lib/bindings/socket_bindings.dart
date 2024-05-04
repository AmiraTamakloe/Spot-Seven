import 'package:client_leger/services/socket_service.dart';
import 'package:get/instance_manager.dart';

class SocketBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<SocketService>(SocketService(), permanent: true);
  }
}
