// routes/audio.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// ensure folder exists
const uploadDir = path.join(__dirname, "../uploads/audio");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// multer setup
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `audio_${Date.now()}.wav`);
  },
});

const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// ✅ Only handle upload for now
router.post("/upload", upload.single("audio"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No audio file received" });

  const fileUrl = `/uploads/audio/${req.file.filename}`;
  console.log("✅ Saved:", fileUrl);

  // optional: notify via socket
  const io = req.app.get("io");
  if (io) io.emit("new-audio", { fileUrl });

  res.json({
    success: true,
    message: "✅ Audio uploaded successfully",
    fileUrl,
  });
});

module.exports = router;