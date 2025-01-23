import 'package:chat_android/core/theme.dart';
import 'package:flutter/material.dart';

class MessagePage extends StatelessWidget {
  const MessagePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Messages',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        centerTitle: false,
        backgroundColor: Colors.transparent,
        elevation: 0,
        toolbarHeight: 70,
        actions: [
          IconButton(
            onPressed: () {},
            icon: Icon(Icons.search),
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 15),
            child: Text(
              'Recent',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ),
          Container(
            height: 100,
            padding: EdgeInsets.all(5),
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: [
                _buildRecentContact('Tamer', context),
                _buildRecentContact('Tamer', context),
                _buildRecentContact('Tamer', context),
                _buildRecentContact('Tamer', context),
                _buildRecentContact('Tamer', context),
                _buildRecentContact('Tamer', context),
                _buildRecentContact('Tamer', context)
              ],
            ),
          ),
          SizedBox(
            height: 10,
          ),
          Expanded(
              child: Container(
            decoration: BoxDecoration(
                color: DefaultColors.messageListPage,
                borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(50),
                    topRight: Radius.circular(50))),
            child: ListView(
              children: [
                _buildMessageTile('tamer', 'hello', '08:41'),
                _buildMessageTile('tamer', 'hello', '08:41'),
                _buildMessageTile('tamer', 'hello', '08:41'),
                _buildMessageTile('tamer', 'hello', '08:41'),
                _buildMessageTile('tamer', 'hello', '08:41'),
                _buildMessageTile('tamer', 'hello', '08:41')
              ],
            ),
          ))
        ],
      ),
    );
  }

  Widget _buildMessageTile(String name, String message, String time) {
    return ListTile(
      contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      leading: CircleAvatar(
        radius: 30,
        backgroundImage: NetworkImage("https://via.placeholder.com/150"),
      ),
      title: Text(
        name,
        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
      ),
      subtitle: Text(
        message,
        style: TextStyle(color: Colors.grey),
        overflow: TextOverflow.ellipsis,
      ),
      trailing: Text(
        time,
        style: TextStyle(color: Colors.grey),
      ),
    );
  }

  Widget _buildRecentContact(String name, BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      child: Column(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundImage: NetworkImage("https://via.placeholder.com/150"),
          ),
          SizedBox(
            height: 5,
          ),
          Text(name, style: Theme.of(context).textTheme.bodyMedium)
        ],
      ),
    );
  }
}
