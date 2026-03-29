import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'api_service.dart';
import 'widgets/tech_widgets.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen>
    with SingleTickerProviderStateMixin {
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _apiService = ApiService();

  bool _showPassword = false;
  bool _isLoading = false;
  String? _error;
  String? _focused;
  late AnimationController _mountCtrl;
  late Animation<double> _mountAnim;

  @override
  void initState() {
    super.initState();
    _mountCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..forward();
    _mountAnim = CurvedAnimation(parent: _mountCtrl, curve: Curves.easeOut);
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _mountCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (_nameCtrl.text.isEmpty || _emailCtrl.text.isEmpty || _passCtrl.text.isEmpty) {
      setState(() => _error = 'Please fill all required fields.');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final result = await _apiService.register(
        _nameCtrl.text,
        _emailCtrl.text,
        _passCtrl.text,
      );
      if (mounted) {
        if (result != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Row(
                children: [
                  Icon(Icons.check_circle, color: Colors.white, size: 18),
                  SizedBox(width: 10),
                  Text('Agent Initialized Successfully.', style: TextStyle(color: Colors.white)),
                ],
              ),
              backgroundColor: WColors.primary,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          );
          await Future.delayed(const Duration(milliseconds: 1500));
          if (mounted) {
            Navigator.pushReplacementNamed(context, '/dashboard');
          }
        } else {
          setState(() {
            _error = 'Registration failed. Email might already be in use.';
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      setState(() {
        _error = 'Process failed. Check your connection.';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: WebBackground(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 60),
          child: FadeTransition(
            opacity: _mountAnim,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Back to login
                TextButton.icon(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(LucideIcons.arrowLeft, size: 16, color: WColors.mutedFg),
                  label: const Text(
                    'BACK TO LOGIN',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2,
                      color: WColors.mutedFg,
                    ),
                  ),
                ),

                const SizedBox(height: 30),

                Stack(
                  clipBehavior: Clip.none,
                  children: [
                    // Corner brackets
                    Positioned(
                      top: -8, left: -8,
                      child: _TechBracketTL(color: WColors.primary.withOpacity(0.5)),
                    ),
                    Positioned(
                      bottom: -8, right: -8,
                      child: _TechBracketBR(color: WColors.primary.withOpacity(0.5)),
                    ),

                    GlassCard(
                      borderRadius: 32,
                      padding: const EdgeInsets.all(28),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              Text(
                                '[REG: REQ]  STK-H v1.0',
                                style: TextStyle(
                                  fontSize: 9,
                                  fontFamily: 'monospace',
                                  color: WColors.primary.withOpacity(0.3),
                                  letterSpacing: 2,
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 20),

                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: WColors.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(100),
                              border: Border.all(color: WColors.primary.withOpacity(0.2)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(LucideIcons.userPlus, size: 12, color: WColors.primary),
                                const SizedBox(width: 6),
                                const Text(
                                  'NEW AGENT INITIALIZATION',
                                  style: TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 2,
                                    color: WColors.primary,
                                  ),
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: 20),

                          const Text(
                            'Join the Network',
                            style: TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.w800,
                              color: WColors.foreground,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Initialize your secure credentials',
                            style: TextStyle(fontSize: 13, color: WColors.mutedFg),
                          ),

                          const SizedBox(height: 32),

                          if (_error != null) ...[
                            Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: WColors.danger.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: WColors.danger.withOpacity(0.2)),
                              ),
                              child: Row(
                                children: [
                                  Icon(LucideIcons.alertTriangle, size: 16, color: WColors.danger),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(
                                      _error!,
                                      style: TextStyle(fontSize: 12, color: WColors.danger),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 20),
                          ],

                          _buildInputField(
                            label: 'FULL NAME',
                            controller: _nameCtrl,
                            icon: LucideIcons.user,
                            hint: 'John Doe',
                            fieldKey: 'name',
                          ),

                          const SizedBox(height: 20),

                          _buildInputField(
                            label: 'EMAIL ADDRESS',
                            controller: _emailCtrl,
                            icon: LucideIcons.mail,
                            hint: 'agent@stockhub.com',
                            fieldKey: 'email',
                          ),

                          const SizedBox(height: 20),

                          _buildPasswordField(),

                          const SizedBox(height: 32),

                          SizedBox(
                            width: double.infinity,
                            height: 60,
                            child: _isLoading
                                ? Container(
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(14),
                                      color: WColors.primary,
                                    ),
                                    child: const Center(
                                      child: SizedBox(
                                        width: 22,
                                        height: 22,
                                        child: CircularProgressIndicator(
                                          color: Colors.white,
                                          strokeWidth: 2.5,
                                        ),
                                      ),
                                    ),
                                  )
                                : OutlinedButton(
                                    onPressed: _handleRegister,
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: WColors.primary,
                                      side: BorderSide(
                                        color: WColors.primary.withOpacity(0.3),
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(14),
                                      ),
                                      backgroundColor: WColors.primary.withOpacity(0.05),
                                    ),
                                    child: const Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          'EXECUTE INITIALIZATION',
                                          style: TextStyle(
                                            fontWeight: FontWeight.w900,
                                            letterSpacing: 2,
                                            fontSize: 12,
                                          ),
                                        ),
                                        SizedBox(width: 16),
                                        Icon(LucideIcons.chevronRight, size: 18),
                                      ],
                                    ),
                                  ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 30),
                Center(
                  child: TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: RichText(
                      text: TextSpan(
                        style: const TextStyle(fontSize: 13, color: WColors.mutedFg),
                        children: [
                          const TextSpan(text: 'Already an agent? '),
                          TextSpan(
                            text: 'Login here',
                            style: TextStyle(color: WColors.primary, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInputField({
    required String label,
    required TextEditingController controller,
    required IconData icon,
    required String hint,
    required String fieldKey,
  }) {
    final isFocused = _focused == fieldKey;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.5,
            color: WColors.foreground.withOpacity(0.5),
          ),
        ),
        const SizedBox(height: 8),
        AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isFocused
                  ? WColors.primary.withOpacity(0.5)
                  : Colors.white.withOpacity(0.05),
              width: isFocused ? 2 : 1,
            ),
            color: Colors.white.withOpacity(0.03),
          ),
          child: Row(
            children: [
              Container(
                width: 4,
                height: 56,
                decoration: BoxDecoration(
                  color: isFocused
                      ? WColors.primary.withOpacity(0.7)
                      : WColors.primary.withOpacity(0.2),
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(15),
                    bottomLeft: Radius.circular(15),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Icon(icon, size: 18, color: WColors.mutedFg),
              ),
              Expanded(
                child: TextField(
                  controller: controller,
                  onTap: () => setState(() => _focused = fieldKey),
                  onTapOutside: (_) => setState(() => _focused = null),
                  style: const TextStyle(
                    fontSize: 14,
                    color: WColors.foreground,
                    fontWeight: FontWeight.w600,
                  ),
                  decoration: InputDecoration(
                    hintText: hint,
                    hintStyle: TextStyle(color: WColors.mutedFg.withOpacity(0.3)),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPasswordField() {
    final isFocused = _focused == 'password';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'SECURITY PASSWORD',
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.5,
            color: WColors.foreground.withOpacity(0.5),
          ),
        ),
        const SizedBox(height: 8),
        AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isFocused
                  ? WColors.primary.withOpacity(0.5)
                  : Colors.white.withOpacity(0.05),
              width: isFocused ? 2 : 1,
            ),
            color: Colors.white.withOpacity(0.03),
          ),
          child: Row(
            children: [
              Container(
                width: 4,
                height: 56,
                decoration: BoxDecoration(
                  color: isFocused
                      ? WColors.primary.withOpacity(0.7)
                      : WColors.primary.withOpacity(0.2),
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(15),
                    bottomLeft: Radius.circular(15),
                  ),
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 12),
                child: Icon(LucideIcons.lock, size: 18, color: WColors.mutedFg),
              ),
              Expanded(
                child: TextField(
                  controller: _passCtrl,
                  obscureText: !_showPassword,
                  onTap: () => setState(() => _focused = 'password'),
                  onTapOutside: (_) => setState(() => _focused = null),
                  style: const TextStyle(
                    fontSize: 14,
                    color: WColors.foreground,
                    fontWeight: FontWeight.w600,
                  ),
                  decoration: InputDecoration(
                    hintText: '••••••••',
                    hintStyle: TextStyle(color: WColors.mutedFg.withOpacity(0.3)),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(vertical: 16),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _showPassword ? LucideIcons.eyeOff : LucideIcons.eye,
                        size: 18,
                        color: WColors.mutedFg.withOpacity(0.5),
                      ),
                      onPressed: () => setState(() => _showPassword = !_showPassword),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ── Shared UI helper components/painters from LoginScreen ─────────────────────
class _TechBracketTL extends StatelessWidget {
  final Color color;
  const _TechBracketTL({required this.color});
  @override
  Widget build(BuildContext context) => CustomPaint(
    size: const Size(40, 40),
    painter: _BracketPainterTL(color),
  );
}

class _TechBracketBR extends StatelessWidget {
  final Color color;
  const _TechBracketBR({required this.color});
  @override
  Widget build(BuildContext context) => CustomPaint(
    size: const Size(40, 40),
    painter: _BracketPainterBR(color),
  );
}

class _BracketPainterTL extends CustomPainter {
  final Color color;
  _BracketPainterTL(this.color);
  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()..color = color..strokeWidth = 2..style = PaintingStyle.stroke;
    final path = Path()
      ..moveTo(0, size.height)
      ..lineTo(0, 0)
      ..lineTo(size.width, 0);
    canvas.drawPath(path, p);
  }
  @override
  bool shouldRepaint(_) => false;
}

class _BracketPainterBR extends CustomPainter {
  final Color color;
  _BracketPainterBR(this.color);
  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()..color = color..strokeWidth = 2..style = PaintingStyle.stroke;
    final path = Path()
      ..moveTo(size.width, 0)
      ..lineTo(size.width, size.height)
      ..lineTo(0, size.height);
    canvas.drawPath(path, p);
  }
  @override
  bool shouldRepaint(_) => false;
}
