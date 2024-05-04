import 'package:client_leger/services/account_service.dart';
import 'package:client_leger/services/classic_service.dart';
import 'package:client_leger/services/modal_service.dart';
import 'package:client_leger/services/time_limited_service.dart';
import 'package:client_leger/services/waiting_room_service.dart';
import 'package:get/instance_manager.dart';

class WaitingRoomBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<WaitingRoomService>(WaitingRoomService(), permanent: true);
    Get.put<AccountService>(AccountService(), permanent: true);
    Get.put<ModalService>(ModalService(), permanent: true);
    Get.put<TimeLimitedService>(TimeLimitedService(), permanent: true);
    Get.put<ClassicService>(ClassicService(), permanent: true);
  }
}
