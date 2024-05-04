import 'package:client_leger/widgets/side_chat.dart';
import 'package:flutter/material.dart';

class TestPage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<TestPage> {
  bool _isPanelOpen = false;

  void _togglePanel() {
    setState(() {
      _isPanelOpen = !_isPanelOpen;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          GestureDetector(
            onTap: () {
              if (_isPanelOpen) {
                _togglePanel();
              }
            },
            child: Container(
              color: Colors.white,
              child: const Center(
                child: Text('Main Content'),
              ),
            ),
          ),
          SideChat(isPanelOpen: _isPanelOpen),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _togglePanel,
        child: Icon(Icons.snapchat_sharp),
      ),
    );
  }
}
