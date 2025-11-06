// utils/forwardToMl.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

/**
 * Forwards an audio file + optional sensor data to the ML microservice.
 * @param {string} filePath - path to the temp audio file
 * @param {Object} sensors - optional sensor data
 * @param {string} mlUrl - full URL of ML service endpoint (e.g., http://localhost:5001/analyze)
 * @returns {Promise<Object>} ML service response JSON
 */
async function forwardToMl(filePath, sensors = {}, mlUrl) {
  if (!mlUrl) throw new Error("ML_SERVICE_URL not defined in .env");

  const form = new FormData();
  form.append('audio', fs.createReadStream(filePath));

  // Append valid numeric sensor fields
  Object.entries(sensors).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '' && !Number.isNaN(val)) {
      form.append(key, val);
    }
  });

  try {
    const resp = await axios.post(mlUrl, form, {
      headers: form.getHeaders(),
      timeout: 30000, // 30 seconds
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (resp.status !== 200) {
      throw new Error(`ML service returned HTTP ${resp.status}`);
    }

    return resp.data; // expected: { ok, stress_score, fatigue_score, recommendation }
  } catch (err) {
    console.error('❌ Error forwarding to ML service:', err.message);
    throw new Error(`ML service error: ${err.message}`);
  }
}

module.exports = forwardToMl;
