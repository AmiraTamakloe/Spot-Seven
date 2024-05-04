// import 'package:client_leger/firebase_options.dart';
import 'package:client_leger/bindings/chat_bindings.dart';
import 'package:client_leger/bindings/global_bingings.dart';
import 'package:client_leger/bindings/replays_bindings.dart';
import 'package:client_leger/bindings/selection_bindings.dart';
import 'package:client_leger/bindings/socket_bindings.dart';
import 'package:client_leger/classes/language_constant.dart';
import 'package:client_leger/pages/account_creation.dart';
import 'package:client_leger/pages/account_parameter.dart';
import 'package:client_leger/pages/friends.dart';
import 'package:client_leger/pages/home.dart';
import 'package:client_leger/pages/login.dart';
import 'package:client_leger/pages/replays.dart';
import 'package:client_leger/pages/selection.dart';
import 'package:client_leger/pages/statistic.dart';
import 'package:client_leger/pages/temp_classic_game.dart';
import 'package:client_leger/pages/temp_limited_game.dart';
import 'package:client_leger/services/theme_switch_service.dart';
import 'package:client_leger/widgets/top_bar.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:get/route_manager.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
//   await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(const MainApp());
}

class MainApp extends StatefulWidget {
  const MainApp({super.key});

  @override
  _MainAppState createState() => _MainAppState();

  static void setLocale(BuildContext context, Locale newLocale) {
    _MainAppState? state = context.findAncestorStateOfType<_MainAppState>();
    state?.setLocale(newLocale);
  }
}

class _MainAppState extends State<MainApp> {
  Locale? _locale;
  LanguageService languageService = LanguageService();

  setLocale(Locale locale) {
    setState(() {
      _locale = locale;
    });
  }

  @override
  void didChangeDependencies() {
    languageService.getLocale().then((locale) => {setLocale(locale)});
    super.didChangeDependencies();
  }

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: 'Spot Seven',
      initialRoute: '/login',
      initialBinding: GlobalBinding(),
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      locale: _locale,
      getPages: [
        GetPage(name: '/statistic', page: () => const StatisticPage()),
        GetPage(
            name: '/home',
            page: () => const HomePage(),
            bindings: [ChatBinding(), SocketBinding()]),
        GetPage(name: '/login', page: () => const LoginPage()),
        GetPage(
            name: '/friend',
            page: () => Scaffold(
                  appBar: TopBar(),
                  body: FriendsPage(),
                ),
            binding: ChatBinding()),
        GetPage(
            name: '/account-creation',
            page: () => const AccountCreationPage(),
            binding: ChatBinding()),
        // TODO: Replace by creating selection page each time
        GetPage(
            name: '/selection',
            page: () => SelectionPage(),
            binding: SelectionBinding()),
        GetPage(
            name: '/classic',
            page: () => const TempClassicPage(),
            binding: ChatBinding()),
        GetPage(
            name: '/time-limited',
            page: () => const TempLimitedPage(),
            binding: ChatBinding()),
        GetPage(
            name: '/account-parameter',
            page: () => const AccountParameterPage()),
        GetPage(
            name: '/replays',
            page: () => const ReplaysPage(),
            bindings: [ReplaysPageBindings()]),
      ],
      debugShowCheckedModeBanner: false,
      theme: lightTheme,
      darkTheme: darkTheme,
    );
  }
}
