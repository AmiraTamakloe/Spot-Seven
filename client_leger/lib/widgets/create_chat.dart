import 'package:client_leger/services/chat_service.dart';
import 'package:client_leger/services/token_service.dart';
import 'package:flutter/material.dart';

class CreateChat extends StatefulWidget {
  final ChatService chatService;
  final VoidCallback switchToJoinedEvent;
  CreateChat(
      {Key? key, required this.chatService, required this.switchToJoinedEvent})
      : super(key: key);

  @override
  State<CreateChat> createState() => _CreateChatState();
}

class _CreateChatState extends State<CreateChat> {
  final TokenService tokenService = TokenService();
  final TextEditingController chatNameController = TextEditingController();
  @override
  Widget build(BuildContext context) {
    Future<void> createChat(String chatName) async {
      print('Creating chat with name: $chatName');
      await widget.chatService.createChat(chatName, tokenService.getUsername());

      widget.switchToJoinedEvent();
    }

    return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text('Create a new chat'),
          const SizedBox(height: 16),
          TextFormField(
            controller: chatNameController,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              labelText: 'Enter your chat name',
            ),
          ),
          ElevatedButton(
            onPressed: () {
              createChat(chatNameController.text);
            },
            child: const Text('Create'),
          ),
        ]);
  }
}
