import 'package:client_leger/constants/form_constants.dart';

String? noWhiteSpaceValidator(String? value) {
  // ignore: prefer_is_empty
  if (value != null && value.trim().length == 0) return FormError.empty;
  return null;
}
