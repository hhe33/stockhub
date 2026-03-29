const express = require("express");
const router = express.Router();
const Store = require("../models/Store");
const { protect } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Stores
 *   description: Store management
 */

/**
 * @swagger
 * /api/stores:
 *   get:
 *     tags: [Stores]
 *     summary: Get all stores
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of stores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Store'
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, async (req, res) => {
  try {
    const stores = await Store.find({ user: req.user._id });
    res.json(stores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/stores/{id}:
 *   get:
 *     tags: [Stores]
 *     summary: Get a store by ID
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
 *         description: Store details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Store not found
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const store = await Store.findOne({ _id: req.params.id, user: req.user._id });
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/stores:
 *   post:
 *     tags: [Stores]
 *     summary: Create a new store
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Store created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/", protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Store name is required" });
    }
    const store = new Store({ ...req.body, user: req.user._id });
    const saved = await store.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/stores/{id}:
 *   put:
 *     tags: [Stores]
 *     summary: Update a store
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
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Store updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Store not found
 */
router.put("/:id", protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (name !== undefined && name.trim() === "") {
      return res.status(400).json({ message: "Store name cannot be empty" });
    }
    const store = await Store.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true }
    );
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.json(store);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/stores/{id}:
 *   delete:
 *     tags: [Stores]
 *     summary: Delete a store
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
 *         description: Store deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Store not found
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const store = await Store.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!store) return res.status(404).json({ message: "Store not found" });
    res.json({ message: "Store deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;