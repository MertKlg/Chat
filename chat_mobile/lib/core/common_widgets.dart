// lib/widgets/common_widgets.dart
import 'package:chat_android/core/theme.dart';
import 'package:flutter/material.dart';

class CommonWidgets {
  // Login/Register Text Prompt
  static Widget buildTextPrompt({
    required String text,
    required String clickableText,
    required VoidCallback onTap,
  }) {
    return Center(
      child: GestureDetector(
        onTap: onTap,
        child: RichText(
          text: TextSpan(
            text: text,
            style: TextStyle(color: Colors.grey),
            children: [
              TextSpan(
                text: clickableText,
                style: TextStyle(color: Colors.blue),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Elevated Button
  static Widget buildButton({
    required String text,
    required VoidCallback onPressed,
  }) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: DefaultColors.buttonColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(25),
        ),
        padding: EdgeInsets.symmetric(vertical: 15),
      ),
      child: Text(
        text,
        style: TextStyle(color: Colors.white),
      ),
    );
  }

  // Text Input Field
  static Widget buildTextInput({
    required String hint,
    required IconData icon,
    required TextEditingController controller,
    bool isPasswordVisible = false,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: DefaultColors.sentMessageInput, // Background color
        borderRadius: BorderRadius.circular(25),
      ),
      padding: EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          Icon(icon, color: Colors.grey),
          SizedBox(width: 10),
          Expanded(
            child: TextField(
              controller: controller,
              obscureText: isPasswordVisible,
              decoration: InputDecoration(
                hintText: hint,
                hintStyle: TextStyle(color: Colors.grey),
                border: InputBorder.none,
              ),
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}
