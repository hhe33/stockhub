const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  name: { type: String, required: true },
  city: { type: String },
  address: { type: String },
  phone: { type: String },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  }
}, { timestamps: true });

module.exports = mongoose.model("Store", storeSchema);