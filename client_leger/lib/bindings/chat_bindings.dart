import 'package:client_leger/services/account_service.dart';
import 'package:client_leger/services/chat_service.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:get/instance_manager.dart';

class ChatBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<SocketService>(SocketService(), permanent: true);
    Get.put<AccountService>(AccountService(), permanent: true);
    Get.put<ChatService>(ChatService(), permanent: true);
  }
}
