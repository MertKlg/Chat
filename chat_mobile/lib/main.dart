import 'package:chat_android/chat_page.dart';
import 'package:chat_android/core/theme.dart';
import 'package:chat_android/login_page.dart';
import 'package:chat_android/message_page.dart';
import 'package:chat_android/register_page.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Chat Mobile',
      theme: AppTheme.darkTheme,
      debugShowCheckedModeBanner: false,
      home: LoginPage(),
    );
  }
}
