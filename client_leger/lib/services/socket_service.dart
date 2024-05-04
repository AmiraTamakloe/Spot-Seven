import 'package:client_leger/environments/environment.dart';
import 'package:client_leger/interfaces/socket_event.dart';
import 'package:client_leger/services/token_service.dart';
import 'package:get/get_state_manager/src/simple/get_controllers.dart';
import 'package:get/instance_manager.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

typedef SocketCallback = dynamic Function(dynamic);

class SocketService extends GetxController {
  IO.Socket? _socket;

  static SocketService get to => Get.find();

  @override
  Future<void> onInit() async {
    await _connect();
    super.onInit();
  }

  @override
  void onClose() {
    disconnect();
    super.onClose();
  }

  Future<void> _connect() async {
    _socket = IO.io(
        environment['socketUrl'],
        IO.OptionBuilder()
            .setTransports(['websocket'])
            .setQuery(
                {'token': (await TokenService().getTokens()).refreshAsString()})
            .disableAutoConnect()
            .build());

    _socket!.connect();
  }

  void disconnect() {
    _socket!.dispose();
  }

  void removeEventListener(SocketCallback listener) {
    _socket!.offAny(listener as dynamic);
  }

  Future<void> send(SocketEvent event,
      [dynamic data, SocketCallback? callback]) async {
    if (_socket == null) {
      await _connect();
    }
    if (data == null) {
      _socket!.emit(event.name);
    } else if (data is String) {
      _socket!.emitWithAck(event.name, data, ack: callback);
    } else {
      _socket!.emitWithAck(event.name, data.toMap(), ack: callback);
    }
  }

  Future<void> on(SocketEvent event, SocketCallback callback) async {
    if (_socket == null) {
      await _connect();
    }

    _socket!.on(event.name, callback);
  }
}
