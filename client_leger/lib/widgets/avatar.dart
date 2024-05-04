import 'dart:convert';

import 'package:client_leger/services/account_service.dart';
import 'package:flutter/material.dart';

class Avatar extends StatefulWidget {
  final String avatarString;
  final double radius;
  final double borderWidth;
  final Color borderColor;

  const Avatar({
    required this.avatarString,
    required this.radius,
    required this.borderWidth,
    required this.borderColor,
    super.key,
  });

  @override
  State<Avatar> createState() => _AvatarState();
}

class _AvatarState extends State<Avatar> {
  List<String> avatars = [
    'avatar1.png',
    'avatar2.png',
    'avatar3.png',
    'avatar4.png'
  ];

  Future<Widget> _buildAvatarWidget() async {
    if (avatars.contains(widget.avatarString)) {
      return CircleAvatar(
        backgroundImage: AssetImage("assets/avatar/${widget.avatarString}"),
        radius: widget.radius,
        backgroundColor: widget.borderColor,
        foregroundColor: widget.borderColor,
        child: CircleAvatar(
          backgroundImage: AssetImage("assets/avatar/${widget.avatarString}"),
          radius: widget.radius - widget.borderWidth,
        ),
      );
    } else {
      final avatarData =
          await AccountService.to.getAvatarUrl(widget.avatarString);
      final decodedAvatar = base64Decode(avatarData);
      return CircleAvatar(
        backgroundImage: MemoryImage(decodedAvatar),
        radius: widget.radius,
        backgroundColor: widget.borderColor,
        foregroundColor: widget.borderColor,
        child: CircleAvatar(
          backgroundImage: MemoryImage(decodedAvatar),
          radius: widget.radius - widget.borderWidth,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Widget>(
      future: _buildAvatarWidget(),
      builder: (BuildContext context, AsyncSnapshot<Widget> snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return CircularProgressIndicator(
            color: Theme.of(context).primaryColor,
          );
        } else if (snapshot.hasError) {
          return const Text('Error loading avatar');
        } else {
          return snapshot.data!;
        }
      },
    );
  }
}
