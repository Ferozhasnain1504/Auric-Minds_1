import { useState, useRef } from "react";
import { Mic, Square } from "lucide-react";
import { Layout } from "../components/Layout";
import { GlassCard } from "../components/GlassCard";
import API from "../api/axios";

export default function VoiceAnalytics() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setStatus("");
    setAudioURL(null);

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
          setStatus("Uploading...");
          const res = await API.post("/audio/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          setAudioURL("http://localhost:5000" + res.data.fileUrl);
          setStatus("✅ Uploaded successfully!");
        } catch (err) {
          console.error(err);
          setStatus("❌ Upload failed");
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setStatus("⚠️ Cannot access microphone!");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <h1 className="text-3xl font-semibold">🎙️ Voice Recorder</h1>

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