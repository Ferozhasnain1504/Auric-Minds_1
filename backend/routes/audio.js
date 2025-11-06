    const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "./uploads/audio",
  filename: (req, file, cb) => {
    const name = `audio_${Date.now()}.wav`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ error: "No audio file received" });

  res.json({
    message: "✅ Audio uploaded",
    filename: req.file.filename,
    fileUrl: `/uploads/audio/${req.file.filename}`,
  });
});
// after your upload route
const fs = require("fs");
const { exec } = require("child_process");

router.post("/analyze", async (req, res) => {
  try {
    const { filename } = req.body;
    const filepath = path.join(__dirname, "../uploads/audio/", filename);

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: "Audio file not found" });
    }

    // 🧠 Call your ML model (temporary dummy for now)
    exec(`python3 ml/voice_predict.py "${filepath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error("ML Error:", stderr);
        return res.status(500).json({ error: "AI processing failed" });
      }

      try {
        const result = JSON.parse(stdout);
        res.json(result);
      } catch (parseErr) {
        console.error("Parse error:", parseErr);
        res.status(500).json({ error: "Invalid ML output" });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
