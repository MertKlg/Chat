import 'package:chat_android/features/friend/data/datasource/friend_remote_socket_datasource.dart';
import 'package:chat_android/features/friend/domain/entites/get_friends_entity.dart';
import 'package:chat_android/features/friend/presentation/bloc/friend_block.dart';
import 'package:chat_android/features/friend/presentation/bloc/friend_event.dart';
import 'package:chat_android/features/friend/presentation/bloc/friend_state.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'dart:developer';

class FirendListPage extends StatefulWidget {
  const FirendListPage({super.key});

  @override
  State<FirendListPage> createState() => _FirendListPageState();
}

class _FirendListPageState extends State<FirendListPage> {
  final TextEditingController searchController = TextEditingController();
  late FriendRemoteSocketDatasource _friendRemoteSocketDatasource;

  @override
  void initState() {
    _friendRemoteSocketDatasource = FriendRemoteSocketDatasource();
    _getFriends();
    super.initState();
    _connectSocket();
  }

  Future<void> _connectSocket() async {
    bool isConnected = await _friendRemoteSocketDatasource.connect();
    if (isConnected) {
      log('socket baglandi');
    } else {
      log('socket baglanamadi');
    }
  }

  void _getFriends() {
    BlocProvider.of<FriendBlock>(context).add(GetFriendEvent());
  }

  @override
  void dispose() {
    searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Arkadaşlarım'),
      ),
      body: BlocBuilder<FriendBlock, FriendState>(builder: (context, state) {
        if (state is FriendLoading) {
          return Center(child: CircularProgressIndicator());
        } else if (state is GetFriendsSuccess) {
          return _buildFriendListWidget(context, state.friendRequests);
        } else if (state is FriendFailure) {
          return Center(child: Text(state.errorMessage));
        }
        return Container();
      }),
    );
  }

  Widget _buildFriendListWidget(
      BuildContext context, List<GetFriendsEntity> getFriends) {
    return ListView.builder(
        itemCount: getFriends.length,
        itemBuilder: (context, index) {
          final firend = getFriends[index];
          return Column(children: [
            ListTile(
              leading: CircleAvatar(
                radius: 30,
                backgroundImage:
                    NetworkImage("https://via.placeholder.com/150"),
              ),
              title: Text(firend.username),
              subtitle: Text(firend.email),
            ),
          ]);
        });
  }
}
