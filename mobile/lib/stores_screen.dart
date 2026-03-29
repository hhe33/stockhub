import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'api_service.dart';
import 'widgets/tech_widgets.dart';

class StoresScreen extends StatefulWidget {
  const StoresScreen({super.key});

  @override
  State<StoresScreen> createState() => _StoresScreenState();
}

class _StoresScreenState extends State<StoresScreen> {
  final ApiService _api = ApiService();
  List<dynamic> _stores = [];
  bool _isLoading = true;
  String _search = '';
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    final stores = await _api.getStores();
    setState(() {
      _stores = stores ?? [];
      _isLoading = false;
    });
  }

  List<dynamic> get _filtered => _stores.where((s) {
    final q = _search.toLowerCase();
    return (s['name'] ?? '').toLowerCase().contains(q) ||
        (s['city'] ?? '').toLowerCase().contains(q);
  }).toList();

  int get _activeCount => _stores.where((s) => s['status'] == 'active').length;
  int get _inactiveCount => _stores.where((s) => s['status'] != 'active').length;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: WebBackground(
        child: Column(
          children: [
            _buildTopBar(),
            Expanded(
              child: _isLoading
                  ? Center(child: CircularProgressIndicator(color: WColors.primary, strokeWidth: 2))
                  : _buildContent(),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showStoreDialog(),
        backgroundColor: WColors.primary,
        child: const Icon(LucideIcons.plus, color: Colors.white),
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
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'STORES',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 3,
                    color: WColors.primary.withOpacity(0.8),
                  ),
                ),
                const Text(
                  'Manage your store locations',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: WColors.foreground,
                  ),
                ),
              ],
            ),
            const Spacer(),
            IconButton(
              icon: const Icon(LucideIcons.refreshCw, size: 18, color: WColors.mutedFg),
              onPressed: _load,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent() {
    return CustomScrollView(
      slivers: [
        // ── HEADER STATS ──────────────────────────────────────────────────
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
          sliver: SliverToBoxAdapter(
            child: Row(
              children: [
                Expanded(child: _buildStatCard('Total Stores', '${_stores.length}', LucideIcons.store, WColors.primary)),
                const SizedBox(width: 12),
                Expanded(child: _buildStatCard('Active', '$_activeCount', LucideIcons.checkCircle, WColors.success)),
                const SizedBox(width: 12),
                Expanded(child: _buildStatCard('Inactive', '$_inactiveCount', LucideIcons.package, WColors.warning)),
              ],
            ),
          ),
        ),

        // ── SEARCH BAR ────────────────────────────────────────────────────
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
          sliver: SliverToBoxAdapter(
            child: GlassCard(
              borderRadius: 16,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              child: Row(
                children: [
                  const Icon(LucideIcons.search, size: 16, color: WColors.mutedFg),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextField(
                      controller: _searchCtrl,
                      onChanged: (v) => setState(() => _search = v),
                      style: const TextStyle(fontSize: 14, color: WColors.foreground),
                      decoration: InputDecoration(
                        hintText: 'Search stores by name or city...',
                        hintStyle: TextStyle(color: WColors.mutedFg.withOpacity(0.4), fontSize: 13),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),

        // ── STORE CARDS ───────────────────────────────────────────────────
        SliverPadding(
          padding: const EdgeInsets.all(16),
          sliver: _filtered.isEmpty
              ? SliverToBoxAdapter(
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(48),
                      child: Column(
                        children: [
                          Container(
                            width: 64,
                            height: 64,
                            decoration: BoxDecoration(
                              color: WColors.muted.withOpacity(0.5),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(LucideIcons.store, size: 32, color: WColors.mutedFg),
                          ),
                          const SizedBox(height: 16),
                          const Text('No stores found', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: WColors.foreground)),
                          const SizedBox(height: 6),
                          Text('Add a new store to get started.', style: TextStyle(color: WColors.mutedFg.withOpacity(0.6), fontSize: 13)),
                        ],
                      ),
                    ),
                  ),
                )
              : SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final store = _filtered[index];
                      final isActive = store['status']?.toString() == 'active';
                      final accentColor = isActive ? WColors.success : WColors.warning;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _buildStoreCard(store, isActive, accentColor),
                      );
                    },
                    childCount: _filtered.length,
                  ),
                ),
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return GlassCard(
      borderRadius: 16,
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 10, color: WColors.mutedFg),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: color, size: 14),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: WColors.foreground,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStoreCard(Map<String, dynamic> store, bool isActive, Color accentColor) {
    final id = store['_id'] ?? store['id'];

    return GlassCard(
      borderRadius: 20,
      padding: EdgeInsets.zero,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Column(
          children: [
            // Top accent line (web: scale-x-0 group-hover:scale-x-100 – always show on mobile)
            Container(
              height: 3,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isActive
                      ? [WColors.primary, WColors.secondary]
                      : [WColors.warning, const Color(0xFFF43F5E)],
                ),
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header row: icon + name + badge + menu
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: accentColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Icon(LucideIcons.store, color: accentColor, size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              store['name'] ?? 'Unnamed Store',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: WColors.foreground,
                              ),
                            ),
                            const SizedBox(height: 6),
                            _buildBadge(
                              isActive ? '● Operational' : '○ Offline',
                              isActive ? WColors.success : WColors.warning,
                            ),
                          ],
                        ),
                      ),
                      PopupMenuButton(
                        icon: Icon(LucideIcons.moreHorizontal, color: WColors.mutedFg.withOpacity(0.5), size: 20),
                        color: WColors.card,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        onSelected: (value) {
                          if (value == 'edit') {
                            _showStoreDialog(store: store);
                          } else if (value == 'delete') {
                            _confirmDelete(id, store['name'] ?? '');
                          }
                        },
                        itemBuilder: (_) => [
                          PopupMenuItem(
                            value: 'edit',
                            child: Row(children: [
                              const Icon(LucideIcons.pencil, size: 14, color: WColors.mutedFg),
                              const SizedBox(width: 10),
                              Text('Edit', style: TextStyle(color: WColors.foreground, fontSize: 13)),
                            ]),
                          ),
                          PopupMenuItem(
                            value: 'delete',
                            child: Row(children: [
                              const Icon(LucideIcons.trash2, size: 14, color: WColors.danger),
                              const SizedBox(width: 10),
                              const Text('Delete', style: TextStyle(color: WColors.danger, fontSize: 13)),
                            ]),
                          ),
                        ],
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Location & phone info
                  if (store['city'] != null || store['address'] != null)
                    _buildInfoRow(LucideIcons.mapPin, '${store['city'] ?? ''} — ${store['address'] ?? ''}'),
                  if (store['phone'] != null && store['phone'].isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 8),
                      child: _buildInfoRow(LucideIcons.phone, store['phone']),
                    ),

                  const SizedBox(height: 16),

                  // Divider
                  Divider(color: Colors.white.withOpacity(0.06)),

                  // Enter Command Center button
                  TextButton(
                    onPressed: () => _showDetailsDialog(store),
                    style: TextButton.styleFrom(
                      foregroundColor: WColors.mutedFg,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      minimumSize: const Size(double.infinity, 40),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Enter Command Center',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                        SizedBox(width: 6),
                        Icon(LucideIcons.arrowUpRight, size: 14),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Text(
        label.toUpperCase(),
        style: TextStyle(
          fontSize: 9,
          fontWeight: FontWeight.w900,
          letterSpacing: 1.5,
          color: color,
          fontFamily: 'monospace',
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 14, color: WColors.mutedFg),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(fontSize: 13, color: WColors.mutedFg),
          ),
        ),
      ],
    );
  }

  // ── DETAILS DIALOG ────────────────────────────────────────────────────────
  void _showDetailsDialog(Map<String, dynamic> store) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: WColors.card,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [WColors.primary, Color(0xFF3B82F6)],
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(LucideIcons.store, color: Colors.white, size: 24),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          store['name'] ?? '',
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: WColors.foreground,
                            letterSpacing: -0.5,
                          ),
                        ),
                        _buildBadge(
                          store['status'] == 'active' ? 'Store Active' : 'Store Inactive',
                          store['status'] == 'active' ? WColors.success : WColors.warning,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              _buildDetailBlock('PHYSICAL ADDRESS', '${store['address'] ?? '-'}, ${store['city'] ?? '-'}'),
              const SizedBox(height: 12),
              _buildDetailBlock('CONTACT PHONE', store['phone'] ?? '-', isPhone: true),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(ctx),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: WColors.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  child: const Text(
                    'CLOSE DETAILS',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2,
                      fontSize: 11,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailBlock(String label, String value, {bool isPhone = false}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w900,
              letterSpacing: 2,
              color: WColors.mutedFg.withOpacity(0.5),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: isPhone ? WColors.primary : WColors.foreground,
              fontFamily: isPhone ? 'monospace' : null,
            ),
          ),
        ],
      ),
    );
  }

  // ── ADD/EDIT DIALOG ───────────────────────────────────────────────────────
  void _showStoreDialog({Map<String, dynamic>? store}) {
    final isEditing = store != null;
    final nameCtrl = TextEditingController(text: store?['name'] ?? '');
    final cityCtrl = TextEditingController(text: store?['city'] ?? '');
    final addressCtrl = TextEditingController(text: store?['address'] ?? '');
    final phoneCtrl = TextEditingController(text: store?['phone'] ?? '');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: BoxDecoration(
          color: WColors.card,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom,
          left: 24,
          right: 24,
          top: 32,
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    isEditing ? 'EDIT STORE' : 'ADD NEW STORE',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1,
                      color: WColors.foreground,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(LucideIcons.x, color: WColors.mutedFg),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              Text(
                isEditing
                    ? 'Update the store information.'
                    : 'Create a new store location for your inventory system.',
                style: TextStyle(fontSize: 12, color: WColors.mutedFg.withOpacity(0.7)),
              ),
              const SizedBox(height: 28),
              _buildSheetField('STORE NAME', nameCtrl, hint: 'Enter store name'),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(child: _buildSheetField('SECTOR / CITY', cityCtrl, hint: 'Enter city')),
                  const SizedBox(width: 12),
                  Expanded(child: _buildSheetField('COMM. LINE', phoneCtrl, hint: 'Phone number')),
                ],
              ),
              const SizedBox(height: 16),
              _buildSheetField('GEOGRAPHIC COORDINATES', addressCtrl, hint: 'Enter full address'),
              const SizedBox(height: 28),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(ctx),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: Colors.white.withOpacity(0.08)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        foregroundColor: WColors.mutedFg,
                      ),
                      child: const Text('CANCEL', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 2, fontSize: 10)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: () async {
                        final data = {
                          'name': nameCtrl.text,
                          'city': cityCtrl.text,
                          'address': addressCtrl.text,
                          'phone': phoneCtrl.text,
                        };
                        bool ok;
                        if (isEditing) {
                          final id = store!['_id'] ?? store['id'];
                          ok = await _api.updateStore(id, data);
                        } else {
                          ok = await _api.createStore(data);
                        }
                        if (ok && ctx.mounted) {
                          Navigator.pop(ctx);
                          _load();
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: WColors.primary,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        elevation: 0,
                      ),
                      child: Text(
                        isEditing ? 'UPDATE STORE' : 'ADD STORE',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 2,
                          fontSize: 10,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSheetField(String label, TextEditingController ctrl, {String hint = ''}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 4,
              height: 4,
              margin: const EdgeInsets.only(right: 8),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: WColors.primary.withOpacity(0.6),
              ),
            ),
            Text(
              label,
              style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.w900,
                letterSpacing: 2,
                color: WColors.primary.withOpacity(0.6),
                fontFamily: 'monospace',
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        TextField(
          controller: ctrl,
          style: const TextStyle(fontSize: 14, color: WColors.foreground, fontWeight: FontWeight.bold),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: WColors.mutedFg.withOpacity(0.3), fontWeight: FontWeight.normal),
            filled: true,
            fillColor: Colors.white.withOpacity(0.03),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: Colors.white.withOpacity(0.06)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: Colors.white.withOpacity(0.06)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: WColors.primary.withOpacity(0.4)),
            ),
            contentPadding: const EdgeInsets.all(16),
          ),
        ),
      ],
    );
  }

  // ── DELETE CONFIRM ────────────────────────────────────────────────────────
  Future<void> _confirmDelete(dynamic id, String name) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: WColors.card,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Delete Store',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: WColors.foreground),
              ),
              const SizedBox(height: 10),
              Text(
                'Are you sure you want to delete "$name"? This action cannot be undone.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: WColors.mutedFg.withOpacity(0.7)),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(ctx, false),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: Colors.white.withOpacity(0.1)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        foregroundColor: WColors.mutedFg,
                      ),
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(ctx, true),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: WColors.danger,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Delete', style: TextStyle(color: Colors.white)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );

    if (confirmed == true) {
      final ok = await _api.deleteStore(id);
      if (ok) _load();
    }
  }
}
