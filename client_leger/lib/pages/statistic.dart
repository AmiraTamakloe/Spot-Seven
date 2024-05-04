import 'package:client_leger/classes/language_constant.dart';
import 'package:client_leger/interfaces/statistic.dart';
import 'package:client_leger/services/account_service.dart';
import 'package:client_leger/services/statistic_service.dart';
import 'package:client_leger/widgets/top_bar.dart';
import 'package:flutter/material.dart';

class StatisticPage extends StatefulWidget {
  const StatisticPage({super.key});

  @override
  State createState() => _StatisticPageState();
}

  final lightModeBackground = [
    const Color(0xFFB0DFE8),
    const Color(0xFFDDE7E9),
    const Color(0xFF11CFCF)
  ];
  final darkModeBackground = [
    const Color.fromARGB(255, 2, 44, 53),
    const Color.fromARGB(255, 158, 159, 230),
    const Color.fromARGB(255, 15, 0, 102)
  ];

class _StatisticPageState extends State<StatisticPage> {
  final StatisticService statisticService = StatisticService();
  late Statistic _userStatistics;
  bool loaded = false;

  @override
  void initState() {
    super.initState();
    getData();
  }

  Future<void> getData() async {
    final userInfo = await AccountService.to.getAccountInfo();
    await statisticService.getStatistics(userInfo.id!);
    setState(() {
      _userStatistics = statisticService.statistics;
      loaded = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!loaded) {
      return const CircularProgressIndicator();
    } else {
      return Scaffold(
        body: Container(
          height: MediaQuery.of(context).size.height,
          width: double.infinity,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12.5),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: Theme.of(context).brightness == Brightness.light
                  ? lightModeBackground
                  : darkModeBackground,
              stops: const [0.0, 0.5, 1.0],
            ),
          ),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TopBar(),
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20.0,
                    vertical: 10.0,
                  ),
                  child: Text(
                    translation(context).accountStatistic,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 50.0,
                      fontFamily: 'Pirata',
                      color: Colors.black,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20.0),
                  child: Column(
                    children: [
                      StatisticCard(
                        title: translation(context).numberPlayedGames,
                        value: _userStatistics.gamesPlayed,
                      ),
                      StatisticCard(
                        title: translation(context).numberOfGamesWon,
                        value: _userStatistics.gamesWon,
                      ),
                      StatisticCard(
                        title: translation(context).averageDiffPerGame,
                        value: _userStatistics.averageScore,
                      ),
                      StatisticCard(
                        title: translation(context).timeAveragePerGame,
                        value: _userStatistics.averageTime,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }
  }
}

class StatisticCard extends StatelessWidget {
  final String title;
  final dynamic value;

  const StatisticCard({Key? key, required this.title, required this.value})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 500,
      height: 140.0,
      child: Container(
        margin: const EdgeInsets.only(bottom: 20.0),
        padding: const EdgeInsets.all(20.0),
        decoration: BoxDecoration(
          color: Colors.grey[200],
          borderRadius: BorderRadius.circular(10.0),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 6,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 20.0,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            const SizedBox(height: 7.0),
            Text(
              value.toString(),
              style: const TextStyle(
                fontSize: 24.0,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
