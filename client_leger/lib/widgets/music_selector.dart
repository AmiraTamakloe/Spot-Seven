import 'package:client_leger/classes/language_constant.dart';
import 'package:client_leger/constants/preferences.dart';
import 'package:client_leger/services/sound_service.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:in_app_notification/in_app_notification.dart';

class MusicSelector extends StatefulWidget {
  const MusicSelector({super.key});
  @override
  MusicSelectorState createState() => MusicSelectorState();
}

class MusicSelectorState extends State<MusicSelector> {
  final SoundService soundService = SoundService();
  late List<MusicOption> musicOptions;

  @override
  void initState() {
    super.initState();
    musicOptions = [
      MusicOption(
        music: MusicType.goodresult,
        icon: FontAwesomeIcons.trophy,
        label: 'GOOD RESULT',
      ),
      MusicOption(
        music: MusicType.levelwin,
        icon: FontAwesomeIcons.rankingStar,
        label: 'LEVEL WIN',
      ),
      MusicOption(
        music: MusicType.medieval,
        icon: FontAwesomeIcons.democrat,
        label: 'MEDIEVAL FANFARE',
      ),
      MusicOption(
        music: MusicType.tadaa,
        icon: FontAwesomeIcons.guitar,
        label: 'TA DAAA',
      ),
      MusicOption(
        music: MusicType.successtrumpets,
        icon: FontAwesomeIcons.medal,
        label: 'SUCCESS TRUMPETS',
      ),
      MusicOption(
        music: MusicType.uploaded,
        icon: FontAwesomeIcons.folderPlus,
        label: 'YOUR OWN MUSIC',
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () {
        _openMusicChoices(context);
      },
      style: ElevatedButton.styleFrom(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(25.0)),
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        shadowColor: Colors.transparent,
      ),
      child: (Icon(Icons.music_note_rounded,
          color: Theme.of(context).primaryColor)),
    );
  }

  playMusic(String music) async {
    soundService.playVictoryMusicFromAsset(music);
  }

  Future<void> _openMusicChoices(BuildContext context) async {
    String selectedMusic = await soundService.getWinningSoundEffect();
    MusicOption newSelectedMusic = musicOptions[0];
    final selectedMusicOption = await showDialog<MusicOption>(
      context: context,
      builder: (BuildContext context) {
        return SimpleDialog(
          title: Text(translation(context).selectVictoryMusic),
          children: <Widget>[
            Align(
              alignment: Alignment.center,
              child: Text(
                translation(context).selectMusicToPlay,
                style: TextStyle(color: Theme.of(context).primaryColor),
              ),
            ),
            Align(
              alignment: Alignment.center,
              child: Text(
                '${translation(context).yourCurrentMusicIs} $selectedMusic !!!',
                style: TextStyle(color: Theme.of(context).primaryColor),
              ),
            ),
            for (final option in musicOptions)
              SimpleDialogOption(
                onPressed: () {
                  selectedMusic = option.music.name;
                  newSelectedMusic = option;
                  if (option.music == MusicType.uploaded) {
                    soundService.uploadVictoryMusic();
                  } else {
                    playMusic(option.music.value);
                  }
                },
                child: Row(
                  children: [
                    Icon(
                      option.icon,
                      color: Color.fromARGB(255, 184, 161, 32),
                    ),
                    Text('     ${option.label}'),
                  ],
                ),
              ),
            const SizedBox(height: 15),
            Text(
              translation(context).musicNote,
              style: TextStyle(color: Theme.of(context).primaryColor),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context, newSelectedMusic);
              },
              child: Text(
                translation(context).saveAndClose,
                style: TextStyle(
                  fontSize: 16,
                  color: Theme.of(context).primaryColor,
                ),
              ),
            ),
          ],
        );
      },
    );

    if (selectedMusicOption != null) {
      updateSelectedMusic(
          context, newSelectedMusic.music, newSelectedMusic.label);
    }
  }

  void updateSelectedMusic(
      BuildContext context, MusicType music, String notificationText) {
    soundService.setNewWinningSoundEffect(music.name);
    InAppNotification.show(
      child: NotificationBody(
        text: notificationText,
      ),
      context: context,
      onTap: () => () {},
      duration: const Duration(milliseconds: 3000),
    );
  }
}

class NotificationBody extends StatelessWidget {
  final String text;
  final IconData icon;

  const NotificationBody({
    super.key,
    this.text = '',
    this.icon = (Icons.music_note_rounded),
  });

  @override
  Widget build(BuildContext context) {
    const minHeight = 100.0;
    return ConstrainedBox(
      constraints: const BoxConstraints(minHeight: minHeight),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
        child: DecoratedBox(
          decoration: BoxDecoration(
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                spreadRadius: 12,
                blurRadius: 16,
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: Color.fromARGB(255, 54, 0, 190).withOpacity(0.4),
                borderRadius: BorderRadius.circular(16.0),
                border: Border.all(
                  width: 10,
                  color:
                      const Color.fromARGB(255, 118, 179, 49).withOpacity(0.2),
                ),
              ),
              child: Padding(
                padding: EdgeInsets.only(
                    left: MediaQuery.of(context).size.width * 0.30),
                child: Center(
                  child: Row(
                    children: [
                      Icon(icon,
                          color: const Color.fromARGB(255, 184, 161, 32)),
                      Text(
                        'YOUR VICTORY MUSIC IS NOW: $text',
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class MusicOption {
  final MusicType music;
  final IconData icon;
  final String label;

  MusicOption({
    required this.music,
    required this.icon,
    required this.label,
  });
}
