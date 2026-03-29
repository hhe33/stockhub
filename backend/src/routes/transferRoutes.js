const express = require("express");
const router = express.Router();
const Transfer = require("../models/Transfer");
const Inventory = require("../models/Inventory");
const { protect } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Transfers
 *   description: Stock transfers between stores
 */

/**
 * @swagger
 * /api/transfers:
 *   get:
 *     tags: [Transfers]
 *     summary: Get all transfers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transfers (sorted by date desc)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transfer'
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, async (req, res) => {
  try {
    const transfers = await Transfer.find({ user: req.user._id })
      .populate("product")
      .populate("fromStore")
      .populate("toStore")
      .sort({ date: -1 });
    res.json(transfers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/transfers:
 *   post:
 *     tags: [Transfers]
 *     summary: Create a transfer (moves stock between stores)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fromStore, toStore, product, quantity]
 *             properties:
 *               fromStore:
 *                 type: string
 *               toStore:
 *                 type: string
 *               product:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Transfer successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 transfer:
 *                   $ref: '#/components/schemas/Transfer'
 *       400:
 *         description: Validation error or not enough stock in source
 *       401:
 *         description: Unauthorized
 */
router.post("/", protect, async (req, res) => {
  try {
    const { fromStore, toStore, product, quantity } = req.body;

    if (!fromStore || !toStore || !product) {
      return res.status(400).json({ message: "fromStore, toStore and product are required" });
    }
    if (String(fromStore) === String(toStore)) {
      return res.status(400).json({ message: "Source and destination stores must be different" });
    }
    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    // Create a pending transfer request (approval workflow)
    // Stock is only moved when the transfer is approved.
    const transfer = new Transfer({ fromStore, toStore, product, quantity, status: "pending", user: req.user._id });
    const saved = await transfer.save();

    res.status(201).json({ message: "Transfer created (pending approval)", transfer: saved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/transfers/{id}/approve:
 *   post:
 *     tags: [Transfers]
 *     summary: Approve a pending transfer (moves stock)
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
 *         description: Transfer approved and stock moved
 *       400:
 *         description: Validation error or not enough stock
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transfer not found
 */
router.post("/:id/approve", protect, async (req, res) => {
  try {
    const transfer = await Transfer.findOne({ _id: req.params.id, user: req.user._id });
    if (!transfer) return res.status(404).json({ message: "Transfer not found" });
    if (transfer.status !== "pending") {
      return res.status(400).json({ message: `Only pending transfers can be approved (current: ${transfer.status})` });
    }

    const { fromStore, toStore, product, quantity } = transfer;

    const fromInventory = await Inventory.findOne({ store: fromStore, product, user: req.user._id });
    if (!fromInventory || fromInventory.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock in source store" });
    }

    fromInventory.quantity -= quantity;
    await fromInventory.save();

    let toInventory = await Inventory.findOne({ store: toStore, product, user: req.user._id });
    if (!toInventory) {
      toInventory = new Inventory({ store: toStore, product, quantity: 0, user: req.user._id });
    }
    toInventory.quantity += Number(quantity);
    await toInventory.save();

    transfer.status = "completed";
    await transfer.save();

    res.json({ message: "Transfer approved", transfer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/transfers/{id}/reject:
 *   post:
 *     tags: [Transfers]
 *     summary: Reject a pending transfer (does not move stock)
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
 *         description: Transfer rejected
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transfer not found
 */
router.post("/:id/reject", protect, async (req, res) => {
  try {
    const transfer = await Transfer.findOne({ _id: req.params.id, user: req.user._id });
    if (!transfer) return res.status(404).json({ message: "Transfer not found" });
    if (transfer.status !== "pending") {
      return res.status(400).json({ message: `Only pending transfers can be rejected (current: ${transfer.status})` });
    }

    transfer.status = "cancelled";
    await transfer.save();

    res.json({ message: "Transfer rejected", transfer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;