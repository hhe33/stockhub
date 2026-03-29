const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  fromStore: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true
  },
  toStore: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store"
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  quantity: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "in-transit", "completed", "cancelled"],
    default: "pending"
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Transfer", transferSchema);