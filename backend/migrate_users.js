const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./src/models/User");
const Store = require("./src/models/Store");
const Product = require("./src/models/Product");
const Category = require("./src/models/Category");
const Sale = require("./src/models/Sale");
const Inventory = require("./src/models/Inventory");
const Transfer = require("./src/models/Transfer");

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/stockhub").then(async () => {
  try {
    const user = await User.findOne();
    if (!user) {
      console.log("No user found in the database. Please create a user first.");
      process.exit(0);
    }
    
    console.log(`Migrating all existing records to user: ${user.email} (${user._id})`);
    
    const storeRes = await Store.updateMany({ user: { $exists: false } }, { $set: { user: user._id } });
    const productRes = await Product.updateMany({ user: { $exists: false } }, { $set: { user: user._id } });
    const categoryRes = await Category.updateMany({ user: { $exists: false } }, { $set: { user: user._id } });
    const saleRes = await Sale.updateMany({ user: { $exists: false } }, { $set: { user: user._id } });
    const invRes = await Inventory.updateMany({ user: { $exists: false } }, { $set: { user: user._id } });
    const dropRes = await Transfer.updateMany({ user: { $exists: false } }, { $set: { user: user._id } });
    
    console.log(`Migrated Stores: ${storeRes.modifiedCount}`);
    console.log(`Migrated Products: ${productRes.modifiedCount}`);
    console.log(`Migrated Categories: ${categoryRes.modifiedCount}`);
    console.log(`Migrated Sales: ${saleRes.modifiedCount}`);
    console.log(`Migrated Inventory: ${invRes.modifiedCount}`);
    console.log(`Migrated Transfers: ${dropRes.modifiedCount}`);
    
    console.log("Migration complete.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
});
