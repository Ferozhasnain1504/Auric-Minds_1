// utils/forwardToMl.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function forwardToMl(filePath, sensors = {}, mlUrl){
  const form = new FormData();
  form.append('audio', fs.createReadStream(filePath));
  // append sensor numeric fields if present
  if (sensors.noise_db) form.append('noise_db', sensors.noise_db);
  if (sensors.light) form.append('light', sensors.light);
  if (sensors.temperature) form.append('temperature', sensors.temperature);
  if (sensors.humidity) form.append('humidity', sensors.humidity);
  if (sensors.hr) form.append('hr', sensors.hr);

  const resp = await axios.post(mlUrl, form, { headers: form.getHeaders(), timeout: 30000 });
  return resp.data; // expect { stress_score, fatigue_score, recommendation }
}

module.exports = forwardToMl;
