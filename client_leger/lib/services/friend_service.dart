import 'dart:convert';

import 'package:client_leger/environments/environment.dart';
import 'package:client_leger/interfaces/friendship.dart';
import 'package:client_leger/interfaces/user-info.dart';
import 'package:client_leger/services/interceptor.dart';
import 'package:get/get_state_manager/src/simple/get_controllers.dart';
import 'package:http_interceptor/http_interceptor.dart';

class FriendService extends GetxController {
  List<Map<String, dynamic>> users = [];
  List<Map<String, dynamic>> friends = [];
  List<Map<String, dynamic>> friendsOfFriends = [];
  List<Map<String, dynamic>> friendRequestSent = [];
  List<Map<String, dynamic>> friendRequestReceived = [];
  List<Map<String, dynamic>> blockedUsers = [];
  final String baseUrl = environment['serverUrl'];

  final httpClient = InterceptedClient.build(
      interceptors: [AuthenticationInterceptor()],
      retryPolicy: AuthenticationInterceptor());

  Future<void> getAllUsers(String userId) async {
    final response = await httpClient.get(Uri.parse('$baseUrl/users/$userId'));
    if (response.statusCode == 200) {
      Iterable list = json.decode(response.body);
      List<UserInfo> usersItems =
          list.map((friend) => UserInfo.fromJson(friend)).toList();
      users = usersItems
          .map((userItem) => {'user': userItem, 'friendshipId': ''})
          .toList();
      update();
    }
  }

  Future<void> getFriends(String userId) async {
    final response =
        await httpClient.get(Uri.parse('$baseUrl/users/$userId/friends/'));
    if (response.statusCode == 200) {
      Iterable l = json.decode(response.body);
      List<Friendship> friendshipItems =
          l.map((e) => Friendship.fromJson(e)).toList();
      friends = friendshipItems
          .map((e) => {
                'user': e.sender.id == userId ? e.receiver : e.sender,
                'friendshipId': e.id
              })
          .toList();
      update();
    }
  }


  Future<void> getFriendsOfFriend(String userId, String friendshipId) async {
    final response = await httpClient.get(
        Uri.parse('$baseUrl/users/$userId/friends-of-friend/$friendshipId'));
    if (response.statusCode == 200) {
      Iterable<dynamic> data = jsonDecode(response.body);
      List<Map<String, dynamic>> result = [];
      for (var item in data) {
        result.add({
          'user':  UserInfo.fromJson(item['user']),
          'canInteract': item['canInteract'] as bool,
        });
      }
      friendsOfFriends = result;
      update();
    } else {
      throw Exception('Failed to load friends of friend');
    }
  }

  Future<dynamic> sendFriendRequest(String senderId, String reveiverId) async {
    final response = await httpClient.post(
      Uri.parse('$baseUrl/users/follow'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode({'senderId': senderId, 'receiverId': reveiverId}),
    );
    update();
    return json.decode(response.body);
  }

  Future<void> removeFriend(String friendshipId) async {
    await httpClient.delete(Uri.parse('$baseUrl/users/friends/$friendshipId'));
  }

  Future<void> getFriendRequestsReceived(String userId) async {
    final response = await httpClient
        .get(Uri.parse('$baseUrl/users/$userId/friend-requests/received'));
    if (response.statusCode == 200) {
      Iterable l = json.decode(response.body);
      List<Friendship> friendshipItems =
          l.map((e) => Friendship.fromJson(e)).toList();
      friendRequestReceived = friendshipItems
          .map((e) => {'user': e.sender, 'friendshipId': e.id})
          .toList();
    update();
    }
  }

  Future<void> getFriendRequestsSent(String userId) async {
    final response = await httpClient
        .get(Uri.parse('$baseUrl/users/$userId/friend-requests/sent'));
    if (response.statusCode == 200) {
      Iterable l = json.decode(response.body);
      List<Friendship> friendshipItems =
          l.map((e) => Friendship.fromJson(e)).toList();
      friendRequestSent = friendshipItems
          .map((e) => {'user': e.receiver, 'friendshipId': e.id})
          .toList();
      update();
    }
  }

  Future<dynamic> acceptOrDeclineFriendRequest(
      String friendshipId, String inviteResponse) async {
    final response = await httpClient.post(
      Uri.parse('$baseUrl/users/friend-requests/'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(
          {'friendshipId': friendshipId, 'inviteResponse': inviteResponse}),
    );
    update();
    return json.decode(response.body);
  }

  Future<dynamic> blockUser(String friendshipId, String blockedUserId) async {
    final response = await httpClient.post(
      Uri.parse('$baseUrl/users/block/'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(
          {'friendshipId': friendshipId, 'blockedUserId': blockedUserId}),
    );
    update();
    return json.decode(response.body);
  }

  Future<dynamic> unblockUser(String friendshipId) async {
    final response = await httpClient.post(
      Uri.parse('$baseUrl/users/unblock/'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode({'friendshipId': friendshipId}),
    );
    update();
    return json.decode(response.body);
  }

  Future<void> getBlockedUsers(String userId) async {
    final response =
        await httpClient.get(Uri.parse('$baseUrl/users/$userId/block/'));
    if (response.statusCode == 200) {
      Iterable l = json.decode(response.body);
      List<Friendship> blockedUsersItems =
          l.map((e) => Friendship.fromJson(e)).toList();
      blockedUsers = blockedUsersItems
          .map((e) => {
                'user': e.receiver.id == userId ? e.sender : e.receiver,
                'friendshipId': e.id
              })
          .toList();
      update();
    }
  }

  Future<void> removeFriendRequest(String friendshipId) async {
    await httpClient
        .delete(Uri.parse('$baseUrl/users/friend-requests/$friendshipId'));
    update();
  }
}
