// routes/readings.js
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Reading = require("../models/Reading");
const forwardToMl = require("../utils/forwardToMl");
const axios = require('axios');

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
    // Map ML returned flat 16-dim vector (if present) into Reading.schema shape
    let featuresObj = {};
    const mlFeatures = Array.isArray(mlResult.features)
      ? mlResult.features
      : Array.isArray(mlResult.features_received)
      ? mlResult.features_received
      : null;

    if (mlFeatures && mlFeatures.length === 16) {
      featuresObj = {
        mfccs: mlFeatures.slice(0, 13),
        rms: mlFeatures[13],
        zcr: mlFeatures[14],
        avg_pitch: mlFeatures[15],
      };
    } else if (mlResult.features && typeof mlResult.features === 'object') {
      // if ML returned a features object already, use it
      featuresObj = mlResult.features;
    }

    const reading = new Reading({
    userId:
      req.body.userId && req.body.userId.match(/^[0-9a-fA-F]{24}$/)
        ? req.body.userId
        : null,
    source: req.body.source || "web",
    // ML service returns 'vsd_risk_score' (higher=calm), map to stress accordingly
    stress: mlResult.vsd_risk_score ?? mlResult.stress_score ?? mlResult.stress ?? 0,
    fatigue: mlResult.fatigue_score ?? mlResult.fatigue ?? 0,
    recommendation: mlResult.recommendation || mlResult.rec || "",
  features: featuresObj,
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

// ---------------------------
// POST /api/readings/features
// Accepts a JSON body with a precomputed feature vector and optional sensors
// Example:
// {
//   device_id: '48:E7:29:98:8F:64',
//   timestamp: 123456,
//   features: [0.47, -0.69, ...]  // length must be 16
//   noise_db: 55.3,
//   temperature: 24.5,
// }
// This endpoint will forward the features to the ML microservice predict_features
// endpoint, save a Reading document, and return the saved reading.
router.post('/features', express.json(), async (req, res) => {
  try {
    const body = req.body || {};
    const features = body.features;

    if (!features || !Array.isArray(features)) {
      return res.status(400).json({ error: 'features array is required' });
    }
    if (features.length !== 16) {
      return res.status(400).json({ error: 'features array must have length 16' });
    }

    // Optional sensor fields
    const sensors = {
      noise_db: body.noise_db !== undefined ? Number(body.noise_db) : undefined,
      light: body.light !== undefined ? Number(body.light) : undefined,
      temperature: body.temperature !== undefined ? Number(body.temperature) : undefined,
      humidity: body.humidity !== undefined ? Number(body.humidity) : undefined,
      hr: body.hr !== undefined ? Number(body.hr) : undefined,
    };

    // Determine ML features endpoint URL
    // Prefer explicit ML_FEATURES_URL env var; otherwise try to derive from ML_SERVICE_URL
    let mlFeaturesUrl = process.env.ML_FEATURES_URL;
    if (!mlFeaturesUrl) {
      const mlService = process.env.ML_SERVICE_URL || '';
      // if ML_SERVICE_URL ends with /analyze, replace with /predict_features
      if (mlService.endsWith('/analyze')) {
        mlFeaturesUrl = mlService.replace(/\/analyze$/, '') + '/predict_features';
      } else if (mlService) {
        // append path
        mlFeaturesUrl = mlService.replace(/\/$/, '') + '/predict_features';
      }
    }

    if (!mlFeaturesUrl) {
      return res.status(500).json({ error: 'ML features URL not configured (set ML_FEATURES_URL or ML_SERVICE_URL)' });
    }

    // Forward to ML service
    const payload = {
      device_id: body.device_id || null,
      timestamp: body.timestamp || Date.now(),
      features,
      sensors,
    };

    const mlResp = await axios.post(mlFeaturesUrl, payload, { timeout: 30000 });
    if (!mlResp || !mlResp.data) {
      throw new Error('Invalid ML response');
    }

    const mlResult = mlResp.data;

    // Build features object from submitted feature vector
    const featuresObj = {
      mfccs: features.slice(0, 13),
      rms: features[13],
      zcr: features[14],
      avg_pitch: features[15],
    };

    // Build reading document (store features and ML outputs)
    const reading = new Reading({
      userId:
        body.userId && body.userId.match(/^[0-9a-fA-F]{24}$/)
          ? body.userId
          : null,
      source: body.source || 'device',
      stress: mlResult.vsd_risk_score ?? mlResult.stress_score ?? 0,
      fatigue: mlResult.fatigue_score ?? mlResult.fatigue ?? 0,
      recommendation: mlResult.recommendation || '',
      features: featuresObj,
      emotion: mlResult.emotion || null,
      sensors,
      timestamp: new Date(),
    });

    await reading.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) io.emit('new_reading', reading);

    res.json({ ok: true, data: reading, ml: mlResult });
  } catch (err) {
    console.error('/features error:', err.response?.data || err.message || err);
    res.status(500).json({ error: 'Feature prediction failed', detail: err.message || err });
  }
});

