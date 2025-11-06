import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Layout } from '../components/Layout';
import { GlassCard } from '../components/GlassCard';
import { Mic, Square, CloudUpload } from 'lucide-react';
import API from "../api/axios";

export default function VoiceAnalytics() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<any[]>([]);

  // ✅ Start Recording
  const startRecording = async () => {
    setUploadStatus("");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "audio/wav" });


    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.start();
    setIsRecording(true);

    mediaRecorder.ondataavailable = (e: any) => {
      audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      setAudioURL(url);

      // Upload to backend
      const formData = new FormData();
      formData.append("file", blob, "recording.wav");

      uploadAudio(formData);
    };
  };

  // ✅ Stop Recording & Upload
  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  // ✅ Upload to backend API
  const uploadAudio = async (formData: FormData) => {
    try {
      setUploadStatus("Uploading...");
      const res = await API.post("/audio/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setUploadStatus(`✅ Saved at: ${res.data.fileUrl}`);
      console.log("Uploaded:", res.data);

    } catch (err) {
      console.error(err);
      setUploadStatus("❌ Upload failed");
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <h1 className="text-4xl">🎤 Voice Recorder</h1>

        <GlassCard className="p-10 flex flex-col items-center" glow>
          {!isRecording ? (
            <motion.button
              className="bg-[#3A7AFE] text-white w-28 h-28 rounded-full flex items-center justify-center text-4xl shadow-lg cursor-pointer"
              onClick={startRecording}
            >
              <Mic className="w-14 h-14" />
            </motion.button>
          ) : (
            <motion.button
              className="bg-[#FF3D57] text-white w-28 h-28 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
              onClick={stopRecording}
            >
              <Square className="w-14 h-14" />
            </motion.button>
          )}

          <p className="mt-4 text-lg text-gray-200">
            {isRecording ? "Recording..." : "Tap to Record"}
          </p>

          {/* ✅ Uploaded info */}
          {uploadStatus && (
            <p className="mt-4 text-sm text-green-400">{uploadStatus}</p>
          )}

          {/* ✅ Preview Audio */}
          {audioURL && (
            <audio
              controls
              src={audioURL}
              className="mt-4 w-full max-w-md"
            />
          )}
        </GlassCard>
      </div>
    </Layout>
  );
}
