// routes/readings.js
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Reading = require("../models/Reading");
const forwardToMl = require("../utils/forwardToMl");

const upload = multer({ dest: "temp/" });
const router = express.Router();

// ---------------------------
// POST /api/readings/analyze
// ---------------------------
router.post("/analyze", upload.single("audio"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No audio file uploaded" });

  try {
    // Optional sensors from form-data
    const sensors = {
      noise_db: req.body.noise_db && Number(req.body.noise_db),
      light: req.body.light && Number(req.body.light),
      temperature: req.body.temperature && Number(req.body.temperature),
      humidity: req.body.humidity && Number(req.body.humidity),
      hr: req.body.hr && Number(req.body.hr),
    };

    // Forward file to ML microservice
    const mlUrl = process.env.ML_SERVICE_URL;
    const mlResult = await forwardToMl(path.resolve(file.path), sensors, mlUrl);

    // Build reading document
    const reading = new Reading({
    userId:
      req.body.userId && req.body.userId.match(/^[0-9a-fA-F]{24}$/)
        ? req.body.userId
        : null,
    source: req.body.source || "web",
    stress: mlResult.stress_score ?? mlResult.stress ?? 0,
    fatigue: mlResult.fatigue_score ?? mlResult.fatigue ?? 0,
    recommendation: mlResult.recommendation || mlResult.rec || "",
    features: mlResult.features || {},
    emotion: mlResult.emotion || null,
    sensors,
    timestamp: new Date(),
  });

    await reading.save();

    // Emit socket.io events
    const io = req.app.get("io");
    if (io) {
      io.emit("new_reading", reading);
      // Bonus: send an alert if stress exceeds 80
      if (reading.stress >= 80) {
        io.emit("alert", {
          userId: reading.userId,
          severity: "high",
          stress: reading.stress,
          fatigue: reading.fatigue,
          timestamp: reading.timestamp,
        });
      }
    }

    // Cleanup temp file
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    // Respond
    res.json({ ok: true, data: reading });
  } catch (err) {
    console.error("❌ /analyze error:", err.message);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: `Analysis failed: ${err.message}` });
  }
});

// ---------------------------
// GET /api/readings/history
// ---------------------------
router.get("/history", async (req, res) => {
  try {
    const q = req.query.userId ? { userId: req.query.userId } : {};
    const rows = await Reading.find(q).sort({ timestamp: -1 }).limit(200);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
