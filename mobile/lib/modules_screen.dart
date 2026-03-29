import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:lucide_icons/lucide_icons.dart';
import 'api_service.dart';
import 'widgets/tech_widgets.dart';

/// Generic reusable list page base (replicated from web's module structure)
class ProductListScreen extends StatefulWidget {
  const ProductListScreen({super.key});

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  final _api = ApiService();
  List<dynamic>? _products;
  List<dynamic> _categories = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() => _isLoading = true);
    final results = await Future.wait([
      _api.getProducts(),
      _api.getCategories(),
    ]);
    setState(() {
      _products = results[0];
      _categories = results[1] ?? [];
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: WebBackground(
        child: Column(
          children: [
            _buildTopBar(),
            Expanded(
              child: _isLoading
                  ? Center(child: CircularProgressIndicator(color: WColors.info, strokeWidth: 2))
                  : _products == null || _products!.isEmpty
                      ? _buildEmpty()
                      : _buildList(),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showDialog(),
        backgroundColor: WColors.info,
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
                Text('MODULE: INVENTORY',
                    style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 3, color: WColors.info.withOpacity(0.8))),
                const Text('Asset Registry',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: WColors.foreground)),
              ],
            ),
            const Spacer(),
            IconButton(icon: const Icon(LucideIcons.refreshCw, size: 18, color: WColors.mutedFg), onPressed: _fetch),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 64, height: 64,
            decoration: BoxDecoration(color: WColors.muted.withOpacity(0.5), shape: BoxShape.circle),
            child: const Icon(LucideIcons.package, size: 32, color: WColors.mutedFg),
          ),
          const SizedBox(height: 16),
          const Text('No assets detected', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: WColors.foreground)),
          const SizedBox(height: 6),
          Text('Add a new asset to get started.', style: TextStyle(color: WColors.mutedFg.withOpacity(0.6), fontSize: 13)),
        ],
      ),
    );
  }

  Widget _buildList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: _products!.length,
      itemBuilder: (ctx, i) {
        final p = _products![i];
        final inStock = (p['stock'] ?? 0) > 0;
        final id = p['_id'] ?? p['id'];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: GlassCard(
            borderRadius: 20,
            padding: const EdgeInsets.all(20),
            child: InkWell(
              onTap: () => _showDialog(product: p),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: WColors.info.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(LucideIcons.package, color: WColors.info, size: 20),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(p['name'] ?? 'Unnamed Asset',
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: WColors.foreground)),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            _badge('SKU: ${p['sku'] ?? 'N/A'}', WColors.mutedFg),
                            const SizedBox(width: 8),
                            _badge(inStock ? 'IN STOCK' : 'DEPLETED', inStock ? WColors.success : WColors.danger),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('\$${p['price'] ?? '0'}',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: WColors.foreground)),
                      Text('${p['stock'] ?? 0} units',
                          style: TextStyle(fontSize: 10, color: WColors.mutedFg.withOpacity(0.5))),
                    ],
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(LucideIcons.trash2, color: WColors.danger, size: 16),
                    onPressed: () => _delete(id),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _badge(String text, Color color) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
    decoration: BoxDecoration(
      color: color.withOpacity(0.1),
      borderRadius: BorderRadius.circular(100),
      border: Border.all(color: color.withOpacity(0.2)),
    ),
    child: Text(text.toUpperCase(),
        style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 1, color: color)),
  );

  void _showDialog({Map<String, dynamic>? product}) {
    String? selectedCategory = product?['category'];
    final nameCtrl = TextEditingController(text: product?['name'] ?? '');
    final skuCtrl = TextEditingController(text: product?['sku'] ?? '');
    final priceCtrl = TextEditingController(text: product?['price']?.toString() ?? '');
    final stockCtrl = TextEditingController(text: product?['stock']?.toString() ?? '');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => _Sheet(
          title: product != null ? 'RECONFIGURE ASSET' : 'INITIALIZE ASSET',
          accentColor: WColors.info,
          children: [
            _field('ASSET NAME', nameCtrl),
            const SizedBox(height: 14),
            _field('ASSET SKU', skuCtrl),
            const SizedBox(height: 14),
            // Category Selection
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Container(width: 4, height: 4, margin: const EdgeInsets.only(right: 8),
                      decoration: BoxDecoration(shape: BoxShape.circle, color: WColors.info.withOpacity(0.6))),
                  Text('CLASSIFICATION', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 2,
                      color: WColors.info.withOpacity(0.6), fontFamily: 'monospace')),
                ]),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.03),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.white.withOpacity(0.06)),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: selectedCategory,
                      isExpanded: true,
                      dropdownColor: WColors.card,
                      hint: Text('Select Category', style: TextStyle(color: WColors.mutedFg.withOpacity(0.3), fontSize: 14)),
                      style: const TextStyle(fontSize: 14, color: WColors.foreground, fontWeight: FontWeight.bold),
                      items: _categories.map<DropdownMenuItem<String>>((cat) {
                        return DropdownMenuItem<String>(
                          value: cat['name'],
                          child: Text(cat['name']),
                        );
                      }).toList(),
                      onChanged: (val) {
                        setModalState(() => selectedCategory = val);
                      },
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Row(children: [
              Expanded(child: _field('PRICE (CR)', priceCtrl)),
              const SizedBox(width: 12),
              Expanded(child: _field('STOCK UNIT', stockCtrl)),
            ]),
          ],
          onSubmit: () async {
            final data = {
              'name': nameCtrl.text, 
              'sku': skuCtrl.text,
              'category': selectedCategory,
              'price': double.tryParse(priceCtrl.text) ?? 0,
              'stock': int.tryParse(stockCtrl.text) ?? 0,
            };
            bool ok = product != null
                ? await _api.updateProduct(product!['_id'] ?? product['id'], data)
                : await _api.createProduct(data);
            if (ok && ctx.mounted) { Navigator.pop(ctx); _fetch(); }
          },
          submitLabel: product != null ? 'UPDATE PROTOCOL' : 'CONFIRM INIT',
        ),
      ),
    );
  }

  Widget _field(String label, TextEditingController ctrl) => _FieldWidget(label: label, controller: ctrl);

  Future<void> _delete(dynamic id) async {
    final ok = await _api.deleteProduct(id);
    if (ok) _fetch();
  }
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
class CategoriesScreen extends StatefulWidget {
  const CategoriesScreen({super.key});
  @override
  State<CategoriesScreen> createState() => _CategoriesScreenState();
}

