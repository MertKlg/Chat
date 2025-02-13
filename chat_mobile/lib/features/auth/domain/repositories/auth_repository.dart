import 'package:chat_android/features/auth/domain/entities/user_entity.dart';

abstract class AuthRepository {
  Future<ResponseEntitiy> login(String email, String password);
  Future<ResponseEntitiy> register(String username, String email,
      String password, String password1, String phone);
}
