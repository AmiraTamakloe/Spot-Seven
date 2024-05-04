import 'package:client_leger/classes/language_constant.dart';
import 'package:client_leger/interfaces/user-info.dart';
import 'package:client_leger/services/account_service.dart';
import 'package:client_leger/widgets/avatar.dart';
import 'package:flutter/material.dart';
import 'package:get/route_manager.dart';

const List<String> pageNames = <String>[
  'Home',
  'Parameters',
  'Friends',
  'Statistics',
  'Replays',
  'Logout'
];

class UserDropdown extends StatefulWidget {
  const UserDropdown({super.key});
  @override
  State<UserDropdown> createState() => _UserDropdownState();
}

class _UserDropdownState extends State<UserDropdown> {
  String dropdownValue = pageNames.first;
  String? avatarString = 'avatar1.png';
  String? username = AccountService.to.username;
  String? avatarData = '';

  Future<void> getAccountInfo() async {
    final UserInfo user = await AccountService.to.getAccountInfo();
    setState(() {
      avatarString = user.avatar;
      username = user.username;
    });
  }

  @override
  void initState() {
    super.initState();
    getAccountInfo();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        DropdownButton<String>(
          icon: Container(
            decoration: BoxDecoration(
              color: Theme.of(context).scaffoldBackgroundColor,
              shape: BoxShape.circle,
            ),
            padding: EdgeInsets.all(8),
            child: Icon(
              Icons.home_rounded,
              color: Theme.of(context).primaryColor,
              size: 35,
            ),
          ),
          elevation: 16,
          style: const TextStyle(color: Colors.black),
          underline: Container(
            color: Colors.black,
          ),
          onChanged: (String? value) {
            setState(() {
              dropdownValue = value!;
              switch (value) {
                case 'Home':
                  Get.toNamed('/home');
                  break;
                case 'Parameters':
                  Get.toNamed('/account-parameter');
                  break;
                case 'Friends':
                  Get.toNamed('/friend');
                  break;
                case 'Statistics':
                  Get.toNamed('/statistic');
                  break;
                case 'Replays':
                  Get.toNamed('/replays');
                  break;
                case 'Logout':
                  AccountService.to.logout();
                  break;
                default:
                  break;
              }
            });
          },
          items: pageNames.map<DropdownMenuItem<String>>((String value) {
            IconData iconData;
            String textData = '';
            switch (value) {
              case 'Home':
                iconData = Icons.home;
                textData = translation(context).home;
                break;
              case 'Parameters':
                iconData = Icons.settings;
                textData = translation(context).parameters;
                break;
              case 'Friends':
                iconData = Icons.people;
                textData = translation(context).friends;
                break;
              case 'Statistics':
                iconData = Icons.bar_chart;
                textData = translation(context).statistics;
                break;
              case 'Replays':
                iconData = Icons.play_circle_outline_rounded;
                textData = translation(context).replays;
                break;
              case 'Logout':
                iconData = Icons.logout;
                textData = translation(context).logout;
                break;
              default:
                iconData = Icons.error;
            }
            return DropdownMenuItem<String>(
              value: value,
              child: Row(
                children: [
                  Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: Icon(
                      iconData,
                      size: 25,
                      color: Theme.of(context).primaryColor,
                    ),
                  ),
                  Text(
                    textData,
                    style: TextStyle(
                        fontSize: 15,
                        fontFamily: 'Pirata',
                        color: Theme.of(context).primaryColor),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
        Padding(
          padding: const EdgeInsets.all(10),
          child: Text(
            "${translation(context).welcomeBack} $username",
            style: const TextStyle(
              fontSize: 20,
              fontFamily: 'Pirata',
              fontStyle: FontStyle.normal,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Avatar(
            avatarString: avatarString!,
            radius: 20,
            borderWidth: 2,
            borderColor: Theme.of(context).primaryColor),
      ],
    );
  }
}
