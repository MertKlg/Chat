import 'package:chat_android/core/theme.dart';
import 'package:flutter/material.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  void _showInputValues() {
    String username = _usernameController.text;
    String email = _emailController.text;
    String password = _passwordController.text;

    print("username: $username -Emial: $email - Password: $password ");
  }

  @override
  void dispose() {
    _usernameController.dispose();
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
              _buildTextInput('Username', Icons.person, _usernameController),
              SizedBox(
                height: 10,
              ),
              _buildTextInput('Email', Icons.person, _emailController),
              SizedBox(
                height: 10,
              ),
              _buildTextInput('Password', Icons.person, _passwordController,
                  isPasswordVisible: true),
              SizedBox(
                height: 20,
              ),
              _buildRegisterButton(),
              SizedBox(
                height: 20,
              ),
              _buildLoginPromt()
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLoginPromt() {
    return Center(
      child: GestureDetector(
        onTap: () {},
        child: RichText(
          text: TextSpan(
            text: 'Already have an account?',
            style: TextStyle(color: Colors.grey),
            children: [
              TextSpan(
                  text: 'Click here to login',
                  style: TextStyle(color: Colors.blue))
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRegisterButton() {
    return ElevatedButton(
      onPressed: _showInputValues,
      style: ElevatedButton.styleFrom(
          backgroundColor: DefaultColors.buttonColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(25),
          ),
          padding: EdgeInsets.symmetric(vertical: 15)),
      child: Text(
        'Register',
        style: TextStyle(color: Colors.white),
      ),
    );
  }

  Widget _buildTextInput(
      String hint, IconData icon, TextEditingController controller,
      {bool isPasswordVisible = false}) {
    return Container(
      decoration: BoxDecoration(
        color: DefaultColors.sentMessageInput,
        borderRadius: BorderRadius.circular(25),
      ),
      padding: EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          Icon(icon, color: Colors.grey),
          SizedBox(
            width: 10,
          ),
          Expanded(
            child: TextField(
              controller: controller,
              obscureText: isPasswordVisible,
              decoration: InputDecoration(
                  hintText: hint,
                  hintStyle: TextStyle(color: Colors.grey),
                  border: InputBorder.none),
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}