class _CategoriesScreenState extends State<CategoriesScreen> {
  final _api = ApiService();
  List<dynamic> _cats = [];
  bool _isLoading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    final data = await _api.getCategories();
    setState(() { _cats = data ?? []; _isLoading = false; });
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    body: WebBackground(
      child: Column(
        children: [
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Row(
                children: [
                  IconButton(icon: const Icon(LucideIcons.arrowLeft, color: WColors.mutedFg, size: 20), onPressed: () => Navigator.pop(context)),
                  const SizedBox(width: 8),
                  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('MODULE: CATEGORIES', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 3, color: WColors.secondary.withOpacity(0.8))),
                    const Text('Classification', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: WColors.foreground)),
                  ]),
                  const Spacer(),
                  IconButton(icon: const Icon(LucideIcons.refreshCw, size: 18, color: WColors.mutedFg), onPressed: _load),
                ],
              ),
            ),
          ),
          Expanded(
            child: _isLoading
                ? Center(child: CircularProgressIndicator(color: WColors.secondary, strokeWidth: 2))
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    itemCount: _cats.length,
                    itemBuilder: (ctx, i) {
                      final cat = _cats[i];
                      final id = cat['_id'] ?? cat['id'];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: GlassCard(
                          borderRadius: 20,
                          padding: const EdgeInsets.all(20),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(color: WColors.secondary.withOpacity(0.1), borderRadius: BorderRadius.circular(14)),
                                child: const Icon(LucideIcons.tag, color: WColors.secondary, size: 20),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                  Text(cat['name'] ?? 'Unnamed', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: WColors.foreground)),
                                  const SizedBox(height: 4),
                                  Text('${cat['count'] ?? 0} assets', style: TextStyle(fontSize: 11, color: WColors.mutedFg.withOpacity(0.6))),
                                ]),
                              ),
                              IconButton(icon: const Icon(LucideIcons.pencil, color: WColors.mutedFg, size: 16), onPressed: () => _showDialog(category: cat)),
                              IconButton(icon: const Icon(LucideIcons.trash2, color: WColors.danger, size: 16), onPressed: () => _delete(id)),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    ),
    floatingActionButton: FloatingActionButton(
      onPressed: () => _showDialog(),
      backgroundColor: WColors.secondary,
      child: const Icon(LucideIcons.plus, color: Colors.white),
    ),
  );

  void _showDialog({Map<String, dynamic>? category}) {
    final isEditing = category != null;
    final nameCtrl = TextEditingController(text: category?['name'] ?? '');
    showModalBottomSheet(
      context: context, isScrollControlled: true, backgroundColor: Colors.transparent,
      builder: (ctx) => _Sheet(
        title: isEditing ? 'UPDATE CATEGORY' : 'NEW CATEGORY',
        accentColor: WColors.secondary,
        children: [_FieldWidget(label: 'CATEGORY NAME', controller: nameCtrl)],
        onSubmit: () async {
          final data = {'name': nameCtrl.text};
          bool ok = isEditing
              ? await _api.updateCategory(category!['_id'] ?? category['id'], data)
              : await _api.createCategory(data);
          if (ok && ctx.mounted) { Navigator.pop(ctx); _load(); }
        },
        submitLabel: isEditing ? 'COMMIT CHANGES' : 'INITIALIZE',
      ),
    );
  }

  Future<void> _delete(dynamic id) async {
    final ok = await _api.deleteCategory(id);
    if (ok) _load();
  }
}

