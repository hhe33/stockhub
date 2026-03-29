import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'api_service.dart';
import 'widgets/tech_widgets.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _api = ApiService();
  bool _isLoading = true;
  Map<String, dynamic>? _user;

  // Form controllers
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController(text: "+1 555-0100"); // Mock placeholder to match web

  @override
  void initState() {
    super.initState();
    _fetchUser();
  }

  Future<void> _fetchUser() async {
    setState(() => _isLoading = true);
    // Try to get fresh data from backend
    var user = await _api.getMe();
    // Fallback to local storage if offline or failed
    user ??= await _api.getUser();
    
    if (user != null) {
      _user = user;
      _nameController.text = user['name'] ?? '';
      _emailController.text = user['email'] ?? '';
    }
    setState(() => _isLoading = false);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    String initials = 'U';
    if (_nameController.text.isNotEmpty) {
      final names = _nameController.text.trim().split(' ');
      if (names.length > 1) {
        initials = (names[0][0] + names[names.length - 1][0]).toUpperCase();
      } else if (names[0].isNotEmpty) {
        initials = names[0][0].toUpperCase();
      }
    }

    return Scaffold(
      body: WebBackground(
        child: Column(
          children: [
            _buildTopBar(),
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(color: WColors.primary, strokeWidth: 2))
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildSectionHeader('Profile Information', 'Update your personal details and contact information.'),
                          const SizedBox(height: 20),
                          
                          // Avatar section
                          Center(
                            child: Column(
                              children: [
                                Container(
                                  width: 100,
                                  height: 100,
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [WColors.primary, WColors.primary.withOpacity(0.6)],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
                                    borderRadius: BorderRadius.circular(24),
                                    boxShadow: [
                                      BoxShadow(
                                        color: WColors.primary.withOpacity(0.25),
                                        blurRadius: 20,
                                        spreadRadius: 5,
                                      ),
                                    ],
                                  ),
                                  child: Center(
                                    child: Text(
                                      initials,
                                      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 16),
                                OutlinedButton(
                                  onPressed: () {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Photo upload coming soon...')),
                                    );
                                  },
                                  style: OutlinedButton.styleFrom(
                                    side: BorderSide(color: Colors.white.withOpacity(0.1)),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                  child: const Text('Change Photo', style: TextStyle(color: WColors.mutedFg, fontSize: 12)),
                                ),
                              ],
                            ),
                          ),
                          
                          const SizedBox(height: 32),
                          
                          // Form
                          GlassCard(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              children: [
                                _buildField(LucideIcons.user, 'Full Name', _nameController),
                                const SizedBox(height: 20),
                                _buildField(LucideIcons.mail, 'Email Address', _emailController, readOnly: true),
                                const SizedBox(height: 20),
                                _buildField(LucideIcons.phone, 'Phone Number', _phoneController),
                              ],
                            ),
                          ),
                          
                          const SizedBox(height: 32),
                          
                          SizedBox(
                            width: double.infinity,
                            height: 54,
                            child: ElevatedButton.icon(
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Changes saved locally')),
                                );
                              },
                              icon: const Icon(LucideIcons.save, size: 18),
                              label: const Text('Save Changes', style: TextStyle(fontWeight: FontWeight.bold)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: WColors.primary,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              ),
                            ),
                          ),
                          
                          const SizedBox(height: 40),
                        ],
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopBar() {
    return SafeArea(
      bottom: false,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Row(
          children: [
            IconButton(
              icon: const Icon(LucideIcons.arrowLeft, color: WColors.mutedFg, size: 20),
              onPressed: () => Navigator.pop(context),
            ),
            const SizedBox(width: 8),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('SETTINGS',
                    style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 3, color: WColors.primary)),
                Text('Account Management',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: WColors.foreground)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, String subtitle) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: WColors.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(LucideIcons.user, color: WColors.primary, size: 20),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: WColors.foreground)),
              Text(subtitle, style: const TextStyle(fontSize: 11, color: WColors.mutedFg)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildField(IconData icon, String label, TextEditingController controller, {bool readOnly = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 14, color: WColors.mutedFg),
            const SizedBox(width: 8),
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: WColors.mutedFg)),
          ],
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          readOnly: readOnly,
          style: const TextStyle(color: WColors.foreground, fontSize: 14),
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white.withOpacity(0.02),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: Colors.white.withOpacity(0.05)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: Colors.white.withOpacity(0.05)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: WColors.primary, width: 1.5),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
        ),
      ],
    );
  }
}
