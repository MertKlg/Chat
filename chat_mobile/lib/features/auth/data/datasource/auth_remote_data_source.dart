import 'dart:convert';
import 'dart:developer';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:chat_android/features/auth/data/models/user_model.dart';

class AuthRemoteDataSource {
  final String baseUrl = 'http://192.168.1.100:8001/api/v1/auth';

  Future<ResponseModel> login(
      {required String email, required String password}) async {
    final response = await http.post(
      Uri.parse('$baseUrl/sign-in'),
      body: jsonEncode(
        {'email': email, 'password': password},
      ),
      headers: {'Content-Type': 'application/json'},
    );

    return ResponseModel.fromJson(
      jsonDecode(response.body),
    );
  }

  Future<ResponseModel> register(
      {required String username,
      required String email,
      required String password,
      required String password1,
      required String phone}) async {
    final response = await http.post(
      Uri.parse('$baseUrl/sign-up'),
      body: jsonEncode(
        {
          'username': username,
          'email': email,
          'password': password,
          'passwordAgain': password1,
          'phone': phone
        },
      ),
      headers: {'Content-Type': 'application/json'},
    );

    stderr.writeln(response.body);
    log(response.body);
    return ResponseModel.fromJson(jsonDecode(response.body));
  }
}
