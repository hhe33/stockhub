const express = require("express");
const router = express.Router();
const Sale = require("../models/Sale");
const Inventory = require("../models/Inventory");
const { protect } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Sales
 *   description: Sales management
 */

/**
 * @swagger
 * /api/sales:
 *   get:
 *     tags: [Sales]
 *     summary: Get all sales
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sales (sorted by date desc)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sale'
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, async (req, res) => {
  try {
    const sales = await Sale.find({ user: req.user._id }).populate("items.product").populate("store").sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/sales:
 *   post:
 *     tags: [Sales]
 *     summary: Create a sale (deducts from inventory)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [store, items, total]
 *             properties:
 *               store:
 *                 type: string
 *                 example: "64abc123def456"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [product, quantity, unitPrice, subtotal]
 *                   properties:
 *                     product: { type: string, example: "64abc123def456" }
 *                     quantity: { type: number, example: 2 }
 *                     unitPrice: { type: number, example: 10 }
 *                     subtotal: { type: number, example: 20 }
 *               total:
 *                 type: number
 *                 example: 20
 *     responses:
 *       201:
 *         description: Sale created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Validation error or not enough stock
 *       401:
 *         description: Unauthorized
 */
router.post("/", protect, async (req, res) => {
  try {
    const { store, items, total } = req.body;

    if (!store || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Store and items array are required" });
    }
    if (total === undefined || Number(total) < 0) {
      return res.status(400).json({ message: "Total must be a non-negative number" });
    }

    // 1. Validate all stock availability before deduction
    for (let item of items) {
      if (!item.quantity || Number(item.quantity) <= 0) {
        return res.status(400).json({ message: "Item quantity must be greater than 0" });
      }
      const inventory = await Inventory.findOne({ store, product: item.product, user: req.user._id });
      if (!inventory || inventory.quantity < item.quantity) {
        return res.status(400).json({ message: `Not enough stock available for product ID: ${item.product}` });
      }
    }

    // 2. Deduct inventory for all items
    for (let item of items) {
      const inventory = await Inventory.findOne({ store, product: item.product, user: req.user._id });
      inventory.quantity -= item.quantity;
      await inventory.save();
    }

    const sale = new Sale({ store, items, total, user: req.user._id });
    const saved = await sale.save();
    
    // Populate for the response
    await saved.populate("items.product");
    await saved.populate("store");

    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;