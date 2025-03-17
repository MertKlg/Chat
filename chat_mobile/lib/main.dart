import 'package:chat_android/core/theme.dart';
import 'package:chat_android/features/auth/data/datasource/auth_remote_data_source.dart';
import 'package:chat_android/features/auth/data/repositories/auth_repository_impl.dart';

import 'package:chat_android/features/auth/domain/usecasses/login_use_case.dart';
import 'package:chat_android/features/auth/domain/usecasses/register_use_case.dart';
import 'package:chat_android/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:chat_android/features/auth/presentation/pages/login_page.dart';

import 'package:chat_android/features/auth/presentation/pages/register_page.dart';
import 'package:chat_android/features/friend/data/datasource/friend_remote_socket_datasource.dart';
import 'package:chat_android/features/friend/data/repositories/friend_repository_imp.dart';
import 'package:chat_android/features/friend/domain/usecasses/add_friend_usecassess.dart';
import 'package:chat_android/features/friend/domain/usecasses/firend_get_request_usecassess.dart';
import 'package:chat_android/features/friend/domain/usecasses/friend_update_request_usscasses.dart';
import 'package:chat_android/features/friend/domain/usecasses/get_friends_usecasses.dart';
import 'package:chat_android/features/friend/domain/usecasses/search_friend_usecasses.dart';
import 'package:chat_android/features/friend/presentation/bloc/friend_block.dart';
import 'package:chat_android/features/friend/presentation/pages/firend_search_page.dart';
import 'package:chat_android/features/friend/presentation/pages/friend_request_page.dart';
import 'package:chat_android/features/home/home_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:developer';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  log(dotenv.env['BASE_URL']!);

  final authRepository =
      AuthRepositoryImpl(authRemoteDataSource: AuthRemoteDataSource());
  final friendRepository = FriendRepositoryImp(FriendRemoteSocketDatasource());
  runApp(MyApp(
    authRepository: authRepository,
    friendRepository: friendRepository,
  ));
}

class MyApp extends StatelessWidget {
  final AuthRepositoryImpl authRepository;
  final FriendRepositoryImp friendRepository;
  const MyApp(
      {super.key,
      required this.authRepository,
      required this.friendRepository});
  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (_) => AuthBloc(
            registerUseCase: RegisterUseCase(repository: authRepository),
            loginUseCase: LoginUseCase(repository: authRepository),
          ),
        ),
        BlocProvider(
            create: (_) => FriendBlock(
                searchFriendUsecasses:
                    SearchFriendUsecasses(friendRepository: friendRepository),
                addFriendUsecassess:
                    AddFriendUsecassess(friendRepository: friendRepository),
                firendGetRequestUsecassess: FirendGetRequestUsecassess(
                    friendRepository: friendRepository),
                friendUpdateRequestUsscasses: FriendUpdateRequestUsscasses(
                    friendRepository: friendRepository),
                getFriendsUsecasses:
                    GetFriendsUsecasses(friendRepository: friendRepository)))
      ],
      child: MaterialApp(
        title: 'Chat Mobile',
        theme: AppTheme.darkTheme,
        debugShowCheckedModeBanner: false,
        home: RegisterPage(),
        routes: {
          '/login': (_) => LoginPage(),
          '/register': (_) => RegisterPage(),
          '/home': (_) => HomePage(),
          '/friendsRequest': (_) => FriendRequestPage(),
          '/friendsSearch': (_) => FirendSearchPage()
        },
      ),
    );
  }
}
