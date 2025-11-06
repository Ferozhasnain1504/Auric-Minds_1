// utils/forwardToMl.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

/**
 * Forwards an audio file + optional sensor data to the ML microservice.
 * @param {string} filePath - Path to temp audio file.
 * @param {Object} sensors - Optional sensor readings.
 * @param {string} mlUrl - Full ML service endpoint URL.
 * @returns {Promise<Object>} ML service JSON response.
 */
async function forwardToMl(filePath, sensors = {}, mlUrl) {
  if (!mlUrl) throw new Error('❌ ML_SERVICE_URL not defined in .env');

  const form = new FormData();
  form.append('audio', fs.createReadStream(filePath));

  // Append only valid numeric sensor fields
  Object.entries(sensors).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '' && !Number.isNaN(val)) {
      form.append(key, val);
    }
  });

  try {
    console.log(`🔁 Sending audio to ML service: ${mlUrl}`);

    const resp = await axios.post(mlUrl, form, {
      headers: form.getHeaders(),
      timeout: 45000, // slightly longer for large audio
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    if (resp.status !== 200 || !resp.data) {
      throw new Error(`ML service returned invalid response: ${resp.status}`);
    }

    console.log('✅ ML service response received.');
    return resp.data; // expected: { ok, features, stress_score, fatigue_score, recommendation }
  } catch (err) {
    console.error('❌ Error in forwardToMl:', err.response?.data || err.message);
    throw new Error(`ML service error: ${err.message}`);
  }
}

module.exports = forwardToMl;
