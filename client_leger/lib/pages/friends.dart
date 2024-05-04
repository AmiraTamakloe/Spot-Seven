import 'package:client_leger/constants/requestOptions.dart';
import 'package:client_leger/interfaces/socket_event.dart';
import 'package:client_leger/interfaces/user-info.dart';
import 'package:client_leger/services/account_service.dart';
import 'package:client_leger/services/friend_service.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/widgets/avatar.dart';
import 'package:flutter/material.dart';

class FriendsPage extends StatefulWidget {
  FriendsPage({Key? key}) : super(key: key);
  @override
  State<FriendsPage> createState() => _FriendsPageState();
}

class _FriendsPageState extends State<FriendsPage> {
  final FriendService friendService = FriendService();
  late String userId;
  List<Map<String, dynamic>> _users = [];
  List<Map<String, dynamic>> _friends = [];
  List<Map<String, dynamic>> _friendRequestSent = [];
  List<Map<String, dynamic>> _friendRequestReceived = [];
  List<Map<String, dynamic>> _blocked = [];
  bool loaded = false;

  @override
  void initState() {
    super.initState();
    setUpEventListeners();
    getData();
  }

  setUpEventListeners() {
    SocketService.to.on(SocketEvent.refreshData, _refreshView);
  }

  _refreshView(response) async {
    getData();
  }

