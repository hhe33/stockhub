const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");

const Inventory = require("../models/Inventory");
const Sale = require("../models/Sale");
const Transfer = require("../models/Transfer");
const { protect } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Reporting module (exports)
 */

/**
 * @swagger
 * /api/reports/summary:
 *   get:
 *     tags: [Reports]
 *     summary: Get global summary for the selected date range (sales) and current stock snapshot
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, example: "2026-03-01" }
 *       - in: query
 *         name: to
 *         schema: { type: string, example: "2026-03-31" }
 *       - in: query
 *         name: storeId
 *         schema: { type: string, example: "all" }
 *     responses:
 *       200:
 *         description: Summary KPIs
 */
router.get("/summary", protect, async (req, res) => {
  try {
    const { from, to, storeId = "all" } = req.query;

    const saleMatch = { user: req.user._id };
    if (from || to) {
      saleMatch.date = {};
      if (from) saleMatch.date.$gte = new Date(String(from));
      if (to) {
        const end = new Date(String(to));
        end.setHours(23, 59, 59, 999);
        saleMatch.date.$lte = end;
      }
    }
    
    let storeMatch = { user: req.user._id };
    if (storeId && storeId !== "all") {
      try {
        const oid = new mongoose.Types.ObjectId(String(storeId));
        saleMatch.store = oid;
        storeMatch.store = oid;
      } catch (e) {
        // Invalid ID, match nothing or skip
      }
    }

    const [salesAgg, stockAgg] = await Promise.all([
      Sale.aggregate([
        { $match: saleMatch },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$total" },
            unitsSold: { 
              $sum: { 
                $reduce: {
                  input: "$items",
                  initialValue: 0,
                  in: { $add: ["$$value", "$$this.quantity"] }
                } 
              } 
            },
            transactions: { $sum: 1 },
          },
        },
      ]),
      Inventory.aggregate([
        ...(Object.keys(storeMatch).length > 0 ? [{ $match: storeMatch }] : []),
        {
          $group: {
            _id: null,
            totalUnitsInStock: { $sum: "$quantity" },
            lowStockCount: {
              $sum: {
                $cond: [{ $and: [{ $gt: ["$quantity", 0] }, { $lte: ["$quantity", "$minStock"] }] }, 1, 0],
              },
            },
            outOfStockCount: {
              $sum: {
                $cond: [{ $eq: ["$quantity", 0] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    const s = salesAgg[0] || { revenue: 0, unitsSold: 0, transactions: 0 };
    const st = stockAgg[0] || { totalUnitsInStock: 0, lowStockCount: 0, outOfStockCount: 0 };
    const avgOrderValue = s.transactions > 0 ? s.revenue / s.transactions : 0;

    res.json({
      revenue: s.revenue,
      unitsSold: s.unitsSold,
      transactions: s.transactions,
      avgOrderValue,
      totalUnitsInStock: st.totalUnitsInStock,
      lowStockCount: st.lowStockCount,
      outOfStockCount: st.outOfStockCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function toCsv(rows) {
  if (!rows || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}

/**
 * @swagger
 * /api/reports/stock.csv:
 *   get:
 *     tags: [Reports]
 *     summary: Export current stock snapshot as CSV
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: storeId
 *         schema: { type: string, example: "all" }
 *     responses:
 *       200:
 *         description: CSV file
 */
router.get("/stock.csv", protect, async (req, res) => {
  try {
    const { storeId = "all" } = req.query;
    const match = storeId && storeId !== "all" 
      ? { store: storeId, user: req.user._id } 
      : { user: req.user._id };
    const items = await Inventory.find(match).populate("store").populate("product");

    const rows = items.map((i) => ({
      store: i.store?.name || "Unknown",
      product: i.product?.name || "Unknown",
      sku: i.product?.sku || "",
      quantity: i.quantity ?? 0,
      minStock: i.minStock ?? 10,
      status: (i.quantity ?? 0) === 0 ? "out-of-stock" : (i.quantity ?? 0) < (i.minStock ?? 10) ? "low-stock" : "in-stock",
    }));

    const csv = toCsv(rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="stock-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/reports/stock.pdf:
 *   get:
 *     tags: [Reports]
 *     summary: Export current stock snapshot as PDF
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: storeId
 *         schema: { type: string, example: "all" }
 *     responses:
 *       200:
 *         description: PDF file
 */
router.get("/stock.pdf", protect, async (req, res) => {
  try {
    const { storeId = "all" } = req.query;
    const match = storeId && storeId !== "all" 
      ? { store: storeId, user: req.user._id } 
      : { user: req.user._id };
    const items = await Inventory.find(match).populate("store").populate("product");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="stock-${Date.now()}.pdf"`);

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    doc.fontSize(18).text("Stock Report", { align: "left" });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("gray").text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown(1);

    doc.fillColor("black").fontSize(12);
    items.slice(0, 500).forEach((i) => {
      const store = i.store?.name || "Unknown";
      const product = i.product?.name || "Unknown";
      const sku = i.product?.sku || "";
      const qty = i.quantity ?? 0;
      const min = i.minStock ?? 10;
      doc.text(`${store} — ${product} (${sku}) | qty: ${qty} | min: ${min}`);
    });

    if (items.length > 500) {
      doc.moveDown(1).fillColor("gray").text(`(Truncated) Showing first 500 rows out of ${items.length}.`);
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;


