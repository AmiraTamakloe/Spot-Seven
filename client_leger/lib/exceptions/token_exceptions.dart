class TokenExpiredException implements Exception {
  final String message;

  TokenExpiredException(this.message);
}
