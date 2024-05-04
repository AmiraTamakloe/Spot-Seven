import 'package:client_leger/services/account_service.dart';
import 'package:client_leger/services/modal_service.dart';
import 'package:get/instance_manager.dart';

class GlobalBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<AccountService>(AccountService(), permanent: true);
    Get.put<ModalService>(ModalService(), permanent: true);
  }
}
