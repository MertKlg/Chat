import 'package:chat_android/core/common_widgets.dart';
import 'package:chat_android/core/theme.dart';
import 'package:flutter/material.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  void _showInputValues() {
    String email = _emailController.text;
    String password = _passwordController.text;

    print("Emial: $email - Password: $password ");
  }

  @override
  void dispose() {
    _passwordController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: EdgeInsets.all(20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              CommonWidgets.buildTextInput(
                  hint: 'Email',
                  icon: Icons.person,
                  controller: _emailController),
              SizedBox(
                height: 10,
              ),
              CommonWidgets.buildTextInput(
                hint: 'Passord',
                icon: Icons.person,
                controller: _passwordController,
              ),
              SizedBox(
                height: 20,
              ),
              CommonWidgets.buildButton(
                  onPressed: _showInputValues, text: 'Login'),

              SizedBox(
                height: 20,
              ),
              CommonWidgets.buildTextPrompt(
                  text: 'Dont you have an account?',
                  clickableText: 'Click here to register',
                  onTap: () {})
              //_buildLoginPromt()
            ],
          ),
        ),
      ),
    );
  }
}
