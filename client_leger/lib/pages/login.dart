// ignore_for_file: prefer_const_constructors

import 'dart:io';

import 'package:client_leger/base-widgets/wrapper_widget.dart';
import 'package:client_leger/classes/language_constant.dart';
import 'package:client_leger/pages/account_creation.dart';
import 'package:client_leger/services/account_service.dart';
import 'package:client_leger/services/theme_switch_service.dart';
import 'package:client_leger/widgets/top_bar.dart';
// import 'package:client_leger/services/google_signin_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final logInFormKey = GlobalKey<FormState>();
//   final googleSigninService = GoogleSigninService();
  TextEditingController usernameController = TextEditingController();
  TextEditingController passwordController = TextEditingController();
  final ThemeController themeController = Get.put(ThemeController());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: WrapperWidget(
            child: ListView(children: [
      SizedBox(
        height: MediaQuery.of(context).size.height * 0.95,
        width: MediaQuery.of(context).size.width * 0.95,
        child: ListView(
          children: [
            Container(
              child: Column(
                children: [
                  TopBar(),
                ],
              ),
            ),
            Container(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    "SPOT SEVEN",
                    style: TextStyle(
                      fontSize: 70.0,
                      fontFamily: 'Pirata',
                    ),
                  ),
                  Text(
                    translation(context).connection,
                    style: TextStyle(
                      fontSize: 30.0,
                      fontFamily: 'Pirata',
                    ),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.only(left: 30.0, right: 30.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Image.asset(
                    "assets/logo/logo.png",
                    height: 150.0,
                    width: 150.0,
                  ),
                  Form(
                    key: logInFormKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          translation(context).username,
                          style: TextStyle(
                            fontSize: 14.0,
                            fontFamily: 'Pirata',
                          ),
                        ),
                        TextFormField(
                          controller: usernameController,
                          decoration: InputDecoration(
                            contentPadding: const EdgeInsets.all(10.0),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(4.0),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                        const SizedBox(height: 10.0),
                        Text(
                          translation(context).password,
                          style: TextStyle(
                            fontSize: 14.0,
                            fontFamily: 'Pirata',
                          ),
                        ),
                        TextFormField(
                          controller: passwordController,
                          obscureText: true,
                          decoration: InputDecoration(
                            contentPadding: const EdgeInsets.all(10.0),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(4.0),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                        const SizedBox(height: 10.0),
                        GestureDetector(
                          child: Text(
                            translation(context).forgottenPassword,
                            style: TextStyle(
                              fontSize: 12.0,
                              fontFamily: 'Pirata',
                            ),
                          ),
                          onTap: () {
                            // TODO: Handle the password reset action
                          },
                        ),
                        const SizedBox(height: 10.0),
                        ElevatedButton(
                          onPressed: () {
                            AccountService.to
                                .logInAccount(usernameController.text,
                                    passwordController.text)
                                .then((isLoggedIn) {
                              if (isLoggedIn == HttpStatus.created) {
                                Get.toNamed('/home');
                              } else if (isLoggedIn == HttpStatus.badRequest) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      translation(context).wrongCredentials,
                                    ),
                                  ),
                                );
                              } else if (isLoggedIn ==
                                  HttpStatus.unauthorized) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                      translation(context).userConnected,
                                    ),
                                    duration: Duration(days: 1),
                                    action: SnackBarAction(
                                      label: 'OK',
                                      onPressed: () {
                                        ScaffoldMessenger.of(context)
                                            .hideCurrentSnackBar();
                                      },
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
                                        ScaffoldMessenger.of(context)
                                            .hideCurrentSnackBar();
                                      },
                                    ),
                                  ),
                                );
                              }
                            });
                          },
                          child: Text(
                            translation(context).logIn,
                            style: TextStyle(
                              fontSize: 14.0,
                              fontFamily: 'Pirata',
                              color: Theme.of(context).primaryColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10.0),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => const AccountCreationPage()),
                      );
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
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.all(10.0),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // TODO: add surrounding dark blue container
                ],
              ),
            ),
          ],
        ),
      ),
    ])));
  }
}

class TeamMember {
  final String name;

  TeamMember(this.name);
}
