import 'package:client_leger/services/account_service.dart';
import 'package:client_leger/widgets/language_dropdown.dart';
import 'package:client_leger/widgets/music_selector.dart';
import 'package:client_leger/widgets/theme_switch.dart';
import 'package:client_leger/widgets/user_dropdown.dart';
import 'package:flutter/material.dart';
import 'package:in_app_notification/in_app_notification.dart';

class TopBar extends StatefulWidget implements PreferredSizeWidget {
  TopBar({Key? key}) : super(key: key);
  @override
  State<TopBar> createState() => _TopBarState();

  @override
  Size get preferredSize => Size.fromHeight(kToolbarHeight);
}

class _TopBarState extends State<TopBar> {
  bool isLoggedIn = false;

  @override
  void initState() {
    super.initState();
    checkLogin();
  }

  Future<bool> checkLogin() async {
    if (await AccountService.to.isLoggedIn()) {
      setState(() {
        isLoggedIn = true;
      });
    } else {
      setState(() {
        isLoggedIn = false;
      });
    }
    return isLoggedIn;
  }

  @override
  Widget build(BuildContext context) {
    return InAppNotification(
        child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      color: Theme.of(context).colorScheme.background,
      child: Row(
        children: [
          if (isLoggedIn) const UserDropdown(),
          Expanded(
            flex: 1,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                const ThemeSwitch(),
                const SizedBox(width: 16),
                const LanguageDropdown(),
                const SizedBox(width: 30),
                if (isLoggedIn) const MusicSelector(),
              ],
            ),
          ),
        ],
      ),
    ));
  }
}
