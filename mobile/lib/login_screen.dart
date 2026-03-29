import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'api_service.dart';
import 'register_screen.dart';
import 'widgets/tech_widgets.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _apiService = ApiService();

  bool _showPassword = false;
  bool _isLoading = false;
  String? _error;
  String? _focused;
  int _step = 1; // 1 = branding, 2 = form (mobile step pattern from web)
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
    _emailCtrl.dispose();
    _passCtrl.dispose();
    _mountCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final result = await _apiService.login(_emailCtrl.text, _passCtrl.text);
      if (mounted) {
        if (result != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Row(
                children: [
                  Icon(Icons.check_circle, color: Colors.white, size: 18),
                  SizedBox(width: 10),
                  Text('Login Successful. Initializing...', style: TextStyle(color: Colors.white)),
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
            _error = 'Invalid credentials. Please verify your agent access.';
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      setState(() {
        _error = 'Authentication failed. Check your connection.';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: WebBackground(
        child: Stack(
          children: [
            ScanningLine(color: WColors.primary),

            // Mobile step-based layout (matches web's lg:hidden / hidden lg:flex pattern)
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 400),
              transitionBuilder: (child, anim) => FadeTransition(
                opacity: anim,
                child: SlideTransition(
                  position: Tween<Offset>(
                    begin: const Offset(0.05, 0),
                    end: Offset.zero,
                  ).animate(anim),
                  child: child,
                ),
              ),
              child: _step == 1
                  ? _buildBrandingPanel(key: const ValueKey('branding'))
                  : _buildFormPanel(key: const ValueKey('form')),
            ),
          ],
        ),
      ),
    );
  }

  // ── BRANDING PANEL (Step 1) ─────────────────────────────────────────────────
  Widget _buildBrandingPanel({Key? key}) {
    return SingleChildScrollView(
      key: key,
      padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 60),
      child: FadeTransition(
        opacity: _mountAnim,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Logo + theme toggle (aligned with web navbar)
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: WColors.primary,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: WColors.primary.withOpacity(0.4),
                        blurRadius: 20,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Icon(LucideIcons.package2, color: Colors.white, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: RichText(
                    text: TextSpan(
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                      children: [
                        const TextSpan(
                          text: 'Stock',
                          style: TextStyle(color: WColors.foreground),
                        ),
                        TextSpan(
                          text: 'Hub',
                          style: TextStyle(color: WColors.primary),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                const ThemeToggleButton(),
              ],
            ),

            const SizedBox(height: 56),

            // Badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: WColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(100),
                border: Border.all(color: WColors.primary.withOpacity(0.2)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(LucideIcons.sparkles, size: 14, color: WColors.primary),
                  const SizedBox(width: 8),
                  const Text(
                    'MASTER YOUR INVENTORY',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2,
                      color: WColors.primary,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Hero title
            RichText(
              text: const TextSpan(
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.w800,
                  height: 1.25,
                  color: WColors.foreground,
                ),
                children: [
                  TextSpan(text: 'Control '),
                  TextSpan(
                    text: 'Every Store',
                    style: TextStyle(color: WColors.primary),
                  ),
                  TextSpan(text: ' with\nTotal Precision.'),
                ],
              ),
            ),

            const SizedBox(height: 20),

            const Text(
              'The all-in-one platform for retail networks. Manage stock, track sales, and optimize transfers across your entire organization.',
              style: TextStyle(
                fontSize: 15,
                color: WColors.mutedFg,
                height: 1.6,
              ),
            ),

            const SizedBox(height: 40),

            // Stats grid
            Row(
              children: [
                _buildStatPill('500+', 'Active Stores'),
                const SizedBox(width: 12),
                _buildStatPill('1M+', 'Items Synced'),
                const SizedBox(width: 12),
                _buildStatPill('99.9%', 'Uptime'),
              ],
            ),

            const SizedBox(height: 56),

            // CTA
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: () => setState(() => _step = 2),
                style: ElevatedButton.styleFrom(
                  backgroundColor: WColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(18),
                  ),
                  elevation: 0,
                  shadowColor: WColors.primary.withOpacity(0.5),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Get Started',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    SizedBox(width: 12),
                    Icon(LucideIcons.arrowRight, size: 20),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatPill(String value, String label) {
    return Expanded(
      child: GlassCard(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        borderRadius: 16,
        child: Column(
          children: [
            Text(
              value,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w900,
                color: WColors.foreground,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.bold,
                letterSpacing: 1,
                color: WColors.mutedFg,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── FORM PANEL (Step 2) ─────────────────────────────────────────────────────
  Widget _buildFormPanel({Key? key}) {
    return SingleChildScrollView(
      key: key,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 60),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Back button
          TextButton.icon(
            onPressed: () => setState(() => _step = 1),
            icon: const Icon(LucideIcons.arrowLeft, size: 16, color: WColors.mutedFg),
            label: const Text(
              'RETURN TO COMMAND',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w900,
                letterSpacing: 2,
                color: WColors.mutedFg,
              ),
            ),
          ),

          const SizedBox(height: 40),

          // Console container (web: asymmetric rounded box)
          Stack(
            clipBehavior: Clip.none,
            children: [
              // Tech corner brackets
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
                    // System metadata
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          '[AUTH: REQ]  STK-H v1.0',
                          style: TextStyle(
                            fontSize: 9,
                            fontFamily: 'monospace',
                            color: WColors.primary.withOpacity(0.3),
                            letterSpacing: 2,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 28),

                    // Header
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
                          Icon(LucideIcons.shield, size: 12, color: WColors.primary),
                          const SizedBox(width: 6),
                          const Text(
                            'SECURE ACCESS PROTOCOL',
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
                      'Welcome Back',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w800,
                        color: WColors.foreground,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Please verify your agent credentials',
                      style: TextStyle(fontSize: 13, color: WColors.mutedFg),
                    ),

                    const SizedBox(height: 32),

                    // Error message
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

                    // Email field
                    _buildInputField(
                      label: 'EMAIL ADDRESS',
                      controller: _emailCtrl,
                      icon: LucideIcons.mail,
                      hint: 'admin@stockhub.com',
                      fieldKey: 'email',
                    ),

                    const SizedBox(height: 20),

                    // Password field
                    _buildPasswordField(),

                    const SizedBox(height: 32),

                    // Submit button (web: fill animation on hover → on mobile: tap)
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
                              onPressed: _handleLogin,
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
                                    'EXECUTE LOGIN',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 3,
                                      fontSize: 12,
                                    ),
                                  ),
                                  SizedBox(width: 16),
                                  SizedBox(
                                    width: 24,
                                    height: 1,
                                    child: DecoratedBox(
                                      decoration: BoxDecoration(color: WColors.primary),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                    ),

                    const SizedBox(height: 32),

                    Divider(color: Colors.white.withOpacity(0.05)),

                    const SizedBox(height: 20),

                    // Compliance badges
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: ['SOC 2', 'GDPR', 'ISO 27001'].map((b) => Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Row(
                          children: [
                            Container(
                              width: 5,
                              height: 5,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: WColors.primary.withOpacity(0.3),
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              b,
                              style: TextStyle(
                                fontSize: 9,
                                fontFamily: 'monospace',
                                letterSpacing: 2,
                                color: WColors.mutedFg.withOpacity(0.4),
                              ),
                            ),
                          ],
                        ),
                      )).toList(),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 40),

          Center(
            child: TextButton(
              onPressed: () => Navigator.pushNamed(context, '/register'),
              child: RichText(
                text: TextSpan(
                  style: const TextStyle(fontSize: 13, color: WColors.mutedFg),
                  children: [
                    const TextSpan(text: 'New agent? '),
                    TextSpan(
                      text: 'Request Clearance (Register)',
                      style: TextStyle(color: WColors.primary, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputField({
    required String label,
    required TextEditingController controller,
    required IconData icon,
    required String hint,
    required String fieldKey,
    bool obscure = false,
    Widget? suffix,
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
              // Left colored bar (web: w-1 bg-primary/20 on left)
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
                  obscureText: obscure,
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
                    suffixIcon: suffix,
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
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
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
            TextButton(
              onPressed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Contact your administrator for access recovery.')),
                );
              },
              style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: Size.zero),
              child: Text(
                'Lost Access?',
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1,
                  color: WColors.primary.withOpacity(0.5),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: _focused == 'password'
                  ? WColors.primary.withOpacity(0.5)
                  : Colors.white.withOpacity(0.05),
              width: _focused == 'password' ? 2 : 1,
            ),
            color: Colors.white.withOpacity(0.03),
          ),
          child: Row(
            children: [
              Container(
                width: 4,
                height: 56,
                decoration: BoxDecoration(
                  color: _focused == 'password'
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

// ── Tech bracket widgets ──────────────────────────────────────────────────────
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
