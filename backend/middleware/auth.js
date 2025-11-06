// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token provided" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Invalid token format" });

  try {
    // Verify JWT
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in DB
    const user = await User.findById(payload.id).select("-passwordHash");
    if (!user) return res.status(401).json({ error: "User not found" });

    // Optional: token invalidation check
    if (payload.version !== user.tokenVersion) {
      return res.status(401).json({ error: "Token expired / invalidated" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Auth middleware error:", err.name, err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = auth;
