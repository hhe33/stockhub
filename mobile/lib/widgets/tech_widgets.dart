import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'dart:ui';

// ─── WEB-ACCURATE COLOR SYSTEM ────────────────────────────────────────────────
// Derived from globals.css oklch dark mode values
class WColors {
  // Core: Light themed bases
  static const background = Color(0xFFF8F8FC);
  static const card = Color(0xFFFFFFFF);
  static const sidebar = Color(0xFFFFFFFF);

  // Text: Dark text for light mode
  static const foreground = Color(0xFF18181B);
  static const muted = Color(0xFFE4E4F0);
  static const mutedFg = Color(0xFFA0A0B8);

  // Borders: Subtle light borders
  static const border = Color(0xFFE4E4F0);

  // Accent: Keep vibrant primaries
  static const primary = Color(0xFF7C5CFC);
  static const primaryFg = Color(0xFFFAFAFF);
  static const secondary = Color(0xFF22C5C0);

  // Semantic
  static const success = Color(0xFF10B981);
  static const warning = Color(0xFFF59E0B);
  static const danger = Color(0xFFEF4444);
  static const info = Color(0xFF3B82F6);
}

// ─── ANIMATED BACKGROUND: WEB-ACCURATE ────────────────────────────────────────
class WebBackground extends StatefulWidget {
  final Widget child;
  const WebBackground({super.key, required this.child});

  @override
  State<WebBackground> createState() => _WebBackgroundState();
}

class _WebBackgroundState extends State<WebBackground>
    with TickerProviderStateMixin {
  late AnimationController _blob1;
  late AnimationController _blob2;

  @override
  void initState() {
    super.initState();
    _blob1 = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);
    _blob2 = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat(reverse: true);
    // offset animation
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) _blob2.forward();
    });
  }

  @override
  void dispose() {
    _blob1.dispose();
    _blob2.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Stack(
      children: [
        // Background base
        Container(color: isDark ? Colors.black : WColors.background),

        // Subtle dot grid
        Positioned.fill(
          child: Opacity(
            opacity: isDark ? 0.05 : 0.03,
            child: CustomPaint(
              painter: _DotGridPainter(color: isDark ? Colors.white : Colors.black),
            ),
          ),
        ),

        // Top-left blob (animated mesh gradient touch)
        AnimatedBuilder(
          animation: _blob1,
          builder: (context, _) => Positioned(
            top: -80 - _blob1.value * 20,
            left: -80 - _blob1.value * 10,
            child: _GlowBlob(
              radius: 400,
              color: WColors.primary.withOpacity(isDark ? 0.12 : 0.25 + _blob1.value * 0.05),
            ),
          ),
        ),

        // Bottom-right blob
        AnimatedBuilder(
          animation: _blob2,
          builder: (context, _) => Positioned(
            bottom: -80 - _blob2.value * 20,
            right: -80 - _blob2.value * 10,
            child: _GlowBlob(
              radius: 350,
              color: WColors.secondary.withOpacity(isDark ? 0.10 : 0.20 + _blob2.value * 0.04),
            ),
          ),
        ),

        widget.child,
      ],
    );
  }
}

class _GlowBlob extends StatelessWidget {
  final double radius;
  final Color color;
  const _GlowBlob({required this.radius, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: radius * 2,
      height: radius * 2,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [color, color.withOpacity(0)],
          stops: const [0.0, 1.0],
        ),
      ),
    );
  }
}

class _DotGridPainter extends CustomPainter {
  final Color color;
  _DotGridPainter({this.color = Colors.white});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1;
    const spacing = 20.0;
    for (double x = 0; x < size.width; x += spacing) {
      for (double y = 0; y < size.height; y += spacing) {
        canvas.drawCircle(Offset(x, y), 0.5, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// GlassCard with frosted glass effect
class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final double borderRadius;
  final Color? borderColor;
  final Color? backgroundColor;
  final List<BoxShadow>? boxShadow;

  const GlassCard({
    super.key,
    required this.child,
    this.padding,
    this.borderRadius = 24,
    this.borderColor,
    this.backgroundColor,
    this.boxShadow,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          padding: padding ?? const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: backgroundColor ?? (isDark ? WColors.card.withOpacity(0.6) : Colors.white.withOpacity(0.75)),
            borderRadius: BorderRadius.circular(borderRadius),
            border: Border.all(
              color: borderColor ?? (isDark ? Colors.white.withOpacity(0.08) : Colors.black.withOpacity(0.04)),
              width: 1.5,
            ),
            boxShadow: boxShadow ?? [
              if (!isDark)
                BoxShadow(
                  color: Colors.black.withOpacity(0.03),
                  blurRadius: 20,
                  spreadRadius: -5,
                  offset: const Offset(0, 10),
                )
            ],
          ),
          child: child,
        ),
      ),
    );
  }
}

