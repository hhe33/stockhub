const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Store = require("../models/Store");
const Inventory = require("../models/Inventory");
const { protect } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalogue management
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, async (req, res) => {
    try {
        const products = await Product.find({ user: req.user._id }).lean();
        
        // Get total stock for each product from Inventory
        const stockData = await Inventory.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: "$product", totalStock: { $sum: "$quantity" } } }
        ]);
        
        // Create a map for O(1) lookup
        const stockMap = {};
        stockData.forEach(item => {
            if (item._id) stockMap[item._id.toString()] = item.totalStock;
        });
        
        // Enrich products with the total stock found, default to 0
        const enriched = products.map(p => ({
            ...p,
            stock: stockMap[p._id.toString()] || 0
        }));
        
        res.json(enriched);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get a product by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.get("/:id", protect, async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, user: req.user._id });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Create a new product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, sku]
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: SKU already exists
 */
router.post("/", protect, async (req, res) => {
    try {
        const { name, sku, price, initialQuantity, initialStoreId } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({ message: "Product name is required" });
        }
        if (!sku || sku.trim() === "") {
            return res.status(400).json({ message: "SKU is required" });
        }
        if (price !== undefined && (isNaN(price) || Number(price) < 0)) {
            return res.status(400).json({ message: "Price must be a non-negative number" });
        }
        if (initialQuantity !== undefined && (isNaN(initialQuantity) || Number(initialQuantity) < 0)) {
            return res.status(400).json({ message: "Initial quantity must be a non-negative number" });
        }

        // Don't persist extra fields on Product
        const { initialQuantity: _iq, initialStoreId: _is, ...productFields } = req.body;

        const product = new Product({ ...productFields, user: req.user._id });
        const saved = await product.save();

        // Ensure inventory rows exist so the product is accounted for in stock stats
        const activeStores = await Store.find({ status: "active", user: req.user._id }).select("_id");
        if (activeStores.length > 0) {
            const quantityForStore = new Map();
            if (initialStoreId) quantityForStore.set(String(initialStoreId), Number(initialQuantity) || 0);

            const ops = activeStores.map(s => ({
                updateOne: {
                    filter: { store: s._id, product: saved._id, user: req.user._id },
                    update: {
                        $setOnInsert: {
                            user: req.user._id,
                            store: s._id,
                            product: saved._id,
                            quantity: quantityForStore.get(String(s._id)) ?? 0,
                            minStock: 10,
                        }
                    },
                    upsert: true
                }
            }));
            await Inventory.bulkWrite(ops);
        }

        res.status(201).json(saved);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "A product with this SKU already exists" });
        }
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update a product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.put("/:id", protect, async (req, res) => {
    try {
        const { name, price } = req.body;

        if (name !== undefined && name.trim() === "") {
            return res.status(400).json({ message: "Product name cannot be empty" });
        }
        if (price !== undefined && (isNaN(price) || Number(price) < 0)) {
            return res.status(400).json({ message: "Price must be a non-negative number" });
        }

        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.delete("/:id", protect, async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        await Inventory.deleteMany({ product: product._id, user: req.user._id });
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;