const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");

mongoose.connect(process.env.MONGO_URI);

const seedAdmin = async () => {
    try {
        // Check if admin already exists
        const existing = await User.findOne({ email: "admin@stockhub.com" });
        if (existing) {
            console.log("Admin user already exists:", existing.email);
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash("Admin@2026!", 12);
        await User.create({
            name: "Admin",
            email: "admin@stockhub.com",
            password: hashedPassword,
            role: "admin"
        });

        console.log("✅ Admin user created successfully!");
        console.log("📧 Email: admin@stockhub.com");
        console.log("🔑 Password: Admin@2026!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exit(1);
    }
};

seedAdmin();
