import 'package:client_leger/classes/language.dart';
import 'package:client_leger/classes/language_constant.dart';
import 'package:client_leger/main.dart';
import 'package:flutter/material.dart';

class LanguageDropdown extends StatefulWidget {
  const LanguageDropdown({super.key});

  @override
  LanguageDropdownState createState() => LanguageDropdownState();
}

class LanguageDropdownState extends State<LanguageDropdown> {
  final LanguageService languageService = LanguageService();

  @override
  void initState() {
    super.initState();
    setLanguageInDropdown();
  }
  
  setLanguageInDropdown() async {
    if (!mounted) return;
    Locale locale = await languageService.getLocale();
    if (!mounted) return;
    MainApp.setLocale(context, locale);
  }

  @override
  Widget build(BuildContext context) {
    return DropdownButton<Language>(
      underline: const SizedBox(),
      icon: Icon(Icons.language, color: Theme.of(context).primaryColor),
      onChanged: (Language? language) async {
        if (language != null) {
          Locale locale = await languageService.setLocale(language.code);
          MainApp.setLocale(context, locale);
        }
      },
      items: Language.getLanguages().map<DropdownMenuItem<Language>>(
        (Language language) {
          return DropdownMenuItem<Language>(
            value: language,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: <Widget>[Text(language.name)],
            ),
          );
        },
      ).toList(),
    );
  }
}