// ─── SALES ────────────────────────────────────────────────────────────────────
class SalesListScreen extends StatefulWidget {
  const SalesListScreen({super.key});
  @override
  State<SalesListScreen> createState() => _SalesListScreenState();
}

class _SalesListScreenState extends State<SalesListScreen> {
  final _api = ApiService();
  List<dynamic>? _sales;
  bool _isLoading = true;

  @override
  void initState() { super.initState(); _fetch(); }

  Future<void> _fetch() async {
    setState(() => _isLoading = true);
    final data = await _api.getSales();
    setState(() { _sales = data; _isLoading = false; });
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    body: WebBackground(
      child: Column(
        children: [
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Row(children: [
                IconButton(icon: const Icon(LucideIcons.arrowLeft, color: WColors.mutedFg, size: 20), onPressed: () => Navigator.pop(context)),
                const SizedBox(width: 8),
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('MODULE: SALES', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 3, color: WColors.success.withOpacity(0.8))),
                  const Text('Registry Flux', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: WColors.foreground)),
                ]),
                const Spacer(),
                IconButton(icon: const Icon(LucideIcons.refreshCw, size: 18, color: WColors.mutedFg), onPressed: _fetch),
              ]),
            ),
          ),
          Expanded(
            child: _isLoading
                ? Center(child: CircularProgressIndicator(color: WColors.success, strokeWidth: 2))
                : _sales == null || _sales!.isEmpty
                    ? Center(child: Text('No transactions detected', style: TextStyle(color: WColors.mutedFg.withOpacity(0.5))))
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        itemCount: _sales!.length,
                        itemBuilder: (ctx, i) {
                          final sale = _sales![i];
                          final id = (sale['_id'] ?? sale['id'] ?? '------').toString();
                          final shortId = id.length >= 6 ? id.substring(id.length - 6).toUpperCase() : id.toUpperCase();
                          final date = sale['date'] != null ? DateTime.tryParse(sale['date'])?.toLocal() : null;
                          final dateStr = date != null ? '${date.day}/${date.month}/${date.year}' : '-';
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: GlassCard(
                              borderRadius: 20,
                              padding: const EdgeInsets.all(20),
                              child: Row(children: [
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(color: WColors.success.withOpacity(0.1), borderRadius: BorderRadius.circular(14)),
                                  child: const Icon(LucideIcons.shoppingCart, color: WColors.success, size: 20),
                                ),
                                const SizedBox(width: 16),
                                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                  Text('Transaction #$shortId', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: WColors.foreground)),
                                  const SizedBox(height: 4),
                                  Text('$dateStr  •  ${sale['store']?['name'] ?? 'In-Store'}',
                                      style: TextStyle(fontSize: 11, color: WColors.mutedFg.withOpacity(0.6))),
                                ])),
                                Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                                  Text('\$${sale['total'] ?? '0'}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: WColors.success)),
                                  Text('CONFIRMED', style: TextStyle(fontSize: 8, fontFamily: 'monospace', letterSpacing: 1.5, color: WColors.success.withOpacity(0.4))),
                                ]),
                              ]),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    ),
    floatingActionButton: FloatingActionButton(
      onPressed: () async {
        final refreshed = await Navigator.pushNamed(context, '/sales/create');
        if (refreshed == true) {
          _fetch();
        }
      },
      backgroundColor: WColors.success,
      child: const Icon(LucideIcons.plus, color: Colors.white),
    ),
  );
}

// ─── TRANSFERS ────────────────────────────────────────────────────────────────
class TransferListScreen extends StatefulWidget {
  const TransferListScreen({super.key});
  @override
  State<TransferListScreen> createState() => _TransferListScreenState();
}

class _TransferListScreenState extends State<TransferListScreen> {
  final _api = ApiService();
  List<dynamic>? _transfers;
  bool _isLoading = true;

  @override
  void initState() { super.initState(); _fetch(); }

  Future<void> _fetch() async {
    setState(() => _isLoading = true);
    final data = await _api.getTransfers();
    setState(() { _transfers = data; _isLoading = false; });
  }

  Color _statusColor(String? s) {
    switch (s?.toLowerCase()) {
      case 'completed': return WColors.success;
      case 'cancelled': return WColors.danger;
      default: return WColors.warning;
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    body: WebBackground(
      child: Column(
        children: [
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Row(children: [
                IconButton(icon: const Icon(LucideIcons.arrowLeft, color: WColors.mutedFg, size: 20), onPressed: () => Navigator.pop(context)),
                const SizedBox(width: 8),
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('MODULE: TRANSFERS', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 3, color: WColors.info.withOpacity(0.8))),
                  const Text('Node Migration', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: WColors.foreground)),
                ]),
                const Spacer(),
                IconButton(icon: const Icon(LucideIcons.refreshCw, size: 18, color: WColors.mutedFg), onPressed: _fetch),
              ]),
            ),
          ),
          Expanded(
            child: _isLoading
                ? Center(child: CircularProgressIndicator(color: WColors.info, strokeWidth: 2))
                : _transfers == null || _transfers!.isEmpty
                    ? Center(child: Text('No active transfers', style: TextStyle(color: WColors.mutedFg.withOpacity(0.5))))
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        itemCount: _transfers!.length,
                        itemBuilder: (ctx, i) {
                          final t = _transfers![i];
                          final status = t['status']?.toString() ?? 'pending';
                          final color = _statusColor(status);
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: GlassCard(
                              borderRadius: 20,
                              padding: const EdgeInsets.all(20),
                              child: Row(children: [
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(14)),
                                  child: Icon(LucideIcons.repeat, color: color, size: 20),
                                ),
                                const SizedBox(width: 16),
                                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                  Text(t['product']?['name'] ?? 'Unknown Asset', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: WColors.foreground)),
                                  const SizedBox(height: 4),
                                  Text('${t['fromStore']?['name'] ?? 'Origin'} → ${t['toStore']?['name'] ?? 'Target'}',
                                      style: TextStyle(fontSize: 11, color: WColors.mutedFg.withOpacity(0.6))),
                                ])),
                                Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                                  Text('QTY: ${t['quantity'] ?? 0}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: WColors.foreground)),
                                  Container(
                                    margin: const EdgeInsets.only(top: 4),
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(100), border: Border.all(color: color.withOpacity(0.2))),
                                    child: Text(status.toUpperCase(), style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: color, letterSpacing: 1)),
                                  ),
                                ]),
                              ]),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    ),
    floatingActionButton: FloatingActionButton(
      onPressed: () async {
        final refreshed = await Navigator.pushNamed(context, '/transfers/create');
        if (refreshed == true) {
          _fetch();
        }
      },
      backgroundColor: WColors.info,
      child: const Icon(LucideIcons.plus, color: Colors.white),
    ),
  );
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  final _api = ApiService();
  Map<String, dynamic>? _summary;
  List<dynamic> _stores = [];
  bool _isLoading = true;

  String? _selectedStoreId = 'all';
  DateTime _fromDate = DateTime.now().subtract(const Duration(days: 30));
  DateTime _toDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    _loadInitial();
  }

  Future<void> _loadInitial() async {
    setState(() => _isLoading = true);
    final stores = await _api.getStores();
    setState(() {
      _stores = stores ?? [];
    });
    await _fetch();
  }

  Future<void> _fetch() async {
    setState(() => _isLoading = true);
    final data = await _api.getSummary(
      from: _fromDate.toIso8601String().split('T')[0],
      to: _toDate.toIso8601String().split('T')[0],
      storeId: _selectedStoreId,
    );
    setState(() {
      _summary = data;
      _isLoading = false;
    });
  }

  Future<void> _selectDate(BuildContext context, bool isFrom) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: isFrom ? _fromDate : _toDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2101),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFF06B6D4),
            onPrimary: Colors.white,
            surface: Color(0xFF0F172A),
            onSurface: Colors.white,
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      setState(() {
        if (isFrom) _fromDate = picked; else _toDate = picked;
      });
      _fetch();
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    body: WebBackground(
      child: Column(
        children: [
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Row(children: [
                IconButton(icon: const Icon(LucideIcons.arrowLeft, color: WColors.mutedFg, size: 20), onPressed: () => Navigator.pop(context)),
                const SizedBox(width: 8),
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('SYSTEM REPORTS', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 3, color: const Color(0xFF06B6D4).withOpacity(0.8))),
                  const Text('Registry & Exports', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: WColors.foreground)),
                ]),
                const Spacer(),
                IconButton(icon: const Icon(LucideIcons.refreshCw, size: 18, color: WColors.mutedFg), onPressed: _fetch),
              ]),
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── FILTERS ────────────────────────────────────────────────
                  _sectionLabel('System Filters'),
                  const SizedBox(height: 16),
                  GlassCard(
                    borderRadius: 20,
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Expanded(child: _dateTile('START', _fromDate, () => _selectDate(context, true))),
                            const SizedBox(width: 12),
                            Expanded(child: _dateTile('END', _toDate, () => _selectDate(context, false))),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.03),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: Colors.white.withOpacity(0.06)),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: _selectedStoreId,
                              dropdownColor: const Color(0xFF0F172A),
                              isExpanded: true,
                              items: [
                                const DropdownMenuItem(value: 'all', child: Text('All Stores', style: TextStyle(fontSize: 13, color: Colors.white))),
                                ..._stores.map((s) => DropdownMenuItem(value: s['_id'], child: Text(s['name'] ?? '', style: const TextStyle(fontSize: 13, color: Colors.white)))),
                              ],
                              onChanged: (v) { setState(() => _selectedStoreId = v); _fetch(); },
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  // ── EXPORTS ────────────────────────────────────────────────
                  _sectionLabel('Data Protocols'),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(child: _exportBtn('PDF REPORT', LucideIcons.fileText, WColors.primary, 'stock.pdf')),
                      const SizedBox(width: 12),
                      Expanded(child: _exportBtn('CSV UPLINK', LucideIcons.fileSpreadsheet, const Color(0xFF10B981), 'stock.csv')),
                    ],
                  ),

                  const SizedBox(height: 32),

                  // ── ACTIVITY LOG ───────────────────────────────────────────
                  _sectionLabel('Registry Summary'),
                  const SizedBox(height: 16),
                  if (_isLoading)
                     const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator(color: Color(0xFF06B6D4), strokeWidth: 2)))
                  else if (_summary == null)
                    const Center(child: Text('Protocol Failure (No Data)', style: TextStyle(color: WColors.mutedFg)))
                  else
                    GlassCard(
                      borderRadius: 24,
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        children: [
                          _registryRow('REVENUE GENERATED', '\$${_summary!['revenue'] ?? 0}'),
                          const Divider(height: 24, color: Colors.white10),
                          _registryRow('ITEMS RELOCATED', '${_summary!['unitsSold'] ?? 0}'),
                          const Divider(height: 24, color: Colors.white10),
                          _registryRow('SYSTEM TRANSACTIONS', '${_summary!['transactions'] ?? 0}'),
                          const Divider(height: 24, color: Colors.white10),
                          _registryRow('LOW STOCK ALERTS', '${_summary!['lowStockCount'] ?? 0}'),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    ),
  );

  Widget _dateTile(String label, DateTime date, VoidCallback onTap) => InkWell(
    onTap: onTap,
    borderRadius: BorderRadius.circular(14),
    child: Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: WColors.mutedFg, letterSpacing: 1.5)),
          const SizedBox(height: 4),
          Text('${date.day}/${date.month}/${date.year}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white)),
        ],
      ),
    ),
  );

  Widget _exportBtn(String label, IconData icon, Color color, String type) => InkWell(
    onTap: () async {
      final url = await _api.getExportUrl(type, storeId: _selectedStoreId ?? 'all');
      if (kIsWeb) {
        // We avoid direct dart:js import to allow mobile compilation.
        // The user can use url_launcher if they need this on mobile.
        debugPrint('Web export triggered: $url');
      } else {
        debugPrint('Mobile export triggered (URL): $url');
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Export Protocol: $label'),
          backgroundColor: color.withOpacity(0.8),
        ));
      }
    },
    child: GlassCard(
      borderRadius: 16,
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 8),
          Text(label, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: color, letterSpacing: 1)),
        ],
      ),
    ),
  );

  Widget _registryRow(String label, String value) => Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    children: [
      Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: WColors.mutedFg, letterSpacing: 1)),
      Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
    ],
  );

  Widget _sectionLabel(String label) => Padding(
    padding: const EdgeInsets.only(left: 4, bottom: 16),
    child: Text(label.toUpperCase(),
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: WColors.primary.withOpacity(0.6), letterSpacing: 2)),
  );
}

