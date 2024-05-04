import 'package:client_leger/constants/preferences.dart';
import 'package:client_leger/interfaces/preferences.dart';
import 'package:client_leger/services/account_service.dart';
import 'package:client_leger/services/preferences_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shared_preferences/shared_preferences.dart';

const String LANGUAGE_CODE = 'languageCode';

class LanguageService {
  final PreferencesService preferencesService = PreferencesService();

  Preferences preferences = Preferences(
      userId: '',
      language: LanguageType.english.value,
      theme: ThemeType.dark.value,
      music: MusicType.goodresult.value);

  Future<Locale> getLocale() async {
    SharedPreferences pref = await SharedPreferences.getInstance();
    String? languageCode =
        pref.getString(LANGUAGE_CODE) ?? LanguageType.french.value;

    if (await AccountService.to.isLoggedIn()) {
      final userInfo = await AccountService.to.getAccountInfo();
      final userId = userInfo.id!;
      await preferencesService.getAccountPreferences(userId);
      preferences = preferencesService.preferences;
      languageCode = preferences.language;
    }
    return _locale(languageCode!);
  }

  Future<Locale> setLocale(String languageCode) async {
    SharedPreferences pref = await SharedPreferences.getInstance();
    await pref.setString(LANGUAGE_CODE, languageCode);

    if (await AccountService.to.isLoggedIn()) {
      preferences = preferencesService.preferences;
      preferences.language = languageCode;

      await preferencesService.updateAccountPreferences(
          preferences, PreferencesCategory.language.name);
    }
    return _locale(languageCode);
  }

  Locale _locale(String languageCode) {
    switch (languageCode) {
      case FRENCH:
        return const Locale(FRENCH, 'FR');
      case ENGLISH:
        return const Locale(ENGLISH, "CA");
      case SPANISH:
        return const Locale(SPANISH, "SP");
      default:
        return const Locale(FRENCH, 'FR');
    }
  }
}

AppLocalizations translation(BuildContext context) {
  return AppLocalizations.of(context)!;
}
