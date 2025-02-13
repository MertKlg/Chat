import 'package:chat_android/features/auth/domain/entities/user_entity.dart';
import 'package:chat_android/features/auth/domain/repositories/auth_repository.dart';

class LoginUseCase {
  final AuthRepository repository;

  LoginUseCase({required this.repository});

  Future<ResponseEntitiy> call(String email, String password) {
    return repository.login(email, password);
  }
}