  Future<void> getData() async {
    final userInfo = await AccountService.to.getAccountInfo();
    userId = userInfo.id!;
    await friendService.getAllUsers(userId);
    await friendService.getFriends(userId);
    await friendService.getFriendRequestsSent(userId);
    await friendService.getFriendRequestsReceived(userId);
    await friendService.getBlockedUsers(userId);
    setState(() {
      _users = friendService.users;
      _friends = friendService.friends;
      _friendRequestSent = friendService.friendRequestSent;
      _friendRequestReceived = friendService.friendRequestReceived;
      _blocked = friendService.blockedUsers;
      loaded = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!loaded) {
      return const CircularProgressIndicator();
    } else {
      return Scaffold(
        body: DefaultTabController(
          length: 5,
          child: Column(
            children: [
              const TabBar(
                tabs: [
                  Tab(text: 'Friends'),
                  Tab(text: 'Find Users'),
                  Tab(text: 'Invite Received'),
                  Tab(text: 'Invite Sent'),
                  Tab(text: 'Blocked User'),
                ],
              ),
              Expanded(
                child: TabBarView(
                  children: [
                    FriendListPage(
                        pageStatus: 'Friends', data: _friends, userId: userId),
                    FriendListPage(
                        pageStatus: 'Users', data: _users, userId: userId),
                    FriendListPage(
                        pageStatus: 'Invite-Received',
                        data: _friendRequestReceived,
                        userId: userId),
                    FriendListPage(
                        pageStatus: 'Invite-Sent',
                        data: _friendRequestSent,
                        userId: userId),
                    FriendListPage(
                        pageStatus: 'Blocked', data: _blocked, userId: userId),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }
  }
}

class FriendListPage extends StatefulWidget {
  final String pageStatus;
  final List<Map<String, dynamic>> data;
  final String userId;

  const FriendListPage({
    Key? key,
    required this.pageStatus,
    required this.data,
    required this.userId,
  }) : super(key: key);

  @override
  _FriendListPageState createState() => _FriendListPageState();
}

class _FriendListPageState extends State<FriendListPage> {
  late List<Map<String, dynamic>> _filteredData;
  late TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _filteredData = List.from(widget.data);
    _searchController = TextEditingController();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    setState(() {
      _filteredData = widget.data.where((user) {
        final userInfo = user['user'] as UserInfo;
        final username = userInfo.username;
        return username
            .toLowerCase()
            .contains(_searchController.text.toLowerCase());
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TextField(
          controller: _searchController,
          decoration: const InputDecoration(
            labelText: 'Search by Username',
            prefixIcon: Icon(Icons.search),
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: _filteredData.length,
            itemBuilder: (context, index) {
              return FriendCard(
                friend: _filteredData[index]['user'],
                status: widget.pageStatus,
                friendshipId: _filteredData[index]['friendshipId'],
                userId: widget.userId,
              );
            },
          ),
        ),
      ],
    );
  }
}

class FriendCard extends StatelessWidget {
  final UserInfo friend;
  final String status;
  final String friendshipId;
  final FriendService friendService = FriendService();
  final String userId;
  late List<Map<String, dynamic>> _friendOfFriend = [];

  FriendCard({
    Key? key,
    required this.friend,
    required this.status,
    required this.friendshipId,
    required this.userId,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      padding: const EdgeInsets.all(8.0),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey),
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: ListTile(
        leading: Avatar(
          avatarString: friend.avatar!,
          radius: 20,
          borderWidth: 2,
          borderColor: Theme.of(context).primaryColor,
        ),
        title: Text(
          friend.username,
          style: const TextStyle(
              fontFamily: 'Pirata', fontWeight: FontWeight.bold),
        ),
        subtitle: _buildActions(context),
      ),
    );
  }

  Widget _buildActions(context) {
    switch (status) {
      case 'Friends':
        return Row(
          children: [
            TextButton(
              onPressed: () async {
                await friendService.getFriendsOfFriend(userId, friend.id!);
                _friendOfFriend = friendService.friendsOfFriends;
                List<Widget> friendListTiles = _friendOfFriend.map((friend) {
                  final friendOfF = friend['user'];
                  final canInteract = friend['canInteract'];
                  final friendOfAvatar = friendOfF.avatar;
                  return ListTile(
                    leading: Avatar(
                      avatarString: friendOfAvatar,
                      radius: 20,
                      borderWidth: 2,
                      borderColor: Theme.of(context).primaryColor,
                    ),
                    title: Text(
                      friendOfF.username,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    trailing: canInteract
                        ? ElevatedButton(
                            onPressed: () {
                              friendService.sendFriendRequest(
                                  userId, friendOfF.id!);
                            },
                            child: const Text('Add'),
                          )
                        : null,
                  );
                }).toList();
                Widget friendsListView = ListView(
                  children: friendListTiles,
                );
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => Scaffold(
                      appBar: AppBar(
                        title: Text('Friends of ${friend.username}'),
                      ),
                      body: friendsListView,
                    ),
                  ),
                );
              },
              child: const Text('See Friends'),
            ),
            TextButton(
              onPressed: () {
                friendService.blockUser(friendshipId!, friend.id!);
              },
              child: const Text('Block'),
            ),
            TextButton(
              onPressed: () {
                friendService.removeFriend(friendshipId!);
              },
              child: const Text('Remove Friend'),
            ),
          ],
        );
      case 'Users':
        return TextButton(
          onPressed: () {
            friendService.sendFriendRequest(userId, friend.id!);
          },
          child: const Text('Follow'),
        );
      case 'Invite-Received':
        return Row(
          children: [
            TextButton(
              onPressed: () {
                friendService.acceptOrDeclineFriendRequest(
                    friendshipId!, RequestOptions.Accepted.value);
              },
              child: const Text('Accept'),
            ),
            TextButton(
              onPressed: () {
                friendService.acceptOrDeclineFriendRequest(
                    friendshipId!, RequestOptions.Declined.value);
              },
              child: const Text('Decline'),
            ),
          ],
        );
      case 'Invite-Sent':
        return TextButton(
          onPressed: () {
            friendService.removeFriendRequest(friendshipId!);
          },
          child: const Text('Remove Invite'),
        );
      case 'Blocked':
        return TextButton(
          onPressed: () {
            friendService.unblockUser(friendshipId!);
          },
          child: const Text('Unblock'),
        );
      default:
        return const SizedBox.shrink();
    }
  }
}
