import 'package:client_leger/environments/environment.dart';
import 'package:client_leger/interfaces/differences_list.dart';
import 'package:client_leger/interfaces/error-notifier.dart';
import 'package:client_leger/interfaces/game_image.dart';
import 'package:client_leger/interfaces/image_area.dart';
import 'package:client_leger/pages/game_page/error_canva.dart';
import 'package:client_leger/pages/game_page/hint_canva.dart';
import 'package:client_leger/services/game_service.dart';
import 'package:flutter/material.dart';

class GameCanva extends StatefulWidget {
  final String baseUrl = environment['uploadUrl'];
  final ImageArea imageArea;
  late final GameImage image;
  final DifferencesList points;
  final ErrorNotifier error;
  final GameService gameService;
  GameCanva(
      this.image, this.imageArea, this.points, this.error, this.gameService,
      {super.key});

  @override
  State<GameCanva> createState() => _GameCanvaState();
}

class _GameCanvaState extends State<GameCanva> {
  _onTapDown(TapDownDetails details) {
    widget.gameService.handleClick(widget.imageArea,
        details.localPosition.dx.toInt(), details.localPosition.dy.toInt());
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
        onTapDown: _onTapDown,
        child: Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(
                top: BorderSide(color: Colors.black, width: 3),
                bottom: BorderSide(color: Colors.black, width: 3),
                left: BorderSide(color: Colors.black, width: 3),
                right: BorderSide(color: Colors.black, width: 3),
              ),
            ),
            width: 640,
            height: 480,
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                CustomPaint(
                  painter: GameCanvaPainter(widget.image, true),
                ),
                ErrorCanvas(widget.error),
                HintCanva(widget.points),
              ],
            )));
  }
}

class GameCanvaPainter extends CustomPainter {
  GameImage image;
  bool isBlink;
  GameCanvaPainter(this.image, this.isBlink) : super(repaint: image);

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawImage(image.displayableImage, const Offset(0, 0), Paint());
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return true;
  }
}
