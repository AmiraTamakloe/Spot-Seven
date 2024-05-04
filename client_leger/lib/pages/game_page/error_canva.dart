import 'dart:async';

import 'package:client_leger/classes/game_constant.dart';
import 'package:client_leger/interfaces/error-notifier.dart';
import 'package:flutter/material.dart';

class ErrorCanvas extends StatefulWidget {
  final ErrorNotifier error;

  const ErrorCanvas(this.error, {super.key});

  @override
  State<StatefulWidget> createState() => _ErrorCanvas();
}

class _ErrorCanvas extends State<ErrorCanvas> {
  int duration = ERROR_CANVAS_DURATION;

  @override
  void initState() {
    widget.error.addListener(() {
      Timer(Duration(seconds: duration), resetCanvas);
    });
    super.initState();
  }

  resetCanvas() {
    widget.error.clearError();
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
        listenable: widget.error,
        builder: (context, child) {
          return CustomPaint(
            painter: ErrorCanvaPainter(widget.error),
          );
        });
  }
}

class ErrorCanvaPainter extends CustomPainter {
  ErrorNotifier error;
  ErrorCanvaPainter(this.error) : super(repaint: error);

  @override
  void paint(Canvas canvas, Size size) {
    if (error.coordinate == null) {
      return;
    }
    TextSpan span = TextSpan(
        style: const TextStyle(
          color: Colors.red,
          fontSize: 30.0,
        ),
        text: error.error);
    TextPainter tp = TextPainter(
        text: span,
        textAlign: TextAlign.center,
        textDirection: TextDirection.ltr);
    tp.layout();
    tp.paint(
        canvas,
        Offset(
            error.coordinate!.dx.toDouble(), error.coordinate!.dy.toDouble()));
  }

  @override
  bool shouldRepaint(ErrorCanvaPainter oldDelegate) {
    return true;
  }
}
