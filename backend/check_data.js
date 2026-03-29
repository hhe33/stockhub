const mongoose = require('mongoose');
require('dotenv').config();

const Sale = require('./src/models/Sale');

async function checkData() {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error("MONGO_URI not found");
        
        await mongoose.connect(uri);
        console.log("Connected to MongoDB successfully");
        
        const count = await Sale.countDocuments();
        console.log(`Total Sales in DB: ${count}`);
        
        if (count > 0) {
            const lastSales = await Sale.find().sort({ date: -1 }).limit(3);
            console.log("Last 3 sales (compact):");
            lastSales.forEach(s => {
                console.log(`- ID: ${s._id}, Store: ${s.store}, Total: ${s.total}, Date: ${s.date}`);
            });
            
            console.log("\nFull detail of most recent sale:");
            console.log(JSON.stringify(lastSales[0], null, 2));
        } else {
            console.log("No sales found in database.");
        }
        
    } catch (err) {
        console.error("DIAGNOSTIC ERROR:", err.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkData();
