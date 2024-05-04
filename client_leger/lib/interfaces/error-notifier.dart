import 'package:client_leger/interfaces/game.dart';
import 'package:flutter/material.dart';

class ErrorNotifier with ChangeNotifier {
  String error = "Error";
  late Coordinate? coordinate;

  ErrorNotifier() {
    coordinate = null;
  }

  void setError(Coordinate coordinate) {
    this.coordinate = coordinate;
    notifyListeners();
  }

  void clearError() {
    coordinate = null;
    notifyListeners();
  }
}
