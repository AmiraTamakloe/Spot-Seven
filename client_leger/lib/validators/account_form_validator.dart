import 'package:client_leger/constants/form_constants.dart';
import 'package:client_leger/validators/no_white_space_validator.dart';
import 'package:email_validator/email_validator.dart';

String? accountFormValidator(
    String? fieldValue, String fieldName, String? passwordValue) {
  var errorMessage = FormError.empty;

  if (fieldName == AccountInfo.password) {
    errorMessage = FormError.password;

    RegExp passwordRequirements = RegExp(r'^(?=.*[A-Z])(?=.*\d).{8,}$');
    if (fieldValue != null && !passwordRequirements.hasMatch(fieldValue)) {
      return errorMessage;
    }
  }

  if (fieldName == AccountInfo.passwordConfirmation) {
    errorMessage = FormError.passwordConfirmation;
    if (fieldValue != passwordValue) {
      return errorMessage;
    }
  }

  if (fieldName == AccountInfo.email) {
    if (fieldValue != null && !EmailValidator.validate(fieldValue)) {
      return errorMessage;
    }
  }

  if (fieldValue == null ||
      fieldValue.isEmpty ||
      noWhiteSpaceValidator(fieldValue) != null) {
    return errorMessage;
  }

  return null;
}
