import 'package:chat_android/features/auth/data/datasource/auth_remote_data_source.dart';
import 'package:chat_android/features/auth/domain/entities/user_entity.dart';
import 'package:chat_android/features/auth/domain/repositories/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource authRemoteDataSource;

  AuthRepositoryImpl({required this.authRemoteDataSource});

  @override
  Future<ResponseEntitiy> login(String email, String password) async {
    return authRemoteDataSource.login(email: email, password: password);
  }

  @override
  Future<ResponseEntitiy> register(String username, String email,
      String password, String password1, String phone) async {
    return authRemoteDataSource.register(
        username: username,
        email: email,
        password: password,
        password1: password1,
        phone: phone);
  }
}
