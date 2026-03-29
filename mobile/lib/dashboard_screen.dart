import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'api_service.dart';
import 'widgets/tech_widgets.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen>
    with SingleTickerProviderStateMixin {
  final _apiService = ApiService();
  Map<String, dynamic>? _stats;
  Map<String, dynamic>? _user;
  List<dynamic> _recentSales = [];
  bool _isLoading = true;
  late AnimationController _pingCtrl;

  // Quick actions (from web)
  static const List<Map<String, dynamic>> _quickActions = [
    {'label': 'Add Product', 'route': '/products', 'icon': LucideIcons.package, 'color': Color(0xFF3B82F6)},
    {'label': 'New Sale', 'route': '/sales', 'icon': LucideIcons.shoppingCart, 'color': Color(0xFF10B981)},
    {'label': 'Transfer', 'route': '/transfers', 'icon': LucideIcons.repeat, 'color': Color(0xFFF59E0B)},
    {'label': 'Reports', 'route': '/reports', 'icon': LucideIcons.barChart2, 'color': Color(0xFF8B5CF6)},
  ];

  @override
  void initState() {
    super.initState();
    _pingCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);
    _loadDashboard();
  }

  Future<void> _loadDashboard() async {
    setState(() => _isLoading = true);
    final data = await _apiService.getDashboard();
    final summary = await _apiService.getSummary();
    // Try to get fresh user data
    var user = await _apiService.getMe();
    user ??= await _apiService.getUser();
    
    setState(() {
      _stats = {
        ...(summary ?? {}),
        ...(data?['stats'] ?? {}),
      };
      _user = user;
      _recentSales = data?['recentSales'] ?? [];
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: _buildDrawer(),
      body: WebBackground(
        child: Stack(
          children: [
            ScanningLine(color: WColors.primary),
            Column(
              children: [
                _buildTopBar(),
                Expanded(
                  child: _isLoading
                      ? Center(
                          child: CircularProgressIndicator(
                            color: WColors.primary,
                            strokeWidth: 2,
                          ),
                        )
                      : _buildContent(),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawer() {
    String initials = 'U';
    if (_user?['name'] != null) {
      final names = (_user!['name'] as String).trim().split(' ');
      if (names.length > 1) {
        initials = (names[0][0] + names[names.length - 1][0]).toUpperCase();
      } else if (names[0].isNotEmpty) {
        initials = names[0][0].toUpperCase();
      }
    }
    
    return Drawer(
      backgroundColor: WColors.sidebar,
      child: Column(
        children: [
          // Header
          DrawerHeader(
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Colors.white10)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: WColors.primary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(LucideIcons.package2, color: Colors.white),
                ),
                const SizedBox(height: 12),
                const Text(
                  'StockHub',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: WColors.foreground),
                ),
                Text(
                  'Multi-Store Ecosystem',
                  style: TextStyle(fontSize: 10, color: WColors.mutedFg.withOpacity(0.5), letterSpacing: 1),
                ),
              ],
            ),
          ),

          // Menu Items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: [
                _drawerItem(LucideIcons.layoutDashboard, 'Dashboard', '/dashboard', isActive: true),
                _drawerItem(LucideIcons.store, 'Stores', '/stores'),
                _drawerItem(LucideIcons.layers, 'Categories', '/categories'),
                _drawerItem(LucideIcons.package, 'Products', '/products'),
                _drawerItem(LucideIcons.warehouse, 'Inventory', '/inventory'),
                _drawerItem(LucideIcons.shoppingCart, 'Sales', '/sales'),
                _drawerItem(LucideIcons.repeat, 'Transfers', '/transfers'),
                _drawerItem(LucideIcons.barChart2, 'Reports', '/reports'),
                _drawerItem(LucideIcons.smartphone, 'POS Terminal', '/sales/create'),
                _drawerItem(LucideIcons.settings, 'Settings', '/settings'),
              ],
            ),
          ),

          // Footer / User Card (requested "en bas a la place du Admin User")
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: InkWell(
              onTap: () {
                Navigator.pop(context); // close drawer
                Navigator.pushNamed(context, '/settings');
              },
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.03),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.05)),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 18,
                      backgroundColor: WColors.primary,
                      child: Text(initials, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _user?['name'] ?? 'User Profile',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: WColors.foreground),
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            _user?['email'] ?? 'profile@stockhub.com',
                            style: TextStyle(fontSize: 10, color: WColors.mutedFg.withOpacity(0.5)),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    const Icon(LucideIcons.chevronRight, size: 14, color: WColors.mutedFg),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _drawerItem(IconData icon, String label, String route, {bool isActive = false}) {
    return ListTile(
      leading: Icon(icon, color: isActive ? WColors.primary : WColors.mutedFg, size: 20),
      title: Text(
        label,
        style: TextStyle(
          color: isActive ? WColors.primary : WColors.foreground,
          fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
          fontSize: 14,
        ),
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      onTap: () {
        Navigator.pop(context);
        if (!isActive) Navigator.pushNamed(context, route);
      },
    );
  }

  Widget _buildTopBar() {
    return SafeArea(
      bottom: false,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Row(
          children: [
            // Menu Toggle (Drawer)
            Builder(
              builder: (context) => IconButton(
                icon: const Icon(LucideIcons.menu, size: 20, color: WColors.mutedFg),
                onPressed: () => Scaffold.of(context).openDrawer(),
              ),
            ),
            const SizedBox(width: 8),
            RichText(
              text: TextSpan(
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                children: [
                  const TextSpan(text: 'Stock', style: TextStyle(color: WColors.foreground)),
                  TextSpan(text: 'Hub', style: TextStyle(color: WColors.primary)),
                ],
              ),
            ),
            const Spacer(),
            const ThemeToggleButton(),
            IconButton(
              icon: const Icon(LucideIcons.refreshCw, size: 18, color: WColors.mutedFg),
              onPressed: _loadDashboard,
            ),
            IconButton(
              icon: const Icon(LucideIcons.logOut, size: 18, color: WColors.mutedFg),
              onPressed: () {
                _apiService.logout();
                Navigator.pushReplacementNamed(context, '/login');
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── COMMAND CENTRAL HERO ─────────────────────────────────────────
          GlassCard(
            borderRadius: 32,
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // System active badge
                Row(
                  children: [
                    AnimatedBuilder(
                      animation: _pingCtrl,
                      builder: (ctx, _) => Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: WColors.primary.withOpacity(0.4 + _pingCtrl.value * 0.6),
                          boxShadow: [
                            BoxShadow(
                              color: WColors.primary.withOpacity(_pingCtrl.value * 0.8),
                              blurRadius: 8,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'SYSTEM: ACTIVE',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 3,
                        color: WColors.primary.withOpacity(0.8),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Title
                RichText(
                  text: const TextSpan(
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      height: 1.1,
                      fontStyle: FontStyle.italic,
                      letterSpacing: -1,
                    ),
                    children: [
                      TextSpan(text: 'Command ', style: TextStyle(color: WColors.foreground)),
                      TextSpan(text: 'Central', style: TextStyle(color: WColors.primary)),
                    ],
                  ),
                ),

                const SizedBox(height: 10),

                Text(
                  'Liaison established with ${_stats?['totalStores'] ?? 0} node stores. Currently tracking ${_stats?['totalProducts'] ?? 0} active assets.',
                  style: const TextStyle(
                    fontSize: 13,
                    color: WColors.mutedFg,
                    height: 1.5,
                  ),
                ),

                const SizedBox(height: 20),

                // Quick actions
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: _quickActions.map((action) {
                    return InkWell(
                      onTap: () => Navigator.pushNamed(context, action['route']),
                      borderRadius: BorderRadius.circular(14),
                      child: GlassCard(
                        borderRadius: 14,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 10,
                        ),
                        borderColor: Colors.white.withOpacity(0.05),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              action['icon'] as IconData,
                              size: 14,
                              color: (action['color'] as Color),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              action['label'] as String,
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1,
                                color: WColors.foreground,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // ── DATA INTEL SECTION LABEL ──────────────────────────────────────
          _buildSectionDivider('Data Intel'),

          const SizedBox(height: 16),

          // ── RECENT UPLINK / SALES ─────────────────────────────────────────
          _buildRecentSalesCard(),

          const SizedBox(height: 16),

          // ── MODULE GRID (navigation) ──────────────────────────────────────
          _buildModuleGrid(),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildSectionDivider(String label) {
    return Row(
      children: [
        Expanded(child: Container(height: 1, color: Colors.white.withOpacity(0.06))),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            label.toUpperCase(),
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w900,
              letterSpacing: 4,
              color: WColors.mutedFg.withOpacity(0.3),
            ),
          ),
        ),
        Expanded(child: Container(height: 1, color: Colors.white.withOpacity(0.06))),
      ],
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color iconColor,
    Color? valueColor,
  }) {
    return GlassCard(
      borderRadius: 20,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 10,
                    color: WColors.mutedFg,
                    fontWeight: FontWeight.w600,
                  ),
                  maxLines: 2,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: iconColor, size: 16),
              ),
            ],
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w900,
              color: valueColor ?? WColors.foreground,
              letterSpacing: -0.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentSalesCard() {
    return GlassCard(
      borderRadius: 24,
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 20, 16, 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Recent Uplink',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        fontStyle: FontStyle.italic,
                        letterSpacing: 0.5,
                        color: WColors.foreground,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'LATEST TRANSACTIONS',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 3,
                        color: WColors.mutedFg.withOpacity(0.4),
                      ),
                    ),
                  ],
                ),
                OutlinedButton(
                  onPressed: () => Navigator.pushNamed(context, '/sales'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    side: BorderSide(color: Colors.white.withOpacity(0.08)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    foregroundColor: WColors.mutedFg,
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Registry', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900)),
                      SizedBox(width: 4),
                      Icon(LucideIcons.arrowUpRight, size: 12),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: Colors.white.withOpacity(0.05)),
          if (_recentSales.isEmpty)
            Padding(
              padding: const EdgeInsets.all(24),
              child: Text('No recent transactions', style: TextStyle(color: WColors.mutedFg.withOpacity(0.5), fontSize: 13)),
            )
          else
            ..._recentSales.asMap().entries.map((e) {
              final i = e.key;
              final sale = e.value;
              final colors = [
                const Color(0xFF3B82F6),
                const Color(0xFF10B981),
                const Color(0xFFF59E0B),
                const Color(0xFF8B5CF6),
              ];
              final color = colors[i % colors.length];
              final name = (sale['productName'] ?? sale['items']?[0]?['product']?['name'] ?? 'Transaction') as String;
              final total = ((sale['total'] ?? 0) as num).toStringAsFixed(2);

              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: Colors.white.withOpacity(0.04)),
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: color.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Center(
                        child: Text(
                          name.isNotEmpty ? name[0].toUpperCase() : 'T',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: color,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            name,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: WColors.foreground,
                            ),
                          ),
                          Text(
                            '${sale['storeName'] ?? sale['store']?['name'] ?? 'In-Store'}',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1,
                              color: WColors.mutedFg.withOpacity(0.5),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '\$$total',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            color: WColors.foreground,
                          ),
                        ),
                        Text(
                          'CONFIRMED',
                          style: TextStyle(
                            fontSize: 8,
                            fontFamily: 'monospace',
                            letterSpacing: 1.5,
                            color: WColors.primary.withOpacity(0.4),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            }),
        ],
      ),
    );
  }

  Widget _buildModuleGrid() {
    final modules = [
      {'label': 'Stores', 'icon': LucideIcons.store, 'color': WColors.primary, 'route': '/stores'},
      {'label': 'Products', 'icon': LucideIcons.package, 'color': WColors.info, 'route': '/products'},
      {'label': 'Inventory', 'icon': LucideIcons.warehouse, 'color': WColors.primary, 'route': '/inventory'},
      {'label': 'Sales', 'icon': LucideIcons.shoppingCart, 'color': WColors.success, 'route': '/sales'},
      {'label': 'Transfers', 'icon': LucideIcons.repeat, 'color': WColors.warning, 'route': '/transfers'},
      {'label': 'Categories', 'icon': LucideIcons.tag, 'color': WColors.secondary, 'route': '/categories'},
      {'label': 'Reports', 'icon': LucideIcons.barChart2, 'color': const Color(0xFF8B5CF6), 'route': '/reports'},
    ];

    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      children: modules.map((mod) {
        final color = mod['color'] as Color;
        return InkWell(
          onTap: () => Navigator.pushNamed(context, mod['route'] as String),
          borderRadius: BorderRadius.circular(20),
          child: GlassCard(
            borderRadius: 20,
            padding: const EdgeInsets.all(12),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(mod['icon'] as IconData, color: color, size: 22),
                ),
                const SizedBox(height: 10),
                Text(
                  mod['label'] as String,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: WColors.foreground,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}
