import 'package:client_leger/services/theme_switch_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ThemeSwitch extends StatelessWidget {
  const ThemeSwitch({super.key});

  @override
  Widget build(BuildContext context) {
    final themeManager = Get.put(ThemeController());
    themeManager.getTheme();
    return Obx(() => ElevatedButton(
        onPressed: themeManager.toggleTheme,
        style: ElevatedButton.styleFrom(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(25.0)),
          backgroundColor: Theme.of(context).scaffoldBackgroundColor,
          shadowColor: Colors.transparent,
        ),
        child: Icon(
            themeManager.isDark.value
                ? Icons.light_mode_rounded
                : Icons.dark_mode_rounded,
            color: themeManager.isDark.value ? Colors.white : Colors.black)));
  }
}
