const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const deviceSchema = new mongoose.Schema({
  name: String,
  type: String,
  status: { type: String, default: "disconnected" },
  battery: Number,
  lastSync: String,
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,

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

// Hash password
userSchema.methods.setPassword = async function (password) {
  this.passwordHash = await bcrypt.hash(password, 10);
};

// Verify password
userSchema.methods.verifyPassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);
