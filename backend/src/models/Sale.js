const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true }
  }],
  total: { type: Number, required: true },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Sale", saleSchema);