// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const deviceSchema = new mongoose.Schema({
  name: String,
  type: String,
  status: { type: String, default: "disconnected" },
  battery: { type: Number, default: 0 },
  lastSync: { type: String, default: "" },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },

  phone: { type: String, default: "" },
  location: { type: String, default: "" },
  avatarUrl: { type: String, default: "" },

  notifications: { type: Boolean, default: true },
  darkMode: { type: Boolean, default: true },
  stressAlertLevel: { type: Number, default: 75 },
  fatigueAlertLevel: { type: Number, default: 70 },

  devices: { type: [deviceSchema], default: [] },

  tokenVersion: { type: Number, default: 0 },

  role: { type: String, enum: ["user", "admin"], default: "user" },
  createdAt: { type: Date, default: Date.now },
});

// 🔒 Hash password
userSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

// 🔐 Verify password
userSchema.methods.verifyPassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

// 🚪 Helper to invalidate tokens (optional future feature)
userSchema.methods.incrementTokenVersion = function () {
  this.tokenVersion += 1;
  return this.save();
};

// 🧼 Hide sensitive data in JSON responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
