const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
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
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    default: 0
  },
  minStock: {
    type: Number,
    default: 10
  }
});

// empêcher doublons produit + magasin
inventorySchema.index({ store: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("Inventory", inventorySchema);