const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const Store = require("../models/Store");
const Inventory = require("../models/Inventory");

const Sale = require("../models/Sale");
const { protect } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard stats and overview
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard data (stats, recent sales, low stock, distribution)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data with stats, recentSales, lowStockProducts, stockDistribution
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalProducts: { type: number }
 *                     totalStores: { type: number }
 *                     totalSales: { type: number }
 *                     lowStockAlerts: { type: number }
 *                 recentSales: { type: array }
 *                 lowStockProducts: { type: array }
 *                 stockDistribution: { type: array }
 *       401:
 *         description: Unauthorized
 */
router.get("/", protect, async (req, res) => {
    try {
        const [productCount, storeCount, totalSales, lowStockItems, recentSales, totalLowStockCount] = await Promise.all([
            Product.countDocuments({ user: req.user._id }),
            Store.countDocuments({ status: "active", user: req.user._id }),
            Sale.aggregate([{ $match: { user: req.user._id } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
            Inventory.find({ user: req.user._id, $expr: { $lte: ["$quantity", "$minStock"] } }).populate("product").populate("store").limit(5),
            Sale.find({ user: req.user._id }).sort({ date: -1 }).limit(5).populate("items.product").populate("store"),
            Inventory.countDocuments({ user: req.user._id, $expr: { $lte: ["$quantity", "$minStock"] } })
        ]);

        // Calculate stock distribution
        const inventoryData = await Inventory.find({ user: req.user._id });
        const distribution = {
            inStock: inventoryData.filter(i => i.quantity > (i.minStock || 10)).length,
            lowStock: inventoryData.filter(i => i.quantity > 0 && i.quantity <= (i.minStock || 10)).length,
            outOfStock: inventoryData.filter(i => i.quantity === 0).length
        };

        res.json({
            stats: {
                totalProducts: productCount,
                totalStores: storeCount,
                totalSales: totalSales[0] ? totalSales[0].total : 0,
                lowStockAlerts: totalLowStockCount
            },
            recentSales: recentSales.map(s => {
                const totalQty = s.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;
                const firstName = s.items?.[0]?.product?.name || "Order";
                const displayName = s.items?.length > 1 ? `${firstName} (+${s.items.length - 1} items)` : firstName;
                
                return {
                    id: s._id,
                    productName: displayName,
                    storeName: s.store ? s.store.name : "Unknown",
                    quantity: totalQty,
                    total: s.total,
                    date: s.date
                };
            }),
            lowStockProducts: lowStockItems.map(i => ({
                id: i._id,
                productName: i.product ? i.product.name : "Unknown",
                storeName: i.store ? i.store.name : "Unknown",
                quantity: i.quantity,
                status: i.quantity === 0 ? "out-of-stock" : "low-stock"
            })),
            stockDistribution: [
                { name: "In Stock", value: distribution.inStock, fill: "var(--color-chart-1)" },
                { name: "Low Stock", value: distribution.lowStock, fill: "var(--color-chart-4)" },
                { name: "Out of Stock", value: distribution.outOfStock, fill: "var(--color-chart-5)" },
            ]
        });

    } catch (error) {
        res.status(500).json({ error: "Server Error", message: error.message });
    }
});

module.exports = router;