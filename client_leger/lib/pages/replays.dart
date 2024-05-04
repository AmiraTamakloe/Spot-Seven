import 'package:client_leger/interfaces/dto/replay.dto.dart';
import 'package:client_leger/services/replay_page_service.dart';
import 'package:client_leger/services/replay_start_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

class ReplaysPage extends StatelessWidget {
  const ReplaysPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Replays Page'),
      ),
      body: const DefaultTabController(
        length: 2,
        child: Column(
          children: [
            TabBar(
              tabs: [
                Tab(text: 'Public Replays'),
                Tab(text: 'My Replays'),
              ],
            ),
            ReplayTabs(),
          ],
        ),
      ),
    );
  }
}

class ReplayTabs extends StatelessWidget {
  const ReplayTabs({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
        future: ReplayPageService.to.getReplays(),
        builder: ((BuildContext context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const CircularProgressIndicator();
          }

          return Expanded(
            child: TabBarView(
              children: [
                ReplaysListPage(
                  isUserReplays: false,
                  replays: ReplayPageService.to.publicReplays,
                ),
                ReplaysListPage(
                  isUserReplays: true,
                  replays: ReplayPageService.to.userReplays,
                ),
              ],
            ),
          );
        }));
  }
}

class ReplaysListPage extends StatelessWidget {
  final bool isUserReplays;
  final List<ReplayDto> replays;

  const ReplaysListPage(
      {super.key, required this.isUserReplays, required this.replays});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Obx(() => ListView.builder(
            itemCount: replays.length,
            itemBuilder: (context, index) {
              return ReplayCard(
                key: UniqueKey(),
                isUserReplay: isUserReplays,
                replay: replays[index],
              );
            },
          )),
    );
  }
}

class ReplayCard extends StatelessWidget {
  final bool isUserReplay;
  final ReplayDto replay;

  const ReplayCard({
    super.key,
    required this.isUserReplay,
    required this.replay,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      padding: const EdgeInsets.all(8.0),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey),
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: ListTile(
        title: Text(
          "${replay.user} on ${replay.gameName} played on ${DateFormat.yMMMMd('en_US').add_jms().format(DateTime.parse(replay.createdAt))}",
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        trailing: _buildActions(),
      ),
    );
  }

  Widget _buildActions() {
    var replayButton = TextButton(
      onPressed: () {
        ReplayStartService.to.viewReplay(replay.id);
      },
      child: const Text('Replay'),
    );

    if (!isUserReplay) {
      return replayButton;
    } else {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          replayButton,
          const SizedBox(width: 8),
          IconButton(
            onPressed: () {
              ReplayPageService.to.toggleReplayVisibility(replay.id);
            },
            tooltip: 'Toggle visibility',
            icon:
                Icon(replay.isPublic ? Icons.visibility : Icons.visibility_off),
          ),
          const SizedBox(width: 8),
          TextButton(
            onPressed: () {
              ReplayPageService.to.deleteReplay(replay.id);
            },
            child: const Text('Delete'),
          ),
        ],
      );
    }
  }
}
