const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");
const Product = require("../models/Product");
const Store = require("../models/Store");
const Inventory = require("../models/Inventory");
const Sale = require("../models/Sale");
const Transfer = require("../models/Transfer");
const Category = require("../models/Category");

const seedData = async () => {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Clearing existing data...");
        await User.deleteMany({});
        await Product.deleteMany({});
        await Store.deleteMany({});
        await Inventory.deleteMany({});
        await Sale.deleteMany({});
        await Transfer.deleteMany({});
        await Category.deleteMany({});

        console.log("Creating Admin User...");
        const hashedPassword = await bcrypt.hash("Gerant@2026!", 12);
        await User.create({
            name: "Gérant StockHub",
            email: "gerant@stockhub.com",
            password: hashedPassword,
            role: "admin"
        });

        console.log("Creating Categories...");
        const catElectronics = await Category.create({ name: "Électronique", description: "Appareils électroniques et gadgets" });
        const catClothing = await Category.create({ name: "Vêtements", description: "Vêtements, chaussures et accessoires" });
        const catFood = await Category.create({ name: "Alimentation", description: "Produits alimentaires" });

        console.log("Creating Stores...");
        const store1 = await Store.create({ name: "Agence Principale (Paris)", city: "Paris", address: "123 Rue de Rivoli", phone: "0142345678", status: "active" });
        const store2 = await Store.create({ name: "Agence Secondaire (Lyon)", city: "Lyon", address: "45 Avenue de la République", phone: "0478123456", status: "active" });

        console.log("Creating Products...");
        const prod1 = await Product.create({ name: "Ordinateur Portable Pro", sku: "LAP-PRO-01", barcode: "1234567890123", category: catElectronics.name, price: 1200, description: "Un ordinateur portable performant pour les professionnels." });
        const prod2 = await Product.create({ name: "Smartphone Ultra", sku: "SM-ULTRA-02", barcode: "9876543210987", category: catElectronics.name, price: 800, description: "Dernier modèle avec un appareil photo exceptionnel." });
        const prod3 = await Product.create({ name: "T-Shirt en Coton", sku: "TS-COT-03", barcode: "5555555555555", category: catClothing.name, price: 20, description: "T-shirt basique et confortable 100% coton." });

        console.log("Setting up Inventory...");
        await Inventory.create({ store: store1._id, product: prod1._id, quantity: 50, minStock: 10 });
        await Inventory.create({ store: store1._id, product: prod2._id, quantity: 150, minStock: 20 });
        await Inventory.create({ store: store1._id, product: prod3._id, quantity: 200, minStock: 30 });

        await Inventory.create({ store: store2._id, product: prod1._id, quantity: 10, minStock: 5 });
        await Inventory.create({ store: store2._id, product: prod2._id, quantity: 30, minStock: 10 });

        console.log("Creating Transfers...");
        await Transfer.create({
            fromStore: store1._id,
            toStore: store2._id,
            product: prod1._id,
            quantity: 5,
            status: "pending"
        });
        await Transfer.create({
            fromStore: store2._id,
            toStore: store1._id,
            product: prod2._id,
            quantity: 10,
            status: "completed"
        });

        console.log("Creating Sales...");
        await Sale.create({
            store: store1._id,
            items: [
                { product: prod1._id, quantity: 2, unitPrice: 1200, subtotal: 2400 },
                { product: prod3._id, quantity: 3, unitPrice: 20, subtotal: 60 }
            ],
            total: 2460
        });
        await Sale.create({
            store: store2._id,
            items: [
                { product: prod2._id, quantity: 1, unitPrice: 800, subtotal: 800 }
            ],
            total: 800
        });

        console.log("✅ Database seeded successfully with fresh, coherent data!");
        console.log("---");
        console.log("👤 Nouvel Utilisateur (Gérant):");
        console.log("📧 Email: gerant@stockhub.com");
        console.log("🔑 Mot de passe: Gerant@2026!");
        console.log("---");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedData();