// ─── SCANNING LASER LINE ──────────────────────────────────────────────────────
class ScanningLine extends StatefulWidget {
  final Color color;
  const ScanningLine({super.key, this.color = const Color(0xFF7C5CFC)});

  @override
  State<ScanningLine> createState() => _ScanningLineState();
}

class _ScanningLineState extends State<ScanningLine>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Positioned(
          top: MediaQuery.of(context).size.height * _controller.value,
          left: 0,
          right: 0,
          child: Opacity(
            opacity: 0.3,
            child: Container(
              height: 2,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    widget.color.withOpacity(0),
                    widget.color,
                    widget.color.withOpacity(0),
                  ],
                ),
                boxShadow: [
                  BoxShadow(
                    color: widget.color.withOpacity(0.5),
                    blurRadius: 8,
                    spreadRadius: 1,
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

// ─── PULSING DOT ─────────────────────────────────────────────────────────────
class PulsingDot extends StatefulWidget {
  final Color color;
  final double size;
  const PulsingDot({super.key, this.color = WColors.success, this.size = 8});

  @override
  State<PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<PulsingDot>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _anim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _anim = Tween<double>(begin: 0.4, end: 1.0).animate(_ctrl);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _anim,
      builder: (ctx, _) => Container(
        width: widget.size,
        height: widget.size,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: widget.color.withOpacity(_anim.value),
          boxShadow: [
            BoxShadow(
              color: widget.color.withOpacity(_anim.value * 0.5),
              blurRadius: 6,
              spreadRadius: 1,
            ),
          ],
        ),
      ),
    );
  }
}

// keep TechBackground as alias for backward compatibility
typedef TechBackground = WebBackground;

// ─── THEME TOGGLE BUTTON (Sun / Moon) ─────────────────────────────────────────
// Package-level ref – assigned by main.dart on startup via initThemeNotifier().
ValueNotifier<ThemeMode> _globalThemeNotifier = ValueNotifier(ThemeMode.dark);

void initThemeNotifier(ValueNotifier<ThemeMode> notifier) {
  _globalThemeNotifier = notifier;
}

/// Animated Sun/Moon toggle — matches web's <ThemeToggle /> exactly.
class ThemeToggleButton extends StatefulWidget {
  const ThemeToggleButton({super.key});

  @override
  State<ThemeToggleButton> createState() => _ThemeToggleButtonState();
}

class _ThemeToggleButtonState extends State<ThemeToggleButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _rotation;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 350),
    );
    _rotation = Tween<double>(begin: 0, end: 3.14159)
        .animate(CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _toggle() {
    _ctrl.forward(from: 0).then((_) => _ctrl.reverse());
    _globalThemeNotifier.value =
        _globalThemeNotifier.value == ThemeMode.dark
            ? ThemeMode.light
            : ThemeMode.dark;
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: _globalThemeNotifier,
      builder: (ctx, mode, _) {
        final isDark = mode == ThemeMode.dark;
        return AnimatedBuilder(
          animation: _rotation,
          builder: (ctx, _) => InkWell(
            onTap: _toggle,
            borderRadius: BorderRadius.circular(100),
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isDark
                    ? Colors.white.withOpacity(0.06)
                    : Colors.black.withOpacity(0.05),
                border: Border.all(
                  color: isDark
                      ? Colors.white.withOpacity(0.12)
                      : Colors.black.withOpacity(0.08),
                ),
              ),
              child: Center(
                child: Transform.rotate(
                  angle: _rotation.value,
                  child: Icon(
                    isDark
                        ? Icons.light_mode_rounded
                        : Icons.dark_mode_rounded,
                    size: 18,
                    color: isDark
                        ? WColors.mutedFg
                        : const Color(0xFF64648A),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
