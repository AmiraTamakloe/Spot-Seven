class Language {
  final String code;
  final String name;

  Language(this.code, this.name);

  static List<Language> getLanguages() {
    return <Language>[
      Language('en', 'EN'),
      Language('fr', 'FR'),
      Language('es', 'ES'),
    ];
  }
}