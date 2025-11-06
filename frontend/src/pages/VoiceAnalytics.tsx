import { useState, useRef } from "react";
import { Layout } from "../components/Layout";
import { GlassCard } from "../components/GlassCard";
import { motion } from "framer-motion";
import { Mic, Square, Upload, Activity, AlertTriangle } from "lucide-react";
import { analyzeReading } from "../api/readings";
import RecordRTC from "recordrtc";

export default function VoiceAnalytics() {
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const recorderRef = useRef<any>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🎙 Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/wav",
        recorderType: RecordRTC.StereoAudioRecorder,
      });
      recorder.startRecording();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      alert("Please allow microphone access.");
      console.error(error);
    }
  };

  // 🛑 Stop recording
  const stopRecording = async () => {
    setLoading(true);
    recorderRef.current.stopRecording(async () => {
      const blob = recorderRef.current.getBlob();
      audioBlobRef.current = blob;
      setIsRecording(false);
      await sendAudio(blob);
    });
  };

  // 📤 Handle upload file
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.includes("audio")) {
      alert("Please upload a valid audio file (.wav or .webm)");
      return;
    }
    await sendAudio(file);
  };

  // 🔁 Send audio to backend
  const sendAudio = async (blob: Blob) => {
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("audio", blob, "voice.wav");
    formData.append("source", "web");

    try {
      const response = await analyzeReading(formData);
      setResult(response.data);
    } catch (err: any) {
      console.error("Error analyzing audio:", err);
      setResult({ error: "Analysis failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">🎤 Voice Analytics</h1>
        <p className="text-gray-400">
          Record or upload your voice to let AI detect stress & fatigue levels in real time.
        </p>

        <GlassCard className="text-center p-10 space-y-6">
          {/* Record / Stop Button */}
          <motion.button
            className={`${
              isRecording ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
            } text-white rounded-full p-10 shadow-lg transition`}
            onClick={isRecording ? stopRecording : startRecording}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isRecording ? <Square size={40} /> : <Mic size={40} />}
          </motion.button>

          <p className="text-lg">
            {isRecording ? "Recording... Speak naturally." : "Press to Start Recording"}
          </p>

          {/* Upload Button */}
          <div className="mt-4">
            <motion.button
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={20} /> Upload Audio File
            </motion.button>
            <input
              type="file"
              accept="audio/*"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {loading && <p className="text-gray-400 mt-2 animate-pulse">Analyzing audio...</p>}
        </GlassCard>

        {/* Results Section */}
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
                {result?.stress_score ?? "--"}
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-gray-400 mb-2 flex items-center gap-2">
                <AlertTriangle size={18} className="text-yellow-400" />
                Fatigue Score
              </h3>
              <div className="text-4xl font-bold text-yellow-400">
                {result?.fatigue_score ?? "--"}
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-gray-400 mb-2">Recommendation</h3>
              <p className="text-green-400">
                {result?.recommendation ?? "No recommendation available"}
              </p>
            </GlassCard>
          </motion.div>
        )}

        {/* Error State */}
        {result?.error && (
          <GlassCard className="text-center text-red-400">
            <p>❌ {result.error}</p>
          </GlassCard>
        )}
      </div>
    </Layout>
  );
}