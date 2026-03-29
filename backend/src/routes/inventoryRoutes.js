const express = require("express");
const router = express.Router();
const Inventory = require("../models/Inventory");
const { protect } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory and stock management
 */

/**
 * @swagger
 * /api/inventory/full:
 *   get:
 *     tags: [Inventory]
 *     summary: Get full inventory (with store and product populated)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Full inventory list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inventory'
 *       401:
 *         description: Unauthorized
 */
router.get("/full", protect, async (req, res) => {
    try {
        const inventory = await Inventory.find({ user: req.user._id }).populate("store").populate("product");
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     tags: [Inventory]
 *     summary: Get all inventory
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inventory'
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, async (req, res) => {
    try {
        const inventory = await Inventory.find({ user: req.user._id }).populate("store").populate("product");
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     tags: [Inventory]
 *     summary: Get inventory item by ID
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
 *         description: Inventory item details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inventory'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Inventory item not found
 */
router.get("/:id", protect, async (req, res) => {
    try {
        const item = await Inventory.findOne({ _id: req.params.id, user: req.user._id }).populate("store").populate("product");
        if (!item) return res.status(404).json({ message: "Inventory item not found" });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     tags: [Inventory]
 *     summary: Add an inventory item
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [store, product]
 *             properties:
 *               store:
 *                 type: string
 *               product:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Inventory item created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inventory'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/", protect, async (req, res) => {
    try {
        const { store, product, quantity } = req.body;
        if (!store || !product) {
            return res.status(400).json({ message: "Store and product are required" });
        }
        if (quantity !== undefined && (isNaN(quantity) || Number(quantity) < 0)) {
            return res.status(400).json({ message: "Quantity must be a non-negative number" });
        }
        const inventory = new Inventory({ ...req.body, user: req.user._id });
        const saved = await inventory.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     tags: [Inventory]
 *     summary: Update inventory quantity
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
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Inventory updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Inventory'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Inventory item not found
 */
router.put("/:id", protect, async (req, res) => {
    try {
        const { quantity } = req.body;
        if (quantity !== undefined && (isNaN(quantity) || Number(quantity) < 0)) {
            return res.status(400).json({ message: "Quantity must be a non-negative number" });
        }
        const item = await Inventory.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true }
        );
        if (!item) return res.status(404).json({ message: "Inventory item not found" });
        res.json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/inventory/restock:
 *   post:
 *     tags: [Inventory]
 *     summary: Restock inventory for a given store+product (upserts and adds units)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [store, product, addQuantity]
 *             properties:
 *               store: { type: string }
 *               product: { type: string }
 *               addQuantity: { type: number, example: 10 }
 *               minStock: { type: number, example: 10 }
 *     responses:
 *       200:
 *         description: Inventory updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/restock", protect, async (req, res) => {
    try {
        const { store, product, addQuantity, minStock } = req.body;
        if (!store || !product) {
            return res.status(400).json({ message: "Store and product are required" });
        }
        if (addQuantity === undefined || isNaN(addQuantity) || Number(addQuantity) < 0) {
            return res.status(400).json({ message: "addQuantity must be greater than or equal to 0" });
        }
        if (minStock !== undefined && (isNaN(minStock) || Number(minStock) < 0)) {
            return res.status(400).json({ message: "minStock must be a non-negative number" });
        }

        const update = {
            $inc: { quantity: Number(addQuantity) },
        };
        if (minStock !== undefined) {
            update.$set = { minStock: Number(minStock) };
        }
        update.$setOnInsert = { user: req.user._id };

        const item = await Inventory.findOneAndUpdate(
            { store, product, user: req.user._id },
            update,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;