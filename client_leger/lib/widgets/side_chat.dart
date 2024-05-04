import 'dart:async';

import 'package:chat_bubbles/chat_bubbles.dart';
import 'package:client_leger/interfaces/chat/chat_data.dart';
import 'package:client_leger/interfaces/chat/chat_message.dart';
import 'package:client_leger/interfaces/chat/message_data.dart';
import 'package:client_leger/services/chat_service.dart';
import 'package:client_leger/services/token_service.dart';
import 'package:client_leger/widgets/chat_bubble.dart';
import 'package:client_leger/widgets/create_chat.dart';
import 'package:flutter/material.dart';

class SideChat extends StatefulWidget {
  final chatService = ChatService();
  final tokenService = TokenService();
  SideChat({
    super.key,
    required this.isPanelOpen,
  });

  final bool isPanelOpen;

  @override
  State<SideChat> createState() => _SideChatState();
}

enum ChatState { joined, joinable, create, convo }

class _SideChatState extends State<SideChat> {
  ChatState _currentPage = ChatState.joined;
  ChatState page = ChatState.joined;
  @override
  void initState() {
    super.initState();
  }

  Future<void> _changePage(ChatState page) async {
    setState(() {
      _currentPage = page;
    });
  }

  @override
  Widget build(BuildContext context) {
    void convoClicked(String chatId, String chatName) {
      if (_currentPage == ChatState.joinable) {
        ChatService.to.resetMessages();
        ChatService.to.joinChat(chatId, widget.tokenService.getUsername());
      } else {
        ChatService.to.selectChat(chatId, widget.tokenService.getUsername());
      }
      _changePage(ChatState.convo);
    }

    void goToPage(ChatState page) {
      _changePage(page);
    }

    Widget currentPage;
    switch (_currentPage) {
      case ChatState.joined:
        currentPage = ValueListenableBuilder(
          valueListenable: ChatService.to.joinedChats,
          builder: (context, chats, child) {
            List<ChatData> _chats = chats as List<ChatData>;
            return Container(
              height: MediaQuery.of(context).size.height - 56,
              color: Colors.green,
              child: ListView.builder(
                padding: const EdgeInsets.all(8),
                itemCount: _chats.length,
                itemBuilder: (BuildContext context, int index) {
                  return GestureDetector(
                    onTap: () => convoClicked(
                        _chats[index].chatId, _chats[index].chatname),
                    child: ChatBubble(chatname: _chats[index].chatname),
                  );
                },
              ),
            );
          },
        );
        break;
      case ChatState.joinable:
        currentPage = ValueListenableBuilder(
          valueListenable: ChatService.to.joinableChats,
          builder: (context, chats, child) {
            List<ChatData> _chats = chats as List<ChatData>;
            return Container(
              height: MediaQuery.of(context).size.height - 56,
              color: const Color.fromARGB(255, 175, 76, 81),
              child: ListView.builder(
                padding: const EdgeInsets.all(8),
                itemCount: _chats.length,
                itemBuilder: (BuildContext context, int index) {
                  return GestureDetector(
                    onTap: () => convoClicked(
                        _chats[index].chatId, _chats[index].chatname),
                    child: ChatBubble(chatname: _chats[index].chatname),
                  );
                },
              ),
            );
          },
        );
        break;
      case ChatState.convo:
        currentPage = Container(
          height: MediaQuery.of(context).size.height - 56,
          color: Color(0xFFD9D9D9),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ConvoChat(
                    chatService: ChatService.to,
                    username: widget.tokenService.getUsername()),
              ],
            ),
          ),
        );
        break;
      case ChatState.create:
        currentPage = Container(
          height: MediaQuery.of(context).size.height - 56,
          color: Color.fromARGB(255, 96, 163, 218),
          child: Center(
            child: CreateChat(
              chatService: ChatService.to,
              switchToJoinedEvent: () => {
                ChatService.to
                    .getJoinedChats(widget.tokenService.getUsername()),
                goToPage(ChatState.joined)
              },
            ),
          ),
        );
        break;
    }

    return AnimatedPositioned(
      duration: const Duration(milliseconds: 300),
      left: widget.isPanelOpen ? 0 : -400,
      child: Container(
        width: 400,
        height: MediaQuery.of(context).size.height,
        color: Colors.white,
        child: SingleChildScrollView(
          child: Column(
            children: [
              currentPage,
              Row(children: [
                Container(
                  height: 56.0,
                  width: 100.0,
                  child: FittedBox(
                    child: TextButton(
                      onPressed: () => {
                        ChatService.to
                            .getJoinedChats(widget.tokenService.getUsername()),
                        goToPage(ChatState.joined)
                      },
                      child: Column(
                        children: [
                          Icon(Icons.chat,
                              color: _currentPage == ChatState.joined
                                  ? Colors.blue
                                  : const Color.fromARGB(255, 84, 84, 84)),
                          Text('Joined',
                              style: TextStyle(
                                  color: _currentPage == ChatState.joined
                                      ? Colors.blue
                                      : const Color.fromARGB(255, 84, 84, 84))),
                        ],
                      ),
                    ),
                  ),
                ),
                Spacer(),
                Container(
                  height: 56.0,
                  width: 100.0,
                  child: FittedBox(
                    child: TextButton(
                      onPressed: () => {
                        ChatService.to.getJoinableChats(
                            widget.tokenService.getUsername()),
                        goToPage(ChatState.joinable)
                      },
                      child: Column(
                        children: [
                          Icon(Icons.add,
                              color: _currentPage == ChatState.joinable
                                  ? Colors.blue
                                  : const Color.fromARGB(255, 84, 84, 84)),
                          Text('Joinable',
                              style: TextStyle(
                                  color: _currentPage == ChatState.joinable
                                      ? Colors.blue
                                      : const Color.fromARGB(255, 84, 84, 84))),
                        ],
                      ),
                    ),
                  ),
                ),
                Spacer(),
                Container(
                  height: 56.0,
                  width: 100.0,
                  child: FittedBox(
                    child: TextButton(
                      onPressed: () => {goToPage(ChatState.create)},
                      child: Column(
                        children: [
                          Icon(Icons.create,
                              color: _currentPage == ChatState.create
                                  ? Colors.blue
                                  : const Color.fromARGB(255, 84, 84, 84)),
                          Text('Create',
                              style: TextStyle(
                                  color: _currentPage == ChatState.create
                                      ? Colors.blue
                                      : const Color.fromARGB(255, 84, 84, 84))),
                        ],
                      ),
                    ),
                  ),
                ),
              ])
            ],
          ),
        ),
      ),
    );
  }
}

