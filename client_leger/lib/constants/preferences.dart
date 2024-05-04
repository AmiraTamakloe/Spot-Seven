// ignore_for_file: constant_identifier_names
enum PreferencesCategory {
  language,
  theme,
  music,
}

const String LANGUAGE_CODE = 'languageCode';
const String ENGLISH = 'en';
const String FRENCH = 'fr';
const String SPANISH = 'es';
const String GOODRESULT = 'goodresult.mp3';
const String LEVELWIN = 'levelwin.mp3';
const String MEDIEVAL = 'medievalfanfare.mp3';
const String TADAA = 'tadaa.mp3';
const String SUCCESSTRUMPETS = 'successtrumpets.mp3';
const String UPLOADED = 'uploaded';

enum ThemeType {
  dark('dark'),
  light('light');

  const ThemeType(this.value);
  final String value;
}

enum MusicType {
  goodresult(GOODRESULT),
  levelwin(LEVELWIN),
  medieval(MEDIEVAL),
  tadaa(TADAA),
  successtrumpets(SUCCESSTRUMPETS),
  uploaded(UPLOADED);

  const MusicType(this.value);
  final String value;
}

enum LanguageType {
  english(ENGLISH),
  french(FRENCH),
  spanish(SPANISH);

  const LanguageType(this.value);
  final String value;
}
