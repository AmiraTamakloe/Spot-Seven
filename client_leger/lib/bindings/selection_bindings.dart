import 'package:client_leger/services/waiting_room_service.dart';
import 'package:get/instance_manager.dart';

class SelectionBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<WaitingRoomService>(WaitingRoomService(), permanent: true);
  }
}
