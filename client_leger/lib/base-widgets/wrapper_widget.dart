import 'package:client_leger/pages/account_creation.dart';
import 'package:client_leger/pages/login.dart';
import 'package:client_leger/services/theme_switch_service.dart';
import 'package:client_leger/widgets/side_chat.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class WrapperWidget extends StatefulWidget {
  final Widget child;

  const WrapperWidget({Key? key, required this.child});

  @override
  State<WrapperWidget> createState() => _WrapperWidgetState();
}

class _WrapperWidgetState extends State<WrapperWidget> {
  bool _isPanelOpen = false;

  void _togglePanel() {
    setState(() {
      _isPanelOpen = !_isPanelOpen;
    });
  }

  @override
  Widget build(BuildContext context) {
    bool isInvalidPage = false;

    void checkParent(BuildContext context) {
      context.visitAncestorElements((element) {
        if (element.widget is LoginPage ||
            element.widget is AccountCreationPage) {
          isInvalidPage = true;
          return false;
        }
        return true;
      });
    }

    final themeManager = Get.find<ThemeController>();
    checkParent(context);

    return Obx(
      () => Scaffold(
        body: Stack(
          children: [
            Container(
              height: MediaQuery.of(context).size.height,
              width: MediaQuery.of(context).size.width,
              color: Theme.of(context).scaffoldBackgroundColor,
              padding: const EdgeInsets.all(30.0),
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12.5),
                  color: themeManager.getBackgroundColor(),
                ),
                child: widget.child,
              ),
            ),
            if (!isInvalidPage) // Only show SideChat if not on the LoginPage
              SideChat(isPanelOpen: _isPanelOpen),
          ],
        ),
        floatingActionButton: !isInvalidPage
            ? FloatingActionButton(
                onPressed: _togglePanel,
                child: Icon(Icons.snapchat),
              )
            : null,
      ),
    );
  }
}
