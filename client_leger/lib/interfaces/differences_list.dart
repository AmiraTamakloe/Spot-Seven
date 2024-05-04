import 'package:flutter/material.dart';

class DifferencesList with ChangeNotifier {
  List<Offset> differences = [];

  void addDifference(Offset difference) {
    differences.add(difference);
  }

  void doNotifyListeners() {
    notifyListeners();
  }

  void clearDifferences() {
    differences.clear();
  }
}
