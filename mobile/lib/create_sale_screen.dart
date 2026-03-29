import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'api_service.dart';
import 'widgets/tech_widgets.dart';

class CreateSaleScreen extends StatefulWidget {
  const CreateSaleScreen({super.key});

  @override
  State<CreateSaleScreen> createState() => _CreateSaleScreenState();
}

class _CreateSaleScreenState extends State<CreateSaleScreen> {
  final _api = ApiService();

  List<dynamic> _stores = [];
  List<dynamic> _inventory = [];

  bool _isLoading = true;
  bool _isSubmitting = false;
  String? _error;

  String? _selectedStoreId;

  // product form
  String? _selectedProductId;
  final _qtyCtrl = TextEditingController(text: '1');
  final _unitPriceCtrl = TextEditingController();

  // cart items
  final List<_CartItem> _cart = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _qtyCtrl.dispose();
    _unitPriceCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    final stores = await _api.getStores();
    final inventory = await _api.getInventory();
    setState(() {
      _stores = stores ?? [];
      _inventory = inventory ?? [];
      _isLoading = false;
    });
  }

  List<dynamic> get _availableInventoryForStore {
    if (_selectedStoreId == null) return [];
    return _inventory
        .where((i) =>
            (i['store']?['_id'] ?? i['store']?['id'] ?? '').toString() ==
                _selectedStoreId &&
            (i['quantity'] ?? 0) > 0)
        .toList();
  }

  double get _total =>
      _cart.fold(0, (sum, item) => sum + item.subtotal);

  void _resetProductForm() {
    setState(() {
      _selectedProductId = null;
      _qtyCtrl.text = '1';
      _unitPriceCtrl.clear();
    });
  }

  void _onStoreChanged(String? storeId) {
    setState(() {
      _selectedStoreId = storeId;
      _cart.clear();
    });
    _resetProductForm();
  }

  void _addProductToCart() {
    setState(() => _error = null);
    if (_selectedProductId == null) {
      setState(() => _error = 'Please select a product.');
      return;
    }

    final invItem = _availableInventoryForStore.firstWhere(
      (i) =>
          (i['product']?['_id'] ?? i['product']?['id'] ?? '').toString() ==
          _selectedProductId,
      orElse: () => null,
    );
    if (invItem == null) return;

    final qty = int.tryParse(_qtyCtrl.text.trim());
    final price = double.tryParse(_unitPriceCtrl.text.trim());

    if (qty == null || qty <= 0) {
      setState(() => _error = 'Quantity must be greater than 0.');
      return;
    }
    if (price == null || price < 0) {
      setState(() => _error = 'Price must be valid.');
      return;
    }

    final productId =
        (invItem['product']?['_id'] ?? invItem['product']?['id']).toString();
    final productName = invItem['product']?['name'] ?? 'Product';
    final availableQty = (invItem['quantity'] ?? 0) as num;

    final currentInCart =
        _cart.where((c) => c.productId == productId).fold<int>(0, (sum, c) => sum + c.quantity);

    if (currentInCart + qty > availableQty) {
      setState(
          () => _error = 'Not enough stock. Only $availableQty units available.');
      return;
    }

    final existingIndex =
        _cart.indexWhere((element) => element.productId == productId);
    if (existingIndex >= 0) {
      final existing = _cart[existingIndex];
      final updated = existing.copyWith(
        quantity: existing.quantity + qty,
      );
      _cart[existingIndex] = updated;
    } else {
      _cart.add(_CartItem(
        productId: productId,
        productName: productName,
        quantity: qty,
        unitPrice: price,
      ));
    }
    _resetProductForm();
    setState(() {});
  }

  void _removeFromCart(String productId) {
    setState(() {
      _cart.removeWhere((c) => c.productId == productId);
    });
  }

  Future<void> _submitSale() async {
    if (_selectedStoreId == null || _cart.isEmpty) return;
    setState(() {
      _isSubmitting = true;
      _error = null;
    });
    try {
      final payload = {
        'store': _selectedStoreId,
        'items': _cart
            .map((c) => {
                  'product': c.productId,
                  'quantity': c.quantity,
                  'unitPrice': c.unitPrice,
                  'subtotal': c.subtotal,
                })
            .toList(),
        'total': _total,
      };
      final ok = await _api.createSale(payload);
      if (!ok) {
        setState(() => _error = 'Failed to create sale. Check stock and data.');
        return;
      }
      if (mounted) {
        Navigator.pop(context, true); // signal success
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: WebBackground(
        child: SafeArea(
          child: Column(
            children: [
              _buildTopBar(),
              Expanded(
                child: _isLoading
                    ? Center(
                        child: CircularProgressIndicator(
                          color: WColors.success,
                          strokeWidth: 2,
                        ),
                      )
                    : _buildContent(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTopBar() {
    return Padding(
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
            children: const [
              Text(
                'MODULE: SALES',
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 3,
                  color: WColors.success,
                ),
              ),
              Text(
                'Create Sale',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: WColors.foreground,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    if (_stores.isEmpty || _inventory.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            'No stores or inventory found.\nConfigure them on the web dashboard first.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: WColors.mutedFg.withOpacity(0.8),
              fontSize: 14,
            ),
          ),
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_error != null) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: WColors.danger.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: WColors.danger.withOpacity(0.2)),
              ),
              child: Text(
                _error!,
                style: const TextStyle(
                  color: WColors.danger,
                  fontSize: 12,
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],
          _buildStoreSelector(),
          const SizedBox(height: 20),
          if (_selectedStoreId != null) ...[
            _buildProductAdder(),
            const SizedBox(height: 24),
            _buildCartTable(),
          ],
          const SizedBox(height: 24),
          _buildFooter(),
        ],
      ),
    );
  }

  Widget _buildStoreSelector() {
    return GlassCard(
      borderRadius: 20,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '1. Select Store',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.2,
              color: WColors.mutedFg.withOpacity(0.9),
            ),
          ),
          const SizedBox(height: 10),
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
                hint: const Text(
                  'Choose where the sale occurred',
                  style: TextStyle(color: WColors.mutedFg, fontSize: 13),
                ),
                icon: const Icon(
                  LucideIcons.chevronDown,
                  size: 18,
                  color: WColors.mutedFg,
                ),
                isExpanded: true,
                dropdownColor: WColors.card,
                items: _stores
                    .map(
                      (s) => DropdownMenuItem<String>(
                        value: (s['_id'] ?? s['id']).toString(),
                        child: Text(
                          s['name'] ?? 'Store',
                          style: const TextStyle(
                            color: WColors.foreground,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    )
                    .toList(),
                onChanged: _onStoreChanged,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductAdder() {
    final inventory = _availableInventoryForStore;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '2. Add Products',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w800,
            letterSpacing: 1.2,
            color: WColors.mutedFg.withOpacity(0.9),
          ),
        ),
        const SizedBox(height: 10),
        GlassCard(
          borderRadius: 20,
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Product (In Stock)',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: WColors.mutedFg.withOpacity(0.9),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.03),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: Colors.white.withOpacity(0.06),
                            ),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: _selectedProductId,
                              hint: const Text(
                                'Select product...',
                                style: TextStyle(
                                  color: WColors.mutedFg,
                                  fontSize: 13,
                                ),
                              ),
                              icon: const Icon(
                                LucideIcons.chevronDown,
                                size: 18,
                                color: WColors.mutedFg,
                              ),
                              isExpanded: true,
                              dropdownColor: WColors.card,
                              items: inventory
                                  .map(
                                    (inv) => DropdownMenuItem<String>(
                                      value: (inv['product']?['_id'] ??
                                              inv['product']?['id'])
                                          .toString(),
                                      child: Text(
                                        '${inv['product']?['name'] ?? 'Product'} (${inv['quantity'] ?? 0} available)',
                                        style: const TextStyle(
                                          color: WColors.foreground,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ),
                                  )
                                  .toList(),
                              onChanged: (v) {
                                setState(() {
                                  _selectedProductId = v;
                                  if (v != null) {
                                    final invItem = inventory.firstWhere(
                                      (i) => (i['product']?['_id'] ?? i['product']?['id'] ?? '').toString() == v,
                                      orElse: () => null,
                                    );
                                    if (invItem != null && invItem['product']?['price'] != null) {
                                      _unitPriceCtrl.text = invItem['product']['price'].toString();
                                    }
                                  } else {
                                    _unitPriceCtrl.clear();
                                  }
                                });
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Quantity',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: WColors.mutedFg.withOpacity(0.9),
                          ),
                        ),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _qtyCtrl,
                          keyboardType: TextInputType.number,
                          style: const TextStyle(
                            color: WColors.foreground,
                            fontSize: 14,
                          ),
                          decoration: _inputDecoration(),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Unit Price (\$)',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: WColors.mutedFg.withOpacity(0.9),
                          ),
                        ),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _unitPriceCtrl,
                          keyboardType:
                              const TextInputType.numberWithOptions(decimal: true),
                          style: const TextStyle(
                            color: WColors.foreground,
                            fontSize: 14,
                          ),
                          decoration: _inputDecoration(),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed:
                      inventory.isEmpty ? null : _addProductToCart,
                  icon: const Icon(LucideIcons.plus, size: 18),
                  label: const Text(
                    'Add to Order',
                    style: TextStyle(
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: WColors.success,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
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

  InputDecoration _inputDecoration() {
    return InputDecoration(
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
        borderSide: BorderSide(color: WColors.primary.withOpacity(0.5)),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
    );
  }

  Widget _buildCartTable() {
    if (_cart.isEmpty) {
      return Text(
        'No products in order yet.',
        style: TextStyle(
          color: WColors.mutedFg.withOpacity(0.8),
          fontSize: 13,
        ),
      );
    }

    return GlassCard(
      borderRadius: 20,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '3. Order Summary',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.2,
              color: WColors.mutedFg.withOpacity(0.9),
            ),
          ),
          const SizedBox(height: 12),
          Column(
            children: _cart.map((item) {
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.02),
                  borderRadius: BorderRadius.circular(14),
                  border:
                      Border.all(color: Colors.white.withOpacity(0.06)),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.productName,
                            style: const TextStyle(
                              color: WColors.foreground,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${item.quantity} × \$${item.unitPrice.toStringAsFixed(2)}',
                            style: TextStyle(
                              color:
                                  WColors.mutedFg.withOpacity(0.9),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '\$${item.subtotal.toStringAsFixed(2)}',
                      style: const TextStyle(
                        color: WColors.success,
                        fontWeight: FontWeight.w900,
                        fontSize: 14,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(
                        LucideIcons.trash2,
                        size: 18,
                        color: WColors.danger,
                      ),
                      onPressed: () => _removeFromCart(item.productId),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 8),
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              'Total: \$${_total.toStringAsFixed(2)}',
              style: const TextStyle(
                color: WColors.foreground,
                fontSize: 16,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFooter() {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(
            onPressed: () => Navigator.pop(context),
            style: OutlinedButton.styleFrom(
              side: BorderSide(color: Colors.white.withOpacity(0.1)),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
              foregroundColor: WColors.mutedFg,
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            child: const Text(
              'Cancel',
              style: TextStyle(
                fontWeight: FontWeight.w800,
                letterSpacing: 1.5,
                fontSize: 11,
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: ElevatedButton(
            onPressed: (_cart.isEmpty || _selectedStoreId == null || _isSubmitting)
                ? null
                : _submitSale,
            style: ElevatedButton.styleFrom(
              backgroundColor: WColors.success,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            child: _isSubmitting
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Text(
                    'Confirm Sale',
                    style: TextStyle(
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.5,
                      fontSize: 11,
                    ),
                  ),
          ),
        ),
      ],
    );
  }
}

class _CartItem {
  final String productId;
  final String productName;
  final int quantity;
  final double unitPrice;

  const _CartItem({
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.unitPrice,
  });

  double get subtotal => quantity * unitPrice;

  _CartItem copyWith({
    String? productId,
    String? productName,
    int? quantity,
    double? unitPrice,
  }) {
    return _CartItem(
      productId: productId ?? this.productId,
      productName: productName ?? this.productName,
      quantity: quantity ?? this.quantity,
      unitPrice: unitPrice ?? this.unitPrice,
    );
  }
}

