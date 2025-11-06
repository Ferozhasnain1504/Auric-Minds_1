// src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import { getReadings, analyzeReading } from "../api/readings";
import { Layout } from "../components/Layout";
import { GlassCard } from "../components/GlassCard";
import { WellnessGauge } from "../components/WellnessGauge";
import { SensorCard } from "../components/SensorCard";
import { Volume2, Heart, Thermometer, Zap, TrendingUp, UploadCloud } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";

// ✅ Connect to backend socket
const socket = io("http://localhost:4000", { transports: ["websocket"] });

export default function Dashboard() {
  const [readings, setReadings] = useState([]);
  const [stress, setStress] = useState(0);
  const [fatigue, setFatigue] = useState(0);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [uploading, setUploading] = useState(false);

  // ✅ Load initial data
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getReadings();
        setReadings(data);
        if (data.length > 0) {
          const latest = data[0];
          setStress(latest.stress || 0);
          setFatigue(latest.fatigue || 0);
        }
      } catch (err) {
        console.error("Error loading readings:", err);
      }
    };
    load();
  }, []);

  // ✅ Handle real-time updates via Socket.io
  useEffect(() => {
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("new_reading", (reading) => {
      setReadings((prev) => [reading, ...prev.slice(0, 20)]);
      setStress(reading.stress || 0);
      setFatigue(reading.fatigue || 0);
      setLastUpdate(new Date());
    });
  }, []);

  // ✅ Format chart data (latest 10)
  const chartData = readings
    .slice(0, 10)
    .reverse()
    .map((r) => ({
      time: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      stress: r.stress,
      fatigue: r.fatigue,
    }));

  const wellnessScore = 100 - (stress + fatigue) / 2;

  const emotionalState =
    wellnessScore >= 70
      ? { emoji: "😌", text: "Calm", color: "#00E676" }
      : wellnessScore >= 40
      ? { emoji: "😐", text: "Neutral", color: "#FFB300" }
      : { emoji: "😰", text: "Stressed", color: "#FF3D57" };

  // ✅ Handle audio upload
  const handleAudioUpload = async (file: File) => {
    try {
      setUploading(true);
      alert("⏳ Uploading and analyzing audio...");
      const result = await analyzeReading(file);

      const stressVal = result.data?.stress || result.stress_score || 0;
      const fatigueVal = result.data?.fatigue || result.fatigue_score || 0;
      const recommendation = result.data?.recommendation || result.recommendation || "";

      alert(
        `✅ Analysis Complete!\nStress: ${Math.round(stressVal)}\nFatigue: ${Math.round(
          fatigueVal
        )}\n\n${recommendation}`
      );
    } catch (err) {
      console.error(err);
      alert("❌ Failed to analyze audio. Check ML service logs.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl mb-2">Wellness Dashboard</h1>
            <p className="text-gray-400">Real-time health monitoring & AI insights</p>
          </div>
          <motion.div
            className="glass-card rounded-2xl px-6 py-3 flex items-center gap-3"
            animate={{
              boxShadow: [
                "0 0 20px rgba(58, 122, 254, 0.3)",
                "0 0 30px rgba(181, 23, 255, 0.4)",
                "0 0 20px rgba(58, 122, 254, 0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-3xl">{emotionalState.emoji}</div>
            <div>
              <div className="text-sm text-gray-400">Current State</div>
              <div className="text-lg" style={{ color: emotionalState.color }}>
                {emotionalState.text}
              </div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connected ? "bg-green-400" : "bg-red-500"
                  }`}
                ></div>
                {connected ? "Live Connected" : "Disconnected"}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="col-span-1 lg:col-span-1" glow>
            <WellnessGauge value={wellnessScore} />
          </GlassCard>

          {/* Stress + Fatigue Cards */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Stress Level</span>
                <Zap className="w-5 h-5 text-[#FF3D57]" />
              </div>
              <div className="text-5xl mb-2">{Math.round(stress)}</div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#FF3D57] to-[#E91E63]"
                  initial={{ width: 0 }}
                  animate={{ width: `${stress}%` }}
                />
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Fatigue Level</span>
                <TrendingUp className="w-5 h-5 text-[#FFB300]" />
              </div>
              <div className="text-5xl mb-2">{Math.round(fatigue)}</div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#FFB300] to-[#FF8F00]"
                  initial={{ width: 0 }}
                  animate={{ width: `${fatigue}%` }}
                />
              </div>
            </GlassCard>

            <GlassCard className="col-span-2 p-4 flex justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#00E676] animate-pulse"></div>
                <span className="text-sm text-gray-400">Last Updated:</span>
                <span className="text-sm">{lastUpdate.toLocaleTimeString()}</span>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Real-time Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard>
            <h3 className="text-lg mb-4">Stress Trend (Recent)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3D57" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#FF3D57" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(10,14,26,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    backdropFilter: "blur(10px)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="stress"
                  stroke="#FF3D57"
                  strokeWidth={3}
                  fill="url(#stressGradient)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg mb-4">Fatigue Trend (Recent)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(10,14,26,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    backdropFilter: "blur(10px)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="fatigue"
                  stroke="#FFB300"
                  strokeWidth={3}
                  dot={{ fill: "#FFB300", r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* 🎤 Upload / Analyze Voice Section */}
        <GlassCard className="p-6 mt-8">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <UploadCloud className="text-[#3A7AFE]" size={22} />
            Analyze New Voice Sample
          </h3>

          <p className="text-gray-400 text-sm mb-4">
            Upload a voice sample (.wav or .webm) to get real-time stress & fatigue predictions.
          </p>

          <input
            type="file"
            accept=".wav,.webm,audio/*"
            id="audio-upload"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAudioUpload(file);
            }}
          />

          <label
            htmlFor="audio-upload"
            className={`cursor-pointer px-4 py-2 rounded-lg text-white font-semibold ${
              uploading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 transition-all"
            }`}
          >
            {uploading ? "Analyzing..." : "Upload Audio File"}
          </label>
        </GlassCard>
      </div>
    </Layout>
  );
}
