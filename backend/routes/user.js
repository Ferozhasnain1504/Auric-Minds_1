const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// ✅ Get logged in user data
router.get("/me", auth, async (req, res) => {
  res.json(req.user);
});

// ✅ Update profile settings (name, alert levels, prefs…)
router.put("/me", auth, async (req, res) => {
  const updates = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-passwordHash");
  res.json(user);
});

// ✅ Delete account
router.delete("/me", auth, async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.json({ message: "Account deleted" });
});

module.exports = router;
