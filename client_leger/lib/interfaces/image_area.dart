enum ImageArea {
  original,
  modified;

  @override
  String toString() {
    switch (this) {
      case ImageArea.original:
        return 'Image originale';
      case ImageArea.modified:
        return 'Image modifiée';
    }
  }
}
