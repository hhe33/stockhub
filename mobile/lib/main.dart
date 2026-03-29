import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'login_screen.dart';
import 'dashboard_screen.dart';
import 'stores_screen.dart';
import 'modules_screen.dart';
import 'create_sale_screen.dart';
import 'create_transfer_screen.dart';
import 'widgets/tech_widgets.dart';
import 'settings_screen.dart';
import 'register_screen.dart';
import 'inventory_screen.dart';

// ─── GLOBAL THEME NOTIFIER ────────────────────────────────────────────────────
/// Allows any widget in the tree to toggle dark/light mode via:
///   themeNotifier.value = ThemeMode.light;
final ValueNotifier<ThemeMode> themeNotifier = ValueNotifier(ThemeMode.light);

void main() {
  initThemeNotifier(themeNotifier); // wire global notifier
  runApp(const StockHubApp());
}

class StockHubApp extends StatelessWidget {
  const StockHubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: themeNotifier,
      builder: (ctx, mode, _) {
        final interDark = GoogleFonts.interTextTheme(ThemeData.dark().textTheme)
            .apply(bodyColor: WColors.foreground, displayColor: WColors.foreground);
        final interLight = GoogleFonts.interTextTheme(ThemeData.light().textTheme)
            .apply(bodyColor: const Color(0xFF1A1A2E), displayColor: const Color(0xFF1A1A2E));

        return MaterialApp(
          title: 'StockHub',
          debugShowCheckedModeBanner: false,
          themeMode: mode,

          // ── DARK theme ──────────────────────────────────────────────────
          darkTheme: ThemeData(
            brightness: Brightness.dark,
            useMaterial3: true,
            scaffoldBackgroundColor: WColors.background,
            colorScheme: ColorScheme.dark(
              primary: WColors.primary,
              onPrimary: WColors.primaryFg,
              secondary: WColors.secondary,
              surface: WColors.card,
              onSurface: WColors.foreground,
              error: WColors.danger,
              outline: WColors.border,
            ),
            textTheme: interDark,
            elevatedButtonTheme: ElevatedButtonThemeData(
              style: ElevatedButton.styleFrom(
                backgroundColor: WColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
            inputDecorationTheme: InputDecorationTheme(
              filled: true,
              fillColor: Colors.white.withOpacity(0.03),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: WColors.border)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.white.withOpacity(0.06))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: WColors.primary.withOpacity(0.5), width: 2)),
              hintStyle: TextStyle(color: WColors.mutedFg.withOpacity(0.4)),
            ),
            dialogTheme: DialogThemeData(
              backgroundColor: WColors.card,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            ),
            popupMenuTheme: PopupMenuThemeData(
              color: WColors.card,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            dividerTheme: DividerThemeData(color: Colors.white.withOpacity(0.06)),
          ),

          // ── LIGHT theme ──────────────────────────────────────────────────
          theme: ThemeData(
            brightness: Brightness.light,
            useMaterial3: true,
            scaffoldBackgroundColor: const Color(0xFFF8F8FC),
            colorScheme: ColorScheme.light(
              primary: WColors.primary,
              onPrimary: Colors.white,
              secondary: WColors.secondary,
              surface: Colors.white,
              onSurface: const Color(0xFF18181B),
              error: WColors.danger,
              outline: const Color(0xFFE4E4F0),
            ),
            textTheme: interLight,
            elevatedButtonTheme: ElevatedButtonThemeData(
              style: ElevatedButton.styleFrom(
                backgroundColor: WColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
            inputDecorationTheme: InputDecorationTheme(
              filled: true,
              fillColor: const Color(0xFFF4F4F8),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE4E4F0))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFFE4E4F0))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: WColors.primary.withOpacity(0.5), width: 2)),
              hintStyle: const TextStyle(color: Color(0xFFA0A0B8)),
            ),
            dialogTheme: DialogThemeData(
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            ),
            popupMenuTheme: PopupMenuThemeData(
              color: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            dividerTheme: const DividerThemeData(color: Color(0xFFE4E4F0)),
          ),

          initialRoute: '/login',
          routes: {
            '/login': (_) => const LoginScreen(),
            '/register': (_) => const RegisterScreen(),
            '/dashboard': (_) => const DashboardScreen(),
            '/stores': (_) => const StoresScreen(),
            '/products': (_) => const ProductListScreen(),
            '/categories': (_) => const CategoriesScreen(),
            '/sales': (_) => const SalesListScreen(),
            '/sales/create': (_) => const CreateSaleScreen(),
            '/transfers': (_) => const TransferListScreen(),
            '/transfers/create': (_) => const CreateTransferScreen(),
            '/reports': (_) => const ReportsScreen(),
            '/settings': (_) => const SettingsScreen(),
            '/inventory': (_) => const InventoryScreen(),
          },
        );
      },
    );
  }
}
