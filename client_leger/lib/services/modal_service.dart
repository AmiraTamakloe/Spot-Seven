import 'package:client_leger/bindings/waiting_room_bindings.dart';
import 'package:client_leger/classes/language_constant.dart';
import 'package:client_leger/interfaces/constants/time_limit_room_id.dart';
import 'package:client_leger/interfaces/game_mode.dart';
import 'package:client_leger/interfaces/responses/modal_response.dart';
import 'package:client_leger/pages/waiting_room_page.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ModalService extends GetxController {
  static ModalService get to => Get.find();

  close(BuildContext context) {
    const userCanceledModal = false;
    Navigator.of(context, rootNavigator: true).pop(userCanceledModal);
  }

  showInformationModal(
      BuildContext context, String title, String message) async {
    return await showDialog(
      barrierDismissible: false,
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(
            title,
            style: TextStyle(fontFamily: 'Pirata'),
          ),
          content: Text(message,
              style: TextStyle(
                  fontFamily: 'Pirata', color: Theme.of(context).primaryColor)),
          actions: <Widget>[
            TextButton(
              style: TextButton.styleFrom(
                textStyle: Theme.of(context).textTheme.titleLarge,
              ),
              child: Text(translation(context).cancel),
              onPressed: () {
                const userCanceledModal = true;
                Navigator.of(context).pop(userCanceledModal);
              },
            ),
          ],
        );
      },
    );
  }

  showActionModal(BuildContext context, String title, String message) async {
    return await showDialog(
      barrierDismissible: false,
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(
            title,
            style: TextStyle(fontFamily: 'Pirata'),
          ),
          content: Text(message, style: TextStyle(fontFamily: 'Pirata')),
          actions: <Widget>[
            TextButton(
              style: TextButton.styleFrom(
                textStyle: Theme.of(context).textTheme.titleLarge,
              ),
              child: Text(translation(context).accept),
              onPressed: () {
                ModalResponse response = ModalResponse(
                    userClosedModal: true, choseAcceptOption: true);
                Navigator.of(context).pop(response);
              },
            ),
            TextButton(
              style: TextButton.styleFrom(
                textStyle: Theme.of(context).textTheme.titleLarge,
              ),
              child: Text(translation(context).cancel),
              onPressed: () {
                ModalResponse response = ModalResponse(
                    userClosedModal: true, choseAcceptOption: false);
                Navigator.of(context).pop(response);
              },
            ),
          ],
        );
      },
    );
  }

  showTimeLimitedSelection(
      BuildContext context, String title, String message) async {
    return await showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(
            title,
            style: TextStyle(fontFamily: 'Pirata'),
          ),
          content: Text(message, style: TextStyle(fontFamily: 'Pirata')),
          actions: <Widget>[
            TextButton(
              style: TextButton.styleFrom(
                textStyle: Theme.of(context).textTheme.titleLarge,
              ),
              child: Text(translation(context).timeLimited),
              onPressed: () {
                Get.to(
                    WaitingRoomPage(GameMode.timeLimited, TIME_LIMIT_ID,
                        GameMode.timeLimited.name),
                    binding: WaitingRoomBinding());
              },
            ),
            TextButton(
              style: TextButton.styleFrom(
                textStyle: Theme.of(context).textTheme.titleLarge,
              ),
              child: Text(translation(context).timeLimitedImproved),
              onPressed: () {
                Get.to(
                    WaitingRoomPage(GameMode.timeLimitedImproved, TIME_LIMIT_ID,
                        GameMode.timeLimitedImproved.name),
                    binding: WaitingRoomBinding());
              },
            ),
          ],
        );
      },
    );
  }

  showTeamSelection(BuildContext context, String title) async {
    return await showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(
            title,
            style: TextStyle(fontFamily: 'Pirata'),
          ),
          actions: <Widget>[
            TextButton(
              style: TextButton.styleFrom(
                textStyle: Theme.of(context).textTheme.titleLarge,
              ),
              child: Text("1"),
              onPressed: () {
                Navigator.pop(context, 0);
              },
            ),
            TextButton(
              style: TextButton.styleFrom(
                textStyle: Theme.of(context).textTheme.titleLarge,
              ),
              child: Text("2"),
              onPressed: () {
                Navigator.pop(context, 1);
              },
            ),
            TextButton(
              style: TextButton.styleFrom(
                textStyle: Theme.of(context).textTheme.titleLarge,
              ),
              child: Text("3"),
              onPressed: () {
                Navigator.pop(context, 2);
              },
            ),
          ],
        );
      },
    );
  }
}
