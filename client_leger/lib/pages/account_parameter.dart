import 'dart:convert';
import 'dart:io';

import 'package:client_leger/classes/language_constant.dart';
import 'package:client_leger/interfaces/user-info.dart';
import 'package:client_leger/services/account_service.dart';
import 'package:client_leger/widgets/top_bar.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

enum AvatarOption {
  None,
  Avatar1,
  Avatar2,
  Avatar3,
  Avatar4,
  TakePicture,
}

class AccountParameterPage extends StatefulWidget {
  const AccountParameterPage({super.key});

  @override
  State createState() => _AccountParameterPageState();
}

class _AccountParameterPageState extends State<AccountParameterPage> {
  List<String> avatars = [
    'avatar1.png',
    'avatar2.png',
    'avatar3.png',
    'avatar4.png',
  ];

  int _selectedOption = AvatarOption.None.index;
  String _newUsername = '';
  String? _newAvatarBase64;

  void _selectOption(int option) {
    if (option == AvatarOption.TakePicture.index) {
      _takePicture();
    } else {
      setState(() {
        _selectedOption = option;
      });
    }
  }

  void _takePicture() async {
    final picker = ImagePicker();
    final pickedImage = await picker.pickImage(source: ImageSource.camera);
    if (pickedImage != null) {
      setState(() {
        _selectedOption = AvatarOption.TakePicture.index;
        _newAvatarBase64 =
            base64Encode(File(pickedImage.path).readAsBytesSync());
      });
    }
  }

  void _submit() async {
    UserInfo userInfo = await AccountService.to.getAccountInfo();

    if (_selectedOption == AvatarOption.None.index) {
      userInfo.avatar = userInfo.avatar;
    } else if (_selectedOption != AvatarOption.TakePicture.index) {
      userInfo.avatar = avatars[_selectedOption - 1];
    }
    userInfo.username = _newUsername.isEmpty ? userInfo.username : _newUsername;

    if (_newAvatarBase64 != null) {
      userInfo.avatar = _newAvatarBase64;
    }

    AccountService.to.updateAccountParameters(userInfo);
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(translation(context).updatedAccountParameters),
        content: SingleChildScrollView(
          child: Column(
            children: [
              Text(translation(context).changeToNewPage),
              (() {
                if (_newUsername == '' &&
                    _selectedOption == AvatarOption.None.index) {
                  return Text(translation(context).noChanges);
                } else if (_newUsername == '' &&
                    _selectedOption != AvatarOption.None.index &&
                    _selectedOption != AvatarOption.TakePicture.index) {
                  return Text(
                      '${translation(context).avatarUpdated} ${avatars[_selectedOption - 1]}');
                } else if (_selectedOption == 0 && _newUsername != '') {
                  return Text(
                      '${translation(context).usernameUpdated} $_newUsername');
                } else if (_selectedOption == AvatarOption.TakePicture.index &&
                    _newUsername == '') {
                  return Text(translation(context).uploadedAvatar);
                } else if (_newUsername != '' &&
                    _selectedOption != AvatarOption.None.index &&
                    _selectedOption != AvatarOption.TakePicture.index) {
                  return Text(
                      '${translation(context).usernameUpdated} $_newUsername ${translation(context).and} ${translation(context).avatarUpdated} ${avatars[_selectedOption - 1]}');
                } else if (_selectedOption == AvatarOption.TakePicture.index &&
                    _newUsername != '') {
                  return Text(
                      '${translation(context).usernameUpdated} $_newUsername ${translation(context).and} ${translation(context).uploadedAvatar}');
                } else {
                  return Text(
                      '${translation(context).usernameUpdated} $_newUsername ${translation(context).and} ${translation(context).avatarUpdated}');
                }
              })(),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
    setState(() {});
  }

  Widget _buildAvatar(int option) {
    if (option == AvatarOption.TakePicture.index) {
      return GestureDetector(
        onTap: () {
          _selectOption(option);
        },
        child: _newAvatarBase64 != null
            ? CircleAvatar(
                radius: 50,
                backgroundImage: MemoryImage(base64Decode(_newAvatarBase64!)),
              )
            : const CircleAvatar(
                radius: 50,
                backgroundColor: Colors.grey,
                child: Icon(Icons.camera_alt),
              ),
      );
    } else {
      return GestureDetector(
        onTap: () {
          _selectOption(option);
        },
        child: Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: _selectedOption == option ? Colors.blue : Colors.grey,
              width: 2,
            ),
          ),
          child: CircleAvatar(
            radius: 50,
            backgroundColor: Colors.white,
            backgroundImage: AssetImage('assets/avatar/${avatars[option - 1]}'),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: <Widget>[
          TopBar(),
          Container(
            child: Center(
              child: Text(translation(context).configureYourAccount,
                  style: TextStyle(
                      fontSize: 60, color: Theme.of(context).primaryColor)),
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              Container(
                width: MediaQuery.of(context).size.width / 2.5,
                color: Theme.of(context).scaffoldBackgroundColor,
                child: Form(
                  child: Column(
                    children: <Widget>[
                      Text(translation(context).chooseNewUsername,
                          style: TextStyle(
                              fontSize: 30.0,
                              color: Theme.of(context).primaryColor)),
                      TextFormField(
                        decoration: InputDecoration(
                          hintText: AccountService.to.username,
                        ),
                        onChanged: (value) {
                          setState(() {
                            _newUsername = value;
                          });
                        },
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
              Container(
                  width: MediaQuery.of(context).size.width / 2,
                  color: Theme.of(context).scaffoldBackgroundColor,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(translation(context).chooseNewAvatar,
                          style: TextStyle(
                              fontSize: 30.0,
                              color: Theme.of(context).primaryColor)),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _buildAvatar(AvatarOption.Avatar1.index),
                          _buildAvatar(AvatarOption.Avatar2.index),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _buildAvatar(AvatarOption.Avatar3.index),
                          _buildAvatar(AvatarOption.Avatar4.index),
                        ],
                      ),
                      const SizedBox(height: 20),
                      _buildAvatar(AvatarOption.TakePicture.index),
                    ],
                  )),
            ],
          ),
          Padding(
              padding: const EdgeInsets.all(20.0),
              child: ElevatedButton(
                onPressed: () {
                  _submit();
                },
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10.0),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                ),
                child: Text(translation(context).saveNewAccountParameters,
                    style: TextStyle(
                        fontFamily: 'Pirata',
                        fontSize: 20,
                        color: Theme.of(context).primaryColor)),
              ))
        ],
      ),
    );
  }
}
