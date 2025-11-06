import API from "./axios";

/**
 * ✅ Get recent readings
 */
export const getReadings = async (userId = null) => {
  const url = userId ? `/readings/history?userId=${userId}` : "/readings/history";
  const res = await API.get(url);
  return res.data;
};

/**
 * ✅ Analyze new audio + optional sensors
 * You can pass either:
 * - a File object (for quick upload)
 * - or a FormData (for manual sensor + audio fields)
 */
export const analyzeReading = async (formData) => {
  // Remove manual Content-Type
  const res = await API.post("/readings/analyze", formData);
  return res.data;
};
