const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const { protect } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Product categories management
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort({ name: 1 }).lean();
    const Product = require("../models/Product");

    // Get product counts grouped by category name
    const counts = await Product.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // Simple map for O(1) lookup
    const countMap = {};
    counts.forEach(c => {
      if (c._id) countMap[c._id] = c.count;
    });

    // Enrich categories with the count found, default to 0
    const enriched = categories.map(cat => ({
      ...cat,
      count: countMap[cat.name] || 0
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create a category
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
 *               name: { type: string, example: "Electronics" }
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Category already exists
 */
router.post("/", protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || String(name).trim() === "") {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existing = await Category.findOne({ name: String(name).trim(), user: req.user._id });
    if (existing) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const created = await Category.create({ 
        name: String(name).trim(),
        description: description?.trim(),
        user: req.user._id
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update a category
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
 *               name: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 */
router.put("/:id", protect, async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
        if (!category) return res.status(404).json({ message: "Category not found" });

        if (name) category.name = name.trim();
        if (description !== undefined) category.description = description.trim();

        await category.save();
        res.json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category
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
 *         description: Category deleted
 *       400:
 *         description: Category has products
 *       404:
 *         description: Category not found
 */
router.delete("/:id", protect, async (req, res) => {
    try {
        const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
        if (!category) return res.status(404).json({ message: "Category not found" });

        // Check for products using this category
        const Product = require("../models/Product");
        const productCount = await Product.countDocuments({ category: category.name, user: req.user._id });
        
        if (productCount > 0) {
            return res.status(400).json({ message: "Cannot delete: this category has products" });
        }

        await category.deleteOne();
        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;