// ─── SHARED SHEET WIDGET ──────────────────────────────────────────────────────
class _Sheet extends StatelessWidget {
  final String title;
  final Color accentColor;
  final List<Widget> children;
  final Future<void> Function() onSubmit;
  final String submitLabel;

  const _Sheet({
    required this.title,
    required this.accentColor,
    required this.children,
    required this.onSubmit,
    required this.submitLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: WColors.card,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 24, right: 24, top: 32,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Text(title.toUpperCase(),
                  style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900, letterSpacing: 1, color: WColors.foreground)),
              IconButton(icon: const Icon(LucideIcons.x, color: WColors.mutedFg), onPressed: () => Navigator.pop(context)),
            ]),
            const SizedBox(height: 24),
            ...children,
            const SizedBox(height: 28),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: onSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: accentColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 0,
                ),
                child: Text(submitLabel,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, letterSpacing: 2, fontSize: 11)),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

// ─── SHARED FORM FIELD ────────────────────────────────────────────────────────
class _FieldWidget extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final String? hint;

  const _FieldWidget({required this.label, required this.controller, this.hint});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(children: [
          Container(width: 4, height: 4, margin: const EdgeInsets.only(right: 8),
              decoration: BoxDecoration(shape: BoxShape.circle, color: WColors.primary.withOpacity(0.6))),
          Text(label, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 2,
              color: WColors.primary.withOpacity(0.6), fontFamily: 'monospace')),
        ]),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          style: const TextStyle(fontSize: 14, color: WColors.foreground, fontWeight: FontWeight.bold),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: WColors.mutedFg.withOpacity(0.3), fontWeight: FontWeight.normal),
            filled: true,
            fillColor: Colors.white.withOpacity(0.03),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.white.withOpacity(0.06))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.white.withOpacity(0.06))),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: WColors.primary.withOpacity(0.4))),
            contentPadding: const EdgeInsets.all(16),
          ),
        ),
      ],
    );
  }
}
