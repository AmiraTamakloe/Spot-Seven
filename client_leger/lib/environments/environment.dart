const String baseUrl =
    String.fromEnvironment('BASE_URL', defaultValue: 'http://localhost:3000');

const Map<String, dynamic> environment = {
  'production': bool.fromEnvironment('IS_PRODUCTION', defaultValue: false),
  'serverUrl': '$baseUrl/api',
  'uploadUrl': '$baseUrl/uploads',
  'socketUrl': baseUrl,
  'googleClientId':
      '1016759648975-if5phimnog4do0g4dkd2ankimtrkslvb.apps.googleusercontent.com',
};
