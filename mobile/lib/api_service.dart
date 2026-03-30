import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Override at build time with --dart-define=API_BASE_URL=https://your-backend.onrender.com/api
  // Default is localhost for local development.
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://stockhub-a450.onrender.com/api',
  );

  Future<Map<String, dynamic>?> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', data['token']);
        await prefs.setString('user', jsonEncode(data['user']));
        return data;
      } else {
        print('Login failed: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      print('Login error: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> register(String name, String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', data['token']);
        await prefs.setString('user', jsonEncode(data['user']));
        return data;
      } else {
        print('Register failed: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      print('Register error: $e');
    }
    return null;
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<Map<String, dynamic>?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('user');
    if (raw == null) return null;
    return jsonDecode(raw);
  }

  Future<Map<String, dynamic>?> getMe() async {
    final token = await getToken();
    if (token == null) return null;

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/auth/me'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user', jsonEncode(data));
        return data;
      }
    } catch (e) {
      print('Get profile error: $e');
    }
    return null;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
  }

  Future<List<dynamic>?> getProducts() async {
    final token = await getToken();
    if (token == null) return null;

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/products'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      print('Get products error: $e');
    }
    return null;
  }

  Future<List<dynamic>?> getSales() async {
    final token = await getToken();
    if (token == null) return null;

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/sales'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      print('Get sales error: $e');
    }
    return null;
  }

  Future<List<dynamic>?> getInventory() async {
    final token = await getToken();
    if (token == null) return null;

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/inventory'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      print('Get inventory error: $e');
    }
    return null;
  }

  Future<bool> updateInventory(String id, Map<String, dynamic> data) async {
    final token = await getToken();
    if (token == null) return false;

    try {
      final response = await http.put(
        Uri.parse('$baseUrl/inventory/$id'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(data),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Update inventory error: $e');
      return false;
    }
  }

  Future<bool> restockInventory(Map<String, dynamic> data) async {
    final token = await getToken();
    if (token == null) return false;

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/inventory/restock'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(data),
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('Restock inventory error: $e');
      return false;
    }
  }

  Future<bool> createSale(Map<String, dynamic> saleData) async {
    final token = await getToken();
    if (token == null) return false;

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/sales'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(saleData),
      );

      return response.statusCode == 201;
    } catch (e) {
      print('Create sale error: $e');
      return false;
    }
  }

  Future<List<dynamic>?> getTransfers() async {
    final token = await getToken();
    if (token == null) return null;

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/transfers'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      print('Get transfers error: $e');
    }
    return null;
  }

  Future<bool> createTransfer(Map<String, dynamic> transferData) async {
    final token = await getToken();
    if (token == null) return false;

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/transfers'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(transferData),
      );

      return response.statusCode == 201;
    } catch (e) {
      print('Create transfer error: $e');
      return false;
    }
  }

  Future<Map<String, dynamic>?> getDashboard({String? from, String? to}) async {
    final token = await getToken();
    if (token == null) return null;

    try {
      String qs = '';
      List<String> parts = [];
      if (from != null) parts.add('from=$from');
      if (to != null) parts.add('to=$to');
      if (parts.isNotEmpty) qs = '?' + parts.join('&');

      final response = await http.get(
        Uri.parse('$baseUrl/dashboard$qs'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      print('Get dashboard error: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> getSummary({String? from, String? to, String? storeId}) async {
    final token = await getToken();
    if (token == null) return null;

    try {
      String qs = '';
      List<String> parts = [];
      if (from != null) parts.add('from=$from');
      if (to != null) parts.add('to=$to');
      if (storeId != null && storeId != 'all') parts.add('storeId=$storeId');
      if (parts.isNotEmpty) qs = '?' + parts.join('&');

      final response = await http.get(
        Uri.parse('$baseUrl/reports/summary$qs'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      print('Get summary error: $e');
    }
    return null;
  }

  Future<String> getExportUrl(String type, {String storeId = 'all'}) async {
    final token = await getToken();
    return '$baseUrl/reports/$type?storeId=$storeId&token=$token';
  }

  // --- CRUD METHODS ---

  Future<bool> createProduct(Map<String, dynamic> productData) async {
    final token = await getToken();
    if (token == null) return false;

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/products'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(productData),
      );
      return response.statusCode == 201;
    } catch (e) {
      print('Create product error: $e');
      return false;
    }
  }

  Future<bool> updateProduct(String id, Map<String, dynamic> productData) async {
    final token = await getToken();
    if (token == null) return false;

    try {
      final response = await http.put(
        Uri.parse('$baseUrl/products/$id'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(productData),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Update product error: $e');
      return false;
    }
  }

  Future<bool> deleteProduct(String id) async {
    final token = await getToken();
    if (token == null) return false;

    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/products/$id'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Delete product error: $e');
      return false;
    }
  }

  Future<List<dynamic>?> getCategories() async {
    final token = await getToken();
    if (token == null) return null;

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/categories'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      print('Get categories error: $e');
    }
    return null;
  }

  Future<List<dynamic>?> getStores() async {
    final token = await getToken();
    if (token == null) return null;

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/stores'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (e) {
      print('Get stores error: $e');
    }
    return null;
  }

  Future<bool> createStore(Map<String, dynamic> storeData) async {
    final token = await getToken();
    if (token == null) return false;

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/stores'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(storeData),
      );
      return response.statusCode == 201;
    } catch (e) {
      print('Create store error: $e');
      return false;
    }
  }

  Future<bool> updateStore(String id, Map<String, dynamic> storeData) async {
    final token = await getToken();
    if (token == null) return false;

    try {
      final response = await http.put(
        Uri.parse('$baseUrl/stores/$id'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(storeData),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Update store error: $e');
      return false;
    }
  }

  Future<bool> deleteStore(String id) async {
    final token = await getToken();
    if (token == null) return false;

    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/stores/$id'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Delete store error: $e');
      return false;
    }
  }

  Future<bool> createCategory(Map<String, dynamic> categoryData) async {
    final token = await getToken();
    if (token == null) return false;

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/categories'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(categoryData),
      );
      return response.statusCode == 201;
    } catch (e) {
      print('Create category error: $e');
      return false;
    }
  }

  Future<bool> updateCategory(String id, Map<String, dynamic> categoryData) async {
    final token = await getToken();
    if (token == null) return false;

    try {
      final response = await http.put(
        Uri.parse('$baseUrl/categories/$id'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(categoryData),
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Update category error: $e');
      return false;
    }
  }

  Future<bool> deleteCategory(String id) async {
    final token = await getToken();
    if (token == null) return false;

    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/categories/$id'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Delete category error: $e');
      return false;
    }
  }
}