class ConvoChat extends StatefulWidget {
  final ChatService chatService;
  final String username;
  const ConvoChat({Key? key, required this.chatService, required this.username})
      : super(key: key);

  @override
  State<ConvoChat> createState() => _ConvoChatState();
}

class _ConvoChatState extends State<ConvoChat> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  String _chatname = '';
  @override
  void initState() {
    print('init state convo chat');
    getData();
    super.initState();
  }

  Future<void> getData() async {
    ChatService.to.resetMessages();
    await ChatService.to.getChatName(ChatService.to.activeChatId);
    await ChatService.to.getUserId(widget.username);
    await ChatService.to
        .selectChat(ChatService.to.activeChatId, widget.username);
    setState(() {
      _chatname = ChatService.to.chatName;
    });
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder(
      valueListenable: ChatService.to.messagesNotifier,
      builder: (context, messages, child) {
        List<MessageData> _messages = messages as List<MessageData>;
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        });

        return Column(
          children: [
            Padding(
              padding: EdgeInsets.only(top: 15.0),
              child: Text(ChatService.to.chatName),
            ),
            SizedBox(
              height: MediaQuery.of(context).size.height - 156,
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(8),
                itemCount: _messages.length,
                itemBuilder: (BuildContext context, int index) {
                  return BubbleSpecialThree(
                    text:
                        '${_messages[index].chatMessage.author} : ${_messages[index].chatMessage.content}',
                    color: _messages[index].authorId == ChatService.to.userId
                        ? const Color.fromARGB(255, 151, 187, 222)
                        : const Color.fromARGB(255, 65, 137, 204),
                    tail: false,
                    isSender:
                        _messages[index].authorId == ChatService.to.userId,
                    textStyle: TextStyle(color: Colors.white, fontSize: 16),
                  );
                },
              ),
            ),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _textController,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      labelText: 'Enter your message',
                    ),
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    ChatMessage chat = ChatMessage(
                        author: widget.username,
                        content: _textController.text,
                        time: DateTime.now(),
                        destination: ChatService.to.activeChatId);
                    ChatService.to.sendMessage(chat);
                    _textController.clear();
                  },
                  child: const Text('Send'),
                ),
              ],
            ),
          ],
        );
      },
    );
  }
}
