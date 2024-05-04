import 'package:client_leger/widgets/side_chat.dart';
import 'package:flutter/material.dart';

class CustomBottomNavigationBar extends StatelessWidget {
  final ChatState currentPage;
  final Function(ChatState) onPageChanged;

  const CustomBottomNavigationBar({
    Key? key,
    required this.currentPage,
    required this.onPageChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: currentPage.index,
      onTap: (index) {
        if (index == 0) {
          onPageChanged(ChatState.joined);
        } else if (index == 1) {
          onPageChanged(ChatState.joinable);
        } else if (index == 2) {
          onPageChanged(ChatState.create);
        }
      },
      items: const [
        BottomNavigationBarItem(
          icon: Icon(Icons.chat),
          label: 'Joined',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.add),
          label: 'Joinable',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.create),
          label: 'Create',
        ),
      ],
    );
  }
}
