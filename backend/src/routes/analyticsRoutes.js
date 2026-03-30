const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Sale = require("../models/Sale");
const Inventory = require("../models/Inventory");
const Store = require("../models/Store");
const { protect } = require("../middleware/authMiddleware");

// Helper to build match query from request
const getMatchQuery = (query, req) => {
  const { from, to, storeId } = query;
  const match = { user: req.user._id };
  if (from || to) {
    match.date = {};
    if (from) match.date.$gte = new Date(from);
    if (to) {
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);
      match.date.$lte = endDate;
    }
  }
  if (storeId && storeId !== "all") {
    try {
      match.store = new mongoose.Types.ObjectId(storeId);
    } catch (e) {
      // Ignore invalid IDs
    }
  }
  return match;
};

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics and reports
 */

/**
 * @swagger
 * /api/analytics/total-sales:
 *   get:
 *     tags: [Analytics]
 *     summary: Get total sales (revenue and items sold)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string }
 *       - in: query
 *         name: to
 *         schema: { type: string }
 *       - in: query
 *         name: storeId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: totalRevenue and totalItemsSold
 */
router.get("/total-sales", protect, async (req, res) => {
  try {
    const match = getMatchQuery(req.query, req);
    const result = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalItemsSold: { 
            $sum: { 
              $reduce: {
                input: "$items",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.quantity"] }
              } 
            } 
          }
        }
      }
    ]);
    res.json(result[0] || { totalRevenue: 0, totalItemsSold: 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/analytics/sales-by-store:
 *   get:
 *     tags: [Analytics]
 *     summary: Get sales grouped by store
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string }
 *       - in: query
 *         name: to
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Array of { store, sales }
 */
router.get("/sales-by-store", protect, async (req, res) => {
  try {
    const match = getMatchQuery(req.query, req);
    const result = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$store",
          totalRevenue: { $sum: "$total" }
        }
      }
    ]);
    const populated = await Store.populate(result, { path: "_id", select: "name" });
    res.json(populated.map(r => ({
      store: r._id ? r._id.name : "Unknown",
      sales: r.totalRevenue
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/analytics/low-stock:
 *   get:
 *     tags: [Analytics]
 *     summary: Get inventory items with quantity below minStock
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: storeId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of low-stock inventory items
 */
router.get("/low-stock", protect, async (req, res) => {
  try {
    const { storeId } = req.query;
    const filter = { user: req.user._id };
    if (storeId && storeId !== "all") {
      try {
        filter.store = new mongoose.Types.ObjectId(String(storeId));
      } catch (e) {}
    }
    
    const result = await Inventory.find({
      ...filter,
      $expr: { $and: [{ $gt: ["$quantity", 0] }, { $lte: ["$quantity", "$minStock"] }] }
    }).populate("product").populate("store");
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/analytics/sales-by-category:
 *   get:
 *     tags: [Analytics]
 *     summary: Get sales grouped by category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string }
 *       - in: query
 *         name: to
 *         schema: { type: string }
 *       - in: query
 *         name: storeId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Array of { category, sales }
 */
router.get("/sales-by-category", protect, async (req, res) => {
  try {
    const match = getMatchQuery(req.query, req);
    const result = await Sale.aggregate([
      { $match: match },
      { $unwind: "$items" },
      { $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDoc"
      }},
      { $unwind: "$productDoc" },
      { $project: {
          category: { $toLower: { $ifNull: ["$productDoc.category", "uncategorized"] } },
          subtotal: "$items.subtotal"
      }},
      {
        $group: {
          _id: "$category",
          totalRevenue: { $sum: "$subtotal" }
        }
      }
    ]);
    const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4', '#f97316'];
    res.json(result.map((r, i) => ({
      category: r._id.charAt(0).toUpperCase() + r._id.slice(1),
      sales: r.totalRevenue,
      fill: CHART_COLORS[i % CHART_COLORS.length]
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/analytics/sales-trend:
 *   get:
 *     tags: [Analytics]
 *     summary: Get sales trend
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string }
 *       - in: query
 *         name: to
 *         schema: { type: string }
 *       - in: query
 *         name: storeId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Array of { month, sales }
 */
router.get("/sales-trend", protect, async (req, res) => {
  try {
    const { from, to, storeId } = req.query;
    const match = getMatchQuery(req.query, req);
    
    // If no dates provided, default to last 6 months
    if (!from && !to) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      match.date = { $gte: sixMonthsAgo };
    }

    const result = await Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $month: "$date" },
          year: { $first: { $year: "$date" } },
          totalRevenue: { $sum: "$total" }
        }
      },
      { $sort: { year: 1, _id: 1 } }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    res.json(result.map(r => ({
      month: `${months[r._id - 1]} ${r.year}`,
      sales: r.totalRevenue
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;