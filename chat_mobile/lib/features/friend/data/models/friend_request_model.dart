import 'package:chat_android/features/friend/domain/entites/friend_request_entity.dart';

class FriendRequestModel extends FriendRequestEntity {
  FriendRequestModel({
    required super.userId,
    required super.username,
    required super.email,
  });

  factory FriendRequestModel.fromJson(Map<String, dynamic> json) {
    return FriendRequestModel(
      userId: json['users_id'],
      username: json['username'],
      email: json['email'],
    );
  }
}
