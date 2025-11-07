import { useState, useRef, useEffect } from "react";
import { Mic, Square, Activity, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Layout } from "../components/Layout";
import { GlassCard } from "../components/GlassCard";
import API from "../api/axios";

interface AnalysisResult {
  stress_score?: number;
  fatigue_score?: number;
  recommendation?: string;
  error?: string;
}

export default function VoiceAnalytics() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<{ avgStress?: number; avgFatigue?: number }>({});

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 🎙 Start Recording
  const startRecording = async () => {
    setStatus("");
    setAudioURL(null);
    setResult(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus("⚠ Your browser does not support audio recording");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const formData = new FormData();
        formData.append("audio", blob, "recording.wav");

        try {
          setStatus("Uploading & analyzing...");
          setLoading(true);

          // POST directly to the readings analyze endpoint which forwards to ML
          const res = await API.post("/readings/analyze", formData);

          // readings.analyze returns { ok: true, data: reading }
          if (res.data && res.data.data) {
            const reading = res.data.data;
            // build a normalized result shape for the UI
            setResult({
              stress_score: reading.stress ?? reading.stress_score ?? null,
              fatigue_score: reading.fatigue ?? reading.fatigue_score ?? null,
              recommendation: reading.recommendation ?? reading.rec ?? "",
            });

            // Set audio URL if backend served uploads
            if (reading.fileUrl) setAudioURL(window.location.origin + reading.fileUrl);
            setStatus("✅ Analysis complete");
          } else {
            throw new Error("Invalid analysis response");
          }
        } catch (err) {
          console.error(err);
          setStatus("❌ Upload or analysis failed");
          setResult({ error: "Analysis failed" });
        } finally {
          setLoading(false);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setStatus("⚠ Cannot access microphone!");
      console.error(err);
    }
  };

  // ⏹ Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  // 📂 Handle Manual File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("Uploading selected file...");
    setResult(null);
    setLoading(true);
    setAudioURL(null);

    try {
      const formData = new FormData();
      formData.append("audio", file);

      // Directly POST to readings analyze endpoint with the file
      const res = await API.post("/readings/analyze", formData);
      if (res.data && res.data.data) {
        const reading = res.data.data;
        setResult({
          stress_score: reading.stress ?? reading.stress_score ?? null,
          fatigue_score: reading.fatigue ?? reading.fatigue_score ?? null,
          recommendation: reading.recommendation ?? reading.rec ?? "",
        });
        if (reading.fileUrl) setAudioURL(window.location.origin + reading.fileUrl);
        setStatus("✅ File uploaded and analyzed successfully!");
      } else {
        throw new Error("Invalid analysis response");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Upload or analysis failed");
      setResult({ error: "Analysis failed" });
    } finally {
      setLoading(false);
      if (e.target) e.target.value = "";
    }
  };


  // 🚀 Upload a preset file and analyze it
const uploadPresetFile = async () => {
  setStatus("Uploading preset file...");
  setResult(null);
  setLoading(true);
  setAudioURL(null);

  try {
    const response = await fetch("/sample-audio.wav"); // file must be in /public
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("audio", blob, "preset.wav");

    // Directly POST blob to readings analyze endpoint
    const res = await API.post("/readings/analyze", formData);
    if (res.data && res.data.data) {
      const reading = res.data.data;
      setResult({
        stress_score: reading.stress ?? reading.stress_score ?? null,
        fatigue_score: reading.fatigue ?? reading.fatigue_score ?? null,
        recommendation: reading.recommendation ?? reading.rec ?? "",
      });
      if (reading.fileUrl) setAudioURL(window.location.origin + reading.fileUrl);
      setStatus("✅ Preset file uploaded & analyzed!");
    } else {
      throw new Error("Invalid analysis response");
    }
  } catch (err) {
    console.error(err);
    setStatus("❌ Upload or analysis failed");
    setResult({ error: "Analysis failed" });
  } finally {
    setLoading(false);
  }
};

// Fetch history & compute simple stats
useEffect(() => {
  let mounted = true;
  const fetchHistory = async () => {
    try {
      const res = await API.get("/readings/history");
      if (!mounted) return;
      const rows = res.data || [];
      setHistory(rows);

      if (rows.length > 0) {
        const sumStress = rows.reduce((s: number, r: any) => s + (r.stress || 0), 0);
        const sumFatigue = rows.reduce((s: number, r: any) => s + (r.fatigue || 0), 0);
        setStats({ avgStress: +(sumStress / rows.length).toFixed(1), avgFatigue: +(sumFatigue / rows.length).toFixed(1) });
      } else {
        setStats({});
      }
    } catch (err) {
      console.warn("Could not fetch history:", err);
    }
  };

  fetchHistory();
  // refresh occasionally
  const t = setInterval(fetchHistory, 30_000);
  return () => {
    mounted = false;
    clearInterval(t);
  };
}, []);
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <h1 className="text-3xl font-semibold">🎙 Voice Analytics</h1>

        <GlassCard className="p-10 flex flex-col items-center">
          {!isRecording ? (
            <button
              className="bg-blue-600 text-white w-24 h-24 rounded-full flex items-center justify-center text-3xl"
              onClick={startRecording}
            >
              <Mic className="w-10 h-10" />
            </button>
          ) : (
            <button
              className="bg-red-500 text-white w-24 h-24 rounded-full flex items-center justify-center text-3xl"
              onClick={stopRecording}
            >
              <Square className="w-10 h-10" />
            </button>
          )}

          <p className="mt-4 text-lg">{isRecording ? "Recording..." : "Tap to Record"}</p>
          <p className="text-sm text-green-400 mt-2">{status}</p>

          {audioURL && (
            <audio controls src={audioURL} className="mt-4 w-full max-w-md" />
          )}

          {/* Manual File Upload */}
          <div className="mt-6 flex flex-col items-center">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="mb-2"
            />
            <p className="text-sm text-gray-400">Or upload an existing audio file</p>
          </div>
          <button
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            onClick={uploadPresetFile}
          >
            Upload Preset File & Analyze
          </button>

        </GlassCard>

        {/* Results */}
        {result && !loading && !result.error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <GlassCard>
              <h3 className="text-gray-400 mb-2 flex items-center gap-2">
                <Activity size={18} className="text-blue-400" />
                Stress Score
              </h3>
              <div className="text-4xl font-bold text-blue-400">
                {result.stress_score ?? "--"}
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-gray-400 mb-2 flex items-center gap-2">
                <AlertTriangle size={18} className="text-yellow-400" />
                Fatigue Score
              </h3>
              <div className="text-4xl font-bold text-yellow-400">
                {result.fatigue_score ?? "--"}
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-gray-400 mb-2">Recommendation</h3>
              <p className="text-green-400">
                {result.recommendation ?? "No recommendation available"}
              </p>
            </GlassCard>
          </motion.div>
        )}

        {/* History / Stats */}
        <div className="w-full max-w-4xl mt-6">
          <GlassCard className="p-4">
            <h3 className="text-gray-400 mb-2">Recent Statistics</h3>
            <div className="flex gap-6 items-center">
              <div>
                <div className="text-sm text-gray-500">Average Stress</div>
                <div className="text-2xl font-bold text-blue-400">{stats.avgStress ?? '--'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Average Fatigue</div>
                <div className="text-2xl font-bold text-yellow-400">{stats.avgFatigue ?? '--'}</div>
              </div>
              <div className="ml-auto text-sm text-gray-400">Total samples: {history.length}</div>
            </div>

            {history.length > 0 && (
              <div className="mt-4 text-sm text-gray-300">
                Latest: {history.slice(0,5).map(h=> `S:${h.stress ?? '-'} F:${h.fatigue ?? '-'} @ ${new Date(h.timestamp).toLocaleTimeString()}`).join(' | ')}
              </div>
            )}
          </GlassCard>
        </div>

        {result?.error && (
          <GlassCard className="text-center text-red-400">
            <p>❌ {result.error}</p>
          </GlassCard>
        )}
      </div>
    </Layout>
  );
}