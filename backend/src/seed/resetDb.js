const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("../models/Product");
const Store = require("../models/Store");
const Inventory = require("../models/Inventory");
const Sale = require("../models/Sale");
const Transfer = require("../models/Transfer");
const Category = require("../models/Category");

async function resetDb() {
    try {
        console.log("Connecting to MongoDB for reset...");
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log("Clearing collections...");
        await Product.deleteMany({});
        await Store.deleteMany({});
        await Inventory.deleteMany({});
        await Sale.deleteMany({});
        await Transfer.deleteMany({});
        await Category.deleteMany({});
        
        console.log("Database reset successfully. All collections cleared.");
        process.exit(0);
    } catch (error) {
        console.error("Error resetting database:", error);
        process.exit(1);
    }
}

resetDb();
