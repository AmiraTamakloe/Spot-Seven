import 'package:client_leger/environments/environment.dart';
import 'package:client_leger/interfaces/chat/chat_create.dart';
import 'package:client_leger/interfaces/chat/chat_data.dart';
import 'package:client_leger/interfaces/chat/chat_join.dart';
import 'package:client_leger/interfaces/chat/chat_message.dart';
import 'package:client_leger/interfaces/chat/message_data.dart';
import 'package:client_leger/interfaces/chat/quit_chat.dart';
import 'package:client_leger/interfaces/chat/select_chat.dart';
import 'package:client_leger/interfaces/socket_event.dart';
import 'package:client_leger/services/interceptor.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:events_emitter/events_emitter.dart';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import 'package:http_interceptor/http_interceptor.dart';

class ChatService extends GetxController {
  static ChatService get to => Get.find();
  String chatName = 'alloaa';
  String activeChatId = '';
  String userId = '';

  List<String> usernames = [];
  String test = 'yo';
  final httpClient =
      InterceptedClient.build(interceptors: [AuthenticationInterceptor()]);
  final String baseUrl = environment['serverUrl'];
  final messagesNotifier = ValueNotifier<List<MessageData>>([]);
  final joinableChats = ValueNotifier<List<ChatData>>([]);
  final joinedChats = ValueNotifier<List<ChatData>>([]);
  final events = EventEmitter();

  @override
  void onInit() {
    SocketService.to.on(SocketEvent.message, _newMessageHandler);
    SocketService.to.on(SocketEvent.updatedChatsList, _updateChatList);
    SocketService.to.on(SocketEvent.selectChat, _selectChatEvent);
    SocketService.to.on(SocketEvent.getUserId, _getUserId);
    SocketService.to.on(SocketEvent.quitChat, _quitChatEvent);
    super.onInit();
  }

  @override
  void onClose() {
    SocketService.to.removeEventListener(_newMessageHandler);
    SocketService.to.removeEventListener(_updateChatList);
    SocketService.to.removeEventListener(_selectChatEvent);
    SocketService.to.removeEventListener(_getUserId);
    SocketService.to.removeEventListener(_quitChatEvent);
    super.onClose();
  }

  void _newMessageHandler(dynamic message) {
    ChatMessage chatMessage = ChatMessage.fromJson(message);
    MessageData newMessage =
        MessageData(chatMessage: chatMessage, authorId: message['authorId']);
    receiveMessage(newMessage);
  }

  _updateChatList(dynamic chatData) {
    ChatData newChat = ChatData.fromJson(chatData);
    updateChatList(newChat);
  }

  _selectChatEvent(dynamic data) {
    List<MessageData> messages = [];

    for (var i = 0; i < data.length; i++) {
      messages.add(MessageData(
          chatMessage: ChatMessage.fromJson(data[i]['chatMessage']),
          authorId: data[i]['authorId']));
    }
    messagesNotifier.value = [...messagesNotifier.value, ...messages];
  }

  _getUserId(id) => userId = id;

  _quitChatEvent(chatId) => quitChatEvent(chatId);

  Future<void> createChat(String chatName, String username) async {
    final response = await httpClient.get(Uri.parse('$baseUrl/chat/$username'));
    if (response.statusCode == 200) {
      CreateChat newChat = CreateChat(name: chatName, userId: response.body);
      SocketService.to.send(SocketEvent.createChat, newChat);
    }
  }

  Future<void> getJoinedChats(String username) async {
    List<ChatData> chats = [];
    SocketService.to.send(
        SocketEvent.getJoinedChatsCallBack,
        username,
        (data) => {
              if (data is List<dynamic>)
                {
                  chats = data.map((chat) {
                    return ChatData(
                      chatId: chat['chatId'],
                      chatname: chat['chatname'],
                      isOwner: chat['isOwner'],
                    );
                  }).toList(),
                  joinedChats.value = [...chats],
                }
            });
  }

  Future<void> getJoinableChats(String username) async {
    List<ChatData> chats = [];

    SocketService.to.send(
        SocketEvent.getJoinableChatsCallBack,
        username,
        (data) => {
              if (data is List<dynamic>)
                {
                  chats = data.map((chat) {
                    return ChatData(
                      chatId: chat['chatId'],
                      chatname: chat['chatname'],
                      isOwner: chat['isOwner'],
                    );
                  }).toList(),
                  joinableChats.value = [...chats],
                }
            });
  }

  Future<void> joinChat(String chatId, String username) async {
    JoinChat joinChat = JoinChat(chatID: chatId, user: username);
    SocketService.to.send(SocketEvent.joinChat, joinChat, (response) {});
    selectChat(chatId, username);
  }

  selectChat(String chatId, String username) {
    print('selecting chat');
    activeChatId = chatId;
    messagesNotifier.value = [];
    SelectChat selectChat = SelectChat(id: chatId, user: username);
    SocketService.to.send(SocketEvent.selectChat, selectChat);
  }

  receiveMessage(MessageData message) {
    if (message.chatMessage.destination == activeChatId) {
      messagesNotifier.value = [...messagesNotifier.value, message];
    }
  }

  sendMessage(ChatMessage message) {
    if (message.content.trim().isEmpty || message.destination.length == 0) {
      return;
    }
    this.activeChatId = message.destination;

    SocketService.to.send(SocketEvent.message, message);
  }

  getUserId(String username) {
    print('getting user id');
    SocketService.to.send(SocketEvent.getUserId, username);
  }

  Future<String> getChatName(String chatId) async {
    var response =
        await httpClient.get(Uri.parse('$baseUrl/chat/chatname/$chatId'));
    chatName = response.body;
    return response.body;
  }

  void quitChat(String chatId, String username) {
    // FIX ME
    //joinableChats.removeWhere((chat) => chat.chatId == chatId);
    // joinedChats.removeWhere((chat) => chat.chatId == chatId);

    QuitChat quitChat = QuitChat(chatID: chatId, user: username);
    SocketService.to.send(SocketEvent.quitChat, quitChat);
  }

  quitChatEvent(String chatId) {
    // FIX ME
    //joinableChats.removeWhere((chat) => chat.chatId == chatId);
    // joinedChats.removeWhere((chat) => chat.chatId == chatId);
    if (activeChatId == chatId) {
      quitActiveChatEvent();
      activeChatId = '';
    }
  }

  updateChatList(ChatData newChat) {
    if (newChat.isOwner) {
      joinedChats.value = [...joinedChats.value, newChat];
    } else {
      joinableChats.value = [...joinableChats.value, newChat];
    }
    update();
  }

  quitActiveChatEvent() {
    events.emit('quit');
  }

  getEvents() {
    return events;
  }

  resetMessages() {
    print('resetting messages');
    messagesNotifier.value = [];
  }
}
