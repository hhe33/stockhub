import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'api_service.dart';
import 'widgets/tech_widgets.dart';

class InventoryScreen extends StatefulWidget {
  const InventoryScreen({super.key});

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  final _api = ApiService();
  List<dynamic> _stores = [];
  List<dynamic> _products = [];
  List<dynamic> _inventory = [];
  bool _isLoading = true;

  String? _selectedStoreId;
  String _searchQuery = '';
  String _statusFilter = 'all';

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() => _isLoading = true);
    final stores = await _api.getStores() ?? [];
    final products = await _api.getProducts() ?? [];
    final inventory = await _api.getInventory() ?? [];

    setState(() {
      _stores = stores;
      _products = products;
      _inventory = inventory;
      if (_selectedStoreId == null && stores.isNotEmpty) {
        _selectedStoreId = stores.first['_id'] ?? stores.first['id'];
      }
      _isLoading = false;
    });
  }

  List<dynamic> get _filteredInventory {
    if (_selectedStoreId == null) return [];
    return _inventory.where((i) {
      final sId = i['store']?['_id'] ?? i['store']?['id'] ?? i['storeId'];
      if (sId != _selectedStoreId && _selectedStoreId != 'all') return false;

      final pName = (i['product']?['name'] ?? '').toLowerCase();
      if (_searchQuery.isNotEmpty && !pName.contains(_searchQuery.toLowerCase())) return false;

      final qty = i['quantity'] ?? 0;
      final minStock = i['minStock'] ?? 10;
      final inStock = qty > 0;
      final isLow = inStock && qty < minStock;
      
      String status = inStock ? (isLow ? 'low-stock' : 'in-stock') : 'out-of-stock';
      if (_statusFilter != 'all' && status != _statusFilter) return false;

      return true;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: WebBackground(
        child: Column(
          children: [
            _buildTopBar(),
            if (!_isLoading) _buildStoreSelector(),
            if (!_isLoading && _selectedStoreId != null) _buildFilters(),
            Expanded(
              child: _isLoading
                  ? Center(child: CircularProgressIndicator(color: WColors.primary, strokeWidth: 2))
                  : _filteredInventory.isEmpty
                      ? _buildEmpty()
                      : _buildList(),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showRestockDialog(),
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
                Text('MODULE: INVENTORY', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 3, color: WColors.primary.withOpacity(0.8))),
                const Text('Stock per Store', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: WColors.foreground)),
              ],
            ),
            const Spacer(),
            IconButton(icon: const Icon(LucideIcons.refreshCw, size: 18, color: WColors.mutedFg), onPressed: _fetch),
          ],
        ),
      ),
    );
  }

  Widget _buildStoreSelector() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: GlassCard(
        borderRadius: 16,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        child: DropdownButtonHideUnderline(
          child: DropdownButton<String>(
            value: _selectedStoreId,
            isExpanded: true,
            dropdownColor: WColors.card,
            icon: const Icon(LucideIcons.chevronDown, color: WColors.mutedFg),
            onChanged: (val) {
              if (val != null) setState(() => _selectedStoreId = val);
            },
            items: [
              const DropdownMenuItem<String>(
                value: 'all',
                child: Text('🌐 All Stores (Global)', style: TextStyle(color: WColors.primary, fontWeight: FontWeight.bold)),
              ),
              ..._stores.map((s) {
                final id = s['_id'] ?? s['id'];
                return DropdownMenuItem<String>(
                  value: id.toString(),
                  child: Text(s['name'] ?? 'Unknown Store', style: const TextStyle(color: WColors.foreground, fontWeight: FontWeight.bold)),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFilters() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              onChanged: (v) => setState(() => _searchQuery = v),
              style: const TextStyle(fontSize: 12, color: WColors.foreground),
              decoration: InputDecoration(
                hintText: 'Search items...',
                prefixIcon: const Icon(LucideIcons.search, size: 16, color: WColors.mutedFg),
                filled: true,
                fillColor: Colors.white.withOpacity(0.03),
                isDense: true,
                contentPadding: const EdgeInsets.all(8),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withOpacity(0.06))),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.white.withOpacity(0.06))),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: WColors.primary.withOpacity(0.4))),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.03),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withOpacity(0.06)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _statusFilter,
                dropdownColor: WColors.card,
                style: const TextStyle(fontSize: 12, color: WColors.foreground),
                icon: const Icon(LucideIcons.filter, size: 14, color: WColors.mutedFg),
                onChanged: (val) {
                  if (val != null) setState(() => _statusFilter = val);
                },
                items: const [
                  DropdownMenuItem(value: 'all', child: Text('All Status')),
                  DropdownMenuItem(value: 'in-stock', child: Text('In Stock')),
                  DropdownMenuItem(value: 'low-stock', child: Text('Low Stock')),
                  DropdownMenuItem(value: 'out-of-stock', child: Text('Out of Stock')),
                ],
              ),
            ),
          ),
        ],
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
            child: const Icon(LucideIcons.warehouse, size: 32, color: WColors.mutedFg),
          ),
          const SizedBox(height: 16),
          const Text('No products found', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: WColors.foreground)),
          const SizedBox(height: 6),
          Text('Try adjusting your filters or add a product.', style: TextStyle(color: WColors.mutedFg.withOpacity(0.6), fontSize: 13)),
        ],
      ),
    );
  }

  Widget _buildList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: _filteredInventory.length,
      itemBuilder: (ctx, i) {
        final item = _filteredInventory[i];
        final qty = item['quantity'] ?? 0;
        final minStock = item['minStock'] ?? 10;
        final inStock = qty > 0;
        final isLow = inStock && qty < minStock;
        
        Color statusColor = WColors.success;
        String statusText = 'IN STOCK';
        if (!inStock) {
          statusColor = WColors.danger;
          statusText = 'OUT OF STOCK';
        } else if (isLow) {
          statusColor = WColors.warning;
          statusText = 'LOW STOCK';
        }

        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: GlassCard(
            borderRadius: 20,
            padding: const EdgeInsets.all(16),
            child: InkWell(
              onTap: () => _showAdjustDialog(item),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(isLow ? LucideIcons.alertTriangle : LucideIcons.package, color: statusColor, size: 20),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item['product']?['name'] ?? 'Unknown Product',
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: WColors.foreground)),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            if (_selectedStoreId == 'all')
                              Padding(
                                padding: const EdgeInsets.only(right: 6),
                                child: Text('${item['store']?['name']} •', style: const TextStyle(fontSize: 10, color: WColors.primary, fontWeight: FontWeight.bold)),
                              ),
                            _badge(statusText, statusColor),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('$qty', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: statusColor)),
                      Text('Min: $minStock', style: TextStyle(fontSize: 10, color: WColors.mutedFg.withOpacity(0.5))),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _badge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Text(text.toUpperCase(),
          style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, letterSpacing: 1, color: color)),
    );
  }

  void _showAdjustDialog(Map<String, dynamic> item) {
    final qtyCtrl = TextEditingController(text: item['quantity']?.toString() ?? '0');
    final minCtrl = TextEditingController(text: item['minStock']?.toString() ?? '10');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _Sheet(
        title: 'ADJUST STOCK',
        accentColor: WColors.primary,
        onSubmitLabel: 'UPDATE INVENTORY',
        children: [
          Row(
            children: [
              Expanded(child: _field('CURRENT QTY', qtyCtrl)),
              const SizedBox(width: 12),
              Expanded(child: _field('MIN TARGET', minCtrl)),
            ],
          ),
        ],
        onSubmit: () async {
          final data = {
            'quantity': int.tryParse(qtyCtrl.text) ?? 0,
            'minStock': int.tryParse(minCtrl.text) ?? 10,
          };
          final ok = await _api.updateInventory(item['_id'] ?? item['id'], data);
          if (ok && ctx.mounted) {
            Navigator.pop(ctx);
            _fetch();
          }
        },
      ),
    );
  }

  void _showRestockDialog() {
    String? selStore = _selectedStoreId == 'all' ? null : _selectedStoreId;
    String? selProduct;
    final qtyCtrl = TextEditingController(text: '0');
    final minCtrl = TextEditingController(text: '10');
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) {
          
          final targetStore = selStore;
          final availableProducts = _products.where((p) {
            if (targetStore == null) return true;
            final inInv = _inventory.any((i) {
              final sId = i['store']?['_id'] ?? i['store']?['id'] ?? i['storeId'];
              final pId = i['product']?['_id'] ?? i['product']?['id'] ?? i['productId'];
              return sId == targetStore && pId == (p['_id'] ?? p['id']);
            });
            return !inInv;
          }).toList();

          return _Sheet(
            title: 'ADD TO STORE',
            accentColor: WColors.primary,
            onSubmitLabel: 'INIT STOCK',
            children: [
              if (_selectedStoreId == 'all') ...[
                _dropdownField('TARGET STORE', selStore, _stores, (val) {
                  setSheetState(() {
                    selStore = val;
                    selProduct = null;
                  });
                }),
                const SizedBox(height: 16),
              ],
              _dropdownField('SELECT PRODUCT', selProduct, availableProducts, (val) {
                setSheetState(() => selProduct = val);
              }),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(child: _field('INITIAL QTY', qtyCtrl)),
                  const SizedBox(width: 12),
                  Expanded(child: _field('MIN ALERT', minCtrl)),
                ],
              ),
            ],
            onSubmit: () async {
              if (selProduct == null || selStore == null) return;
              final data = {
                'store': selStore,
                'product': selProduct,
                'addQuantity': int.tryParse(qtyCtrl.text) ?? 0,
                'minStock': int.tryParse(minCtrl.text) ?? 10,
              };
              final ok = await _api.restockInventory(data);
              if (ok && ctx.mounted) {
                Navigator.pop(ctx);
                _fetch();
              }
            },
          );
        }
      ),
    );
  }

  Widget _field(String label, TextEditingController ctrl) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 2, color: WColors.primary.withOpacity(0.6))),
        const SizedBox(height: 8),
        TextField(
          controller: ctrl,
          style: const TextStyle(fontSize: 14, color: WColors.foreground, fontWeight: FontWeight.bold),
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white.withOpacity(0.03),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
          keyboardType: TextInputType.number,
        ),
      ],
    );
  }

  Widget _dropdownField(String label, String? value, List<dynamic> items, ValueChanged<String?> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 2, color: WColors.primary.withOpacity(0.6))),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.03),
            borderRadius: BorderRadius.circular(14),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value,
              isExpanded: true,
              dropdownColor: WColors.card,
              hint: Text('Select...', style: TextStyle(color: WColors.mutedFg.withOpacity(0.4))),
              items: items.map((p) {
                return DropdownMenuItem<String>(
                  value: p['_id'] ?? p['id'],
                  child: Text(p['name'] ?? '?', style: const TextStyle(color: WColors.foreground)),
                );
              }).toList(),
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }
}

class _Sheet extends StatelessWidget {
  final String title;
  final Color accentColor;
  final List<Widget> children;
  final Future<void> Function() onSubmit;
  final String onSubmitLabel;

  const _Sheet({
    required this.title,
    required this.accentColor,
    required this.children,
    required this.onSubmit,
    required this.onSubmitLabel,
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
                child: Text(onSubmitLabel,
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
