import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'api_service.dart';
import 'widgets/tech_widgets.dart';

class CreateTransferScreen extends StatefulWidget {
  const CreateTransferScreen({super.key});

  @override
  State<CreateTransferScreen> createState() => _CreateTransferScreenState();
}

class _CreateTransferScreenState extends State<CreateTransferScreen> {
  final _api = ApiService();

  List<dynamic> _stores = [];
  List<dynamic> _products = [];

  bool _isLoading = true;
  bool _isSubmitting = false;
  String? _error;

  String? _fromStoreId;
  String? _toStoreId;
  String? _productId;
  final _qtyCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _qtyCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    final stores = await _api.getStores();
    final products = await _api.getProducts();
    setState(() {
      _stores = stores ?? [];
      _products = products ?? [];
      _isLoading = false;
    });
  }

  Future<void> _submitTransfer() async {
    setState(() => _error = null);
    final qty = int.tryParse(_qtyCtrl.text.trim());

    if (_fromStoreId == null ||
        _toStoreId == null ||
        _productId == null ||
        qty == null ||
        qty <= 0) {
      setState(() => _error = 'Select source, target, product and a quantity > 0.');
      return;
    }
    if (_fromStoreId == _toStoreId) {
      setState(() => _error = 'Source and target stores must be different.');
      return;
    }

    setState(() {
      _isSubmitting = true;
    });
    try {
      final payload = {
        'fromStore': _fromStoreId,
        'toStore': _toStoreId,
        'product': _productId,
        'quantity': qty,
      };
      final ok = await _api.createTransfer(payload);
      if (!ok) {
        setState(() => _error = 'Failed to create transfer. Check source stock and data.');
        return;
      }
      if (mounted) {
        Navigator.pop(context, true);
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
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
                          color: WColors.info,
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
                'MODULE: TRANSFERS',
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 3,
                  color: WColors.info,
                ),
              ),
              Text(
                'Initiate Transfer',
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
    if (_stores.length < 2 || _products.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text(
            'Need at least 2 active stores and 1 product.\nConfigure them on the web dashboard first.',
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
          _buildStoreSelectors(),
          const SizedBox(height: 20),
          _buildProductSelector(),
          const SizedBox(height: 20),
          _buildQuantityField(),
          const SizedBox(height: 24),
          _buildFooter(),
        ],
      ),
    );
  }

  Widget _buildStoreSelectors() {
    final activeStores =
        _stores.where((s) => (s['status'] ?? 'active') == 'active').toList();

    return GlassCard(
      borderRadius: 20,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '1. Select Nodes',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.2,
              color: WColors.mutedFg.withOpacity(0.9),
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: _buildStoreDropdown(
                  label: 'Source Node',
                  hint: 'Origin',
                  value: _fromStoreId,
                  stores: activeStores,
                  onChanged: (val) {
                    setState(() {
                      _fromStoreId = val;
                      if (_toStoreId == _fromStoreId) {
                        _toStoreId = null;
                      }
                    });
                  },
                  indicatorColor: Colors.amber,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStoreDropdown(
                  label: 'Target Node',
                  hint: 'Destination',
                  value: _toStoreId,
                  stores: activeStores
                      .where((s) =>
                          (s['_id'] ?? s['id']).toString() !=
                          (_fromStoreId ?? ''))
                      .toList(),
                  onChanged: (val) {
                    setState(() => _toStoreId = val);
                  },
                  indicatorColor: Colors.teal,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStoreDropdown({
    required String label,
    required String hint,
    required List<dynamic> stores,
    required ValueChanged<String?> onChanged,
    required Color indicatorColor,
    String? value,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 6,
              height: 6,
              margin: const EdgeInsets.only(right: 6),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: indicatorColor.withOpacity(0.8),
              ),
            ),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
                color: WColors.mutedFg.withOpacity(0.9),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.03),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.white.withOpacity(0.06)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: value,
              hint: Text(
                hint,
                style: const TextStyle(
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
              items: stores
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
              onChanged: onChanged,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildProductSelector() {
    return GlassCard(
      borderRadius: 20,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '2. Asset Payload',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.2,
              color: WColors.mutedFg.withOpacity(0.9),
            ),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.03),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white.withOpacity(0.06)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _productId,
                hint: const Text(
                  'Select asset for transfer',
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
                items: _products
                    .map(
                      (p) => DropdownMenuItem<String>(
                        value: (p['_id'] ?? p['id']).toString(),
                        child: Text(
                          p['name'] ?? 'Asset',
                          style: const TextStyle(
                            color: WColors.foreground,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    )
                    .toList(),
                onChanged: (val) {
                  setState(() => _productId = val);
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuantityField() {
    return GlassCard(
      borderRadius: 20,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '3. Quantity to Relocate',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.2,
              color: WColors.mutedFg.withOpacity(0.9),
            ),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _qtyCtrl,
            keyboardType: TextInputType.number,
            style: const TextStyle(
              color: WColors.foreground,
              fontSize: 14,
            ),
            decoration: InputDecoration(
              prefixIcon: const Icon(
                LucideIcons.package,
                size: 18,
                color: WColors.mutedFg,
              ),
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
                borderSide:
                    BorderSide(color: WColors.primary.withOpacity(0.5)),
              ),
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              hintText: 'Enter quantity',
              hintStyle: TextStyle(
                color: WColors.mutedFg.withOpacity(0.6),
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
              'Abort Transfer',
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
            onPressed: _isSubmitting ? null : _submitTransfer,
            style: ElevatedButton.styleFrom(
              backgroundColor: WColors.info,
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
                    'Execute Protocol',
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

