import 'package:client_leger/constants/preferences.dart';
import 'package:client_leger/environments/environment.dart';
import 'package:client_leger/interfaces/preferences.dart';
import 'package:client_leger/services/account_service.dart';
import 'package:client_leger/services/preferences_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

final String baseUrl = environment['serverUrl'];
const Color darkBackgroundColor = Color(0xFF274472);
const Color lightBackgroundColor = Color(0xFF90D5F3);
const pirataFontFamily = 'Pirata';

class ThemeController extends GetxController {
  RxBool isDark = false.obs;
  final PreferencesService preferencesService = PreferencesService();

  Preferences preferences = Preferences(
      userId: '',
      language: LanguageType.english.value,
      theme: ThemeType.dark.value,
      music: MusicType.goodresult.value);

  setTheme() {
    Get.changeTheme(isDark.value ? darkTheme : lightTheme);
  }

  Future<bool> getTheme() async {
    if (await AccountService.to.isLoggedIn()) {
      final userInfo = await AccountService.to.getAccountInfo();
      final userId = userInfo.id!;
      await preferencesService.getAccountPreferences(userId);
      preferences = preferencesService.preferences;
      isDark.value = preferences.theme == ThemeType.dark.value;
      setTheme();
    }
    return isDark.value;
  }

  Future<void> toggleTheme() async {
    isDark.value = !isDark.value;
    setTheme();
    final theme = isDark.value ? ThemeType.dark.value : ThemeType.light.value;
    if (await AccountService.to.isLoggedIn()) {
      preferences.theme = theme;
      await preferencesService.updateAccountPreferences(
          preferences, PreferencesCategory.theme.name);
    }
  }

  Color getBackgroundColor() {
    return isDark.value ? darkBackgroundColor : lightBackgroundColor;
  }
}

ThemeData lightTheme = ThemeData(
  brightness: Brightness.light,
  colorScheme: const ColorScheme.light(
    background: lightBackgroundColor,
  ),
  scaffoldBackgroundColor: Color.fromARGB(255, 113, 212, 255),
  primaryColor: Colors.black,
  appBarTheme: const AppBarTheme(
    backgroundColor: lightBackgroundColor,
  ),
  fontFamily: pirataFontFamily,
  textTheme: const TextTheme(
    displayLarge: TextStyle(fontFamily: pirataFontFamily, color: Colors.black),
    displayMedium: TextStyle(fontFamily: pirataFontFamily, color: Colors.black),
    displaySmall: TextStyle(fontFamily: pirataFontFamily, color: Colors.black),
    headlineMedium:
        TextStyle(fontFamily: pirataFontFamily, color: Colors.black),
    headlineSmall: TextStyle(fontFamily: pirataFontFamily, color: Colors.black),
    titleLarge: TextStyle(fontFamily: pirataFontFamily, color: Colors.black),
    titleMedium: TextStyle(fontFamily: pirataFontFamily, color: Colors.black),
    titleSmall: TextStyle(fontFamily: pirataFontFamily, color: Colors.black),
    bodyLarge: TextStyle(fontFamily: pirataFontFamily, color: Colors.black),
    bodyMedium: TextStyle(fontFamily: pirataFontFamily, color: Colors.black),
    bodySmall: TextStyle(fontFamily: pirataFontFamily, color: Colors.black),
    labelLarge:
        TextStyle(fontFamily: pirataFontFamily, color: darkBackgroundColor),
    labelSmall: TextStyle(fontFamily: pirataFontFamily, color: Colors.black),
  ),
  inputDecorationTheme: const InputDecorationTheme(
    filled: true,
    fillColor: Color.fromARGB(255, 114, 193, 243),
  ),
  buttonTheme: const ButtonThemeData(
    buttonColor: Colors.white, // Button color in light mode
    textTheme: ButtonTextTheme.normal,
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4.0)),
      backgroundColor: const Color.fromARGB(255, 186, 224, 248),
      textStyle: const TextStyle(
        color: Colors.black,
      ), // Elevated button color in light mode
    ),
  ),
  toggleButtonsTheme: const ToggleButtonsThemeData(
    color: Colors.white, // Toggleable button color in light mode
    selectedColor:
        Colors.black, // Toggleable button selected color in light mode
  ),
  iconTheme: const IconThemeData(color: Colors.white), // Add icon theme data
  
);

ThemeData darkTheme = ThemeData(
  brightness: Brightness.dark,
  primaryColor: Colors.white,
  colorScheme: const ColorScheme.dark(
    background: darkBackgroundColor,
  ),
  scaffoldBackgroundColor: const Color.fromARGB(255, 0, 19, 58),
  appBarTheme: const AppBarTheme(
    backgroundColor: darkBackgroundColor,
  ),
  fontFamily: pirataFontFamily,
  textTheme: const TextTheme(
    displayLarge: TextStyle(fontFamily: pirataFontFamily, color: Colors.white),
    displayMedium: TextStyle(fontFamily: pirataFontFamily, color: Colors.white),
    displaySmall: TextStyle(fontFamily: pirataFontFamily, color: Colors.white),
    headlineMedium:
        TextStyle(fontFamily: pirataFontFamily, color: Colors.white),
    headlineSmall: TextStyle(fontFamily: pirataFontFamily, color: Colors.white),
    titleLarge: TextStyle(fontFamily: pirataFontFamily, color: Colors.white),
    titleMedium: TextStyle(fontFamily: pirataFontFamily, color: Colors.white),
    titleSmall: TextStyle(fontFamily: pirataFontFamily, color: Colors.white),
    bodyLarge: TextStyle(fontFamily: pirataFontFamily, color: Colors.white),
    bodyMedium: TextStyle(fontFamily: pirataFontFamily, color: Colors.white),
    bodySmall: TextStyle(fontFamily: pirataFontFamily, color: Colors.white),
    labelLarge:
        TextStyle(fontFamily: pirataFontFamily, color: darkBackgroundColor),
    labelSmall: TextStyle(fontFamily: pirataFontFamily, color: Colors.white),
  ),
  inputDecorationTheme: const InputDecorationTheme(
    filled: true,
    fillColor: Color.fromARGB(255, 0, 44, 83),
  ),
  buttonTheme: const ButtonThemeData(
    buttonColor: Colors.black, // Button color in dark mode
    textTheme: ButtonTextTheme.normal,
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4.0)),
      backgroundColor: const Color.fromARGB(255, 0, 43, 130),
      textStyle: const TextStyle(
        color: Colors.white, // Text color for ElevatedButton in light mode
      ), // Elevated button color in dark mode
    ),
  ),
  toggleButtonsTheme: const ToggleButtonsThemeData(
    color: Colors.black, // Toggleable button color in dark mode
    selectedColor:
        Colors.white, // Toggleable button selected color in dark mode
  ),
  iconTheme: const IconThemeData(color: Colors.black), // Add icon theme data
);
