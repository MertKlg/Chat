import 'package:chat_android/features/auth/domain/entities/user_entity.dart';

class ResponseModel extends ResponseEntitiy {
  ResponseModel({
    required super.message,
    required super.status,
  });

  factory ResponseModel.fromJson(Map<String, dynamic> json) {
    var userModel = ResponseModel(
      message: json['message'],
      status: json['status'],
    );
    return userModel;
  }
}
