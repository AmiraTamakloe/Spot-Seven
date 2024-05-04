import 'dart:ui';

import 'package:client_leger/classes/game_constant.dart';
import 'package:client_leger/interfaces/differences_list.dart';
import 'package:flutter/material.dart';

class HintCanva extends StatefulWidget {
  final DifferencesList points;
  const HintCanva(this.points, {super.key});

  @override
  State<HintCanva> createState() => _HintCanva();
}

class _HintCanva extends State<HintCanva> with SingleTickerProviderStateMixin {
  late final AnimationController _animationController;
  int _animationCounter = 0;
  int duration = BLINK_DURATION;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: duration),
    );

    _animationController.addStatusListener((status) {
      if (_animationCounter > BLINK_ANIMATION_OCCURRENCE) {
        stopAnimation();
      }
      _handleAnimationEnd(status);
      _animationCounter++;
    });

    _animationController.forward();

    widget.points.addListener(() {
      _resetAnimation();
    });
  }

  _handleAnimationEnd(AnimationStatus status) {
    if (status == AnimationStatus.completed) {
      _animationController.reverse();
    } else if (status == AnimationStatus.dismissed) {
      _animationController.forward();
    }
  }

  _resetAnimation() {
    _animationCounter = 0;
    _animationController.forward(from: 0);
  }

  stopAnimation() {
    _animationController.stop();
    widget.points.clearDifferences();
  }

  @override
  void dispose() {
    _animationController.dispose();
    widget.points.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
        listenable: widget.points,
        builder: (context, child) {
          return AnimatedBuilder(
              animation: _animationController,
              builder: (context, child) => Opacity(
                  opacity: _animationController.value,
                  child: CustomPaint(
                    painter: HintCanvaPainter(widget.points),
                  )));
        });
  }
}

class HintCanvaPainter extends CustomPainter {
  DifferencesList points;
  HintCanvaPainter(this.points) : super(repaint: points);

  @override
  void paint(Canvas canvas, Size size) {
    Paint paint = Paint()
      ..color = Colors.yellow
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 10.0;

    canvas.drawPoints(PointMode.points, points.differences, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return true;
  }
}
