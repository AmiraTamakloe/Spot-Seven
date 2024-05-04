// import 'package:firebase_auth/firebase_auth.dart';
// import 'package:google_sign_in/google_sign_in.dart';

// class GoogleSigninService {
//   Future<UserCredential?> signIn() async {
//     // Create an instance of the firebase auth and google signin
//     FirebaseAuth auth = FirebaseAuth.instance;
//     final GoogleSignIn googleSignIn = GoogleSignIn();
//     //Triger the authentication flow
//     final GoogleSignInAccount? googleUser = await googleSignIn.signIn();

//     //Obtain the auth details from the request
//     final GoogleSignInAuthentication googleAuth =
//         await googleUser!.authentication;
//     //CreatgoogleUsere a new credentials
//     final AuthCredential credential = GoogleAuthProvider.credential(
//       accessToken: googleAuth.accessToken,
//       idToken: googleAuth.idToken,
//     );
//     //Sign in the user with the credentials
//     final UserCredential userCredential =
//         await auth.signInWithCredential(credential);
//     return null;
//   }

//   Future<void> logout() async {
//     final GoogleSignIn googleSign = GoogleSignIn();
//     await googleSign.signOut();
//   }
// }
