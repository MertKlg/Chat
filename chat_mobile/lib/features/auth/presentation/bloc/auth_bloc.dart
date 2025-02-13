import 'package:chat_android/features/auth/domain/usecasses/login_use_case.dart';
import 'package:chat_android/features/auth/domain/usecasses/register_use_case.dart';
import 'package:chat_android/features/auth/presentation/bloc/auth_event.dart';
import 'package:chat_android/features/auth/presentation/bloc/auth_satate.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthBloc extends Bloc<AuthEvent, AuthSatate> {
  final RegisterUseCase registerUseCase;
  final LoginUseCase loginUseCase;
  final _storage = FlutterSecureStorage();

  AuthBloc({required this.registerUseCase, required this.loginUseCase})
      : super(AuthInitial()) {
    on<LoginEvent>(_onLogin);
    on<RegisterEvent>(_onRegister);
  }

  Future<void> _onRegister(
      RegisterEvent event, Emitter<AuthSatate> emit) async {
    emit(AuthLoading());
    try {
      await registerUseCase.call(event.username, event.email, event.password,
          event.password1, event.phone);

      emit(AuthSuccess(message: 'Register is succesful'));
    } catch (err) {
      emit(AuthFailure(error: 'Register failed $err'));
    }
  }

  Future<void> _onLogin(LoginEvent event, Emitter<AuthSatate> emit) async {
    emit(AuthLoading());
    try {
      await loginUseCase.call(
        event.email,
        event.password,
      );
      await _storage.write(key: 'token', value: 'user.token');
      emit(AuthSuccess(message: 'Login is succesful'));
    } catch (err) {
      emit(AuthFailure(error: 'Login failed $err'));
    }
  }
}
