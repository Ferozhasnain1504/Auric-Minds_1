// routes/audio.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// make sure folder exists
const uploadDir = path.join(__dirname, "../uploads/audio");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// storage engine
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `audio_${Date.now()}.wav`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// ✅ handle file upload
router.post("/upload", upload.single("audio"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No audio file received" });

  const fileUrl = `/uploads/audio/${req.file.filename}`;
  console.log("✅ Saved:", fileUrl);

  // optional real-time emit
  const io = req.app.get("io");
  if (io) io.emit("new-audio", { fileUrl });

  res.json({
    success: true,
    message: "✅ Audio uploaded successfully",
    fileUrl,
  });
});

// (optional) keep analyze route stub if you’ll later call python
router.post("/analyze", async (req, res) => {
  try {
    const { filename } = req.body;
    const filepath = path.join(uploadDir, filename);
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: "Audio file not found" });
    }
    // placeholder “fake” ML result
    res.json({ stress: Math.floor(Math.random() * 100), fatigue: Math.floor(Math.random() * 100) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
