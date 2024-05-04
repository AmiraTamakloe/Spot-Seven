// ignore_for_file: prefer_const_constructors

import 'dart:io';

import 'package:client_leger/base-widgets/wrapper_widget.dart';
import 'package:client_leger/classes/language_constant.dart';
import 'package:client_leger/constants/form_constants.dart';
import 'package:client_leger/interfaces/user-info.dart';
import 'package:client_leger/services/account_service.dart';
import 'package:client_leger/services/theme_switch_service.dart';
import 'package:client_leger/validators/account_form_validator.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class AccountCreationPage extends StatefulWidget {
  const AccountCreationPage({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _AccountCreationPageState createState() => _AccountCreationPageState();
}

class _AccountCreationPageState extends State<AccountCreationPage> {
  final GlobalKey<FormState> accountCreationPageFormKey =
      GlobalKey<FormState>();
  final TextEditingController usernameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController passwordConfirmationController =
      TextEditingController();
  String selectedAvatar = "avatar1.png";
  List<String> avatarNames = [
    "avatar1.png",
    "avatar2.png",
    "avatar3.png",
    "avatar4.png",
  ];
  @override
  Widget build(BuildContext context) {
    final themeManager = Get.find<ThemeController>();
    return Scaffold(
      body: WrapperWidget(
        child: Obx(
          () => ListView(
            children: [
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Theme.of(context).scaffoldBackgroundColor,
                        ),
                        child: IconButton(
                          icon: const Icon(Icons.arrow_back),
                          color: Theme.of(context).primaryColor,
                          onPressed: () {
                            Navigator.pop(context);
                          },
                        ),
                      ),
                      Image.asset(
                        "assets/logo/logo.png",
                        height: 150.0,
                        width: 150.0,
                      ),
                      SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "SPOT SEVEN",
                            style: TextStyle(
                              fontSize: 80.0,
                              fontFamily: 'Pirata',
                            ),
                          ),
                          Text(
                            translation(context).createAccount,
                            style: TextStyle(
                              fontSize: 40.0,
                              fontFamily: 'Pirata',
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.only(left: 30.0, right: 30.0),
                    decoration: BoxDecoration(
                      color: themeManager.getBackgroundColor(),
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Form(
                          key: accountCreationPageFormKey,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              buildLabel(translation(context).username,
                                  AccountInfo.username),
                              buildTextField(usernameController,
                                  AccountInfo.username, AccountInfo.username),
                              buildLabel(translation(context).email,
                                  AccountInfo.email),
                              buildTextField(emailController, AccountInfo.email,
                                  AccountInfo.email),
                              buildLabel(translation(context).password,
                                  AccountInfo.password),
                              buildTextField(passwordController,
                                  AccountInfo.password, AccountInfo.password),
                              buildLabel(translation(context).confirmPassword,
                                  AccountInfo.passwordConfirmation),
                              buildTextField(
                                  passwordConfirmationController,
                                  AccountInfo.passwordConfirmation,
                                  AccountInfo.passwordConfirmation),
                              SizedBox(height: 20),
                              Text(
                                translation(context).selectAvatar,
                                style: TextStyle(fontSize: 14),
                              ),
                              SizedBox(height: 10),
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceEvenly,
                                children:
                                    List.generate(avatarNames.length, (index) {
                                  return GestureDetector(
                                    onTap: () {
                                      setState(() {
                                        selectedAvatar = avatarNames[index];
                                      });
                                    },
                                    child: CircleAvatar(
                                      backgroundColor:
                                          selectedAvatar == avatarNames[index]
                                              ? const Color.fromARGB(
                                                  255, 36, 103, 157)
                                              : Colors.transparent,
                                      radius: 50,
                                      child: CircleAvatar(
                                        backgroundColor: Colors.white,
                                        radius: 48,
                                        backgroundImage: AssetImage(
                                            'assets/avatar/${avatarNames[index]}'),
                                      ),
                                    ),
                                  );
                                }),
                              ),
                              Center(
                                child: ElevatedButton(
                                  onPressed: () async {
                                    await handleAccountCreation();
                                  },
                                  child: Text(
                                    translation(context).createAccount,
                                    style: TextStyle(
                                      fontSize: 14.0,
                                      fontFamily: 'Pirata',
                                      color: Theme.of(context).primaryColor,
                                    ),
                                  ),
                                ),
                              )
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> handleAccountCreation() async {
    if (accountCreationPageFormKey.currentState?.validate() ?? false) {
      UserInfo userInfo = UserInfo(
        username: usernameController.text,
        password: passwordController.text,
        email: emailController.text,
        avatar: selectedAvatar,
      );
      int wasCreated = await AccountService.to.registerAccount(userInfo);

      if (wasCreated == HttpStatus.created) {
        Get.toNamed('/login');
      } else if (wasCreated == HttpStatus.conflict) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              translation(context).usernameAlreadyExists,
            ),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              translation(context).error,
            ),
            duration: Duration(days: 1),
            action: SnackBarAction(
              label: 'OK',
              onPressed: () {
                ScaffoldMessenger.of(context).hideCurrentSnackBar();
              },
            ),
          ),
        );
      }
    }
  }

  Widget buildLabel(String text, String htmlFor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          text,
          style: const TextStyle(
            fontSize: 14.0,
            fontFamily: 'Pirata',
          ),
        ),
      ],
    );
  }

  Widget buildTextField(TextEditingController controller, String inputType,
      String formControlName) {
    return TextFormField(
      controller: controller,
      keyboardType: inputType == AccountInfo.password ||
              inputType == AccountInfo.passwordConfirmation
          ? TextInputType.visiblePassword
          : TextInputType.text,
      obscureText: inputType == AccountInfo.password ||
          inputType == AccountInfo.passwordConfirmation,
      decoration: InputDecoration(
        contentPadding: const EdgeInsets.all(10.0),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(4.0),
          borderSide: BorderSide.none,
        ),
      ),
      validator: (value) =>
          accountFormValidator(value, inputType, passwordController.text),
    );
  }
}
