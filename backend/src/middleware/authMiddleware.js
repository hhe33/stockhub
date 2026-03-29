const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const protect = (req, res, next) => {
    let token = "";
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.query && req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.user._id = new mongoose.Types.ObjectId(String(decoded.id || decoded._id)); // Cast to ObjectId for aggregation matches
        next();
    } catch (err) {
        return res.status(401).json({ message: "Not authorized, invalid token" });
    }
};

module.exports = { protect };
