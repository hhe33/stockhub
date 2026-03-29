const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("../models/Product");
const Store = require("../models/Store");
const Inventory = require("../models/Inventory");
const Sale = require("../models/Sale");
const Transfer = require("../models/Transfer");

mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
    try {
        await Product.deleteMany();
        await Store.deleteMany();
        await Inventory.deleteMany();
        await Sale.deleteMany();
        await Transfer.deleteMany();

        console.log("Database cleared successfully");
        process.exit();
    } catch (error) {
        console.error("Clearing error:", error);
        process.exit(1);
    }
};

seedData();