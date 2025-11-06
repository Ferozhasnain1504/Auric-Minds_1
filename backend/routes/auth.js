const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// ✅ Create signed JWT with version
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, version: user.tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: "2d" }
  );
};

// ✅ Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;

    if (!name || !email || !password || !phone || !location) {
      return res.status(400).json({ error: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already exists" });

    const user = new User({
      name,
      email,
      phone,
      location,
    });

    await user.setPassword(password);
    await user.save();

    const token = signToken(user);

    res.json({
      message: "✅ Registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Registration failed" });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const ok = await user.verifyPassword(password);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const token = signToken(user);

    res.json({
      message: "✅ Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
