const mongoose = require("mongoose");
const Store = require("./src/models/Store");
const Sale = require("./src/models/Sale");
const Inventory = require("./src/models/Inventory");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/stockhub").then(async () => {
  const stores = await Store.find();
  console.log(`Total stores: ${stores.length}`);
  
  for (const store of stores) {
    const saleCount = await Sale.countDocuments({ store: store._id });
    const invCount = await Inventory.countDocuments({ store: store._id });
    console.log(`Store: ${store.name} | Sales: ${saleCount} | Inventory Items: ${invCount}`);
  }

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
