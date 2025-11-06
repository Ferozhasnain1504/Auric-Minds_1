import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "../components/Layout";
import { GlassCard } from "../components/GlassCard";
import { WellnessGauge } from "../components/WellnessGauge";
import { SensorCard } from "../components/SensorCard";
import { Volume2, Heart, Thermometer, Zap, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import API from "../api/axios";
import io from "socket.io-client";

const socket = io("http://localhost:4000"); // ✅ Connect to backend’s Socket.io

export default function Dashboard() {
  const [stressScore, setStressScore] = useState(0);
  const [fatigueScore, setFatigueScore] = useState(0);
  const [wellnessScore, setWellnessScore] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [stressData, setStressData] = useState<{ time: string; stress: number; fatigue: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch history from backend
  const fetchReadings = async () => {
    try {
      const res = await API.get("/readings/history");
      const data = res.data.slice(-20).map((r: any) => ({
        time: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        stress: r.stress,
        fatigue: r.fatigue,
      }));
      setStressData(data);
      if (data.length) {
        const latest = data[data.length - 1];
        setStressScore(latest.stress);
        setFatigueScore(latest.fatigue);
        setWellnessScore(100 - (latest.stress + latest.fatigue) / 2);
        setLastUpdate(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("❌ Failed to fetch readings:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Realtime update via Socket.io
  useEffect(() => {
    fetchReadings();
    socket.on("new_reading", (reading: any) => {
      console.log("📡 New Reading Received:", reading);
      setStressScore(reading.stress);
      setFatigueScore(reading.fatigue);
      setWellnessScore(100 - (reading.stress + reading.fatigue) / 2);
      setLastUpdate(new Date(reading.timestamp).toLocaleTimeString());
      setStressData((prev) => [
        ...prev.slice(-19),
        { time: new Date(reading.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), stress: reading.stress, fatigue: reading.fatigue },
      ]);
    });
    return () => {
      socket.off("new_reading");
    };
  }, []);

  const emotionalState =
    wellnessScore >= 70
      ? { emoji: "😌", text: "Calm", color: "#00E676" }
      : wellnessScore >= 40
      ? { emoji: "😐", text: "Neutral", color: "#FFB300" }
      : { emoji: "😰", text: "Stressed", color: "#FF3D57" };

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
            </div>
          </motion.div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wellness Gauge */}
          <GlassCard glow>
            <WellnessGauge value={wellnessScore} />
          </GlassCard>

          {/* Score Cards */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-2 gap-6">
            {/* Stress */}
            <GlassCard>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Stress Level</span>
                <Zap className="w-5 h-5 text-[#FF3D57]" />
              </div>
              <div className="text-5xl font-bold">{Math.round(stressScore)}</div>
              <motion.div
                className="h-2 bg-gradient-to-r from-[#FF3D57] to-[#E91E63] rounded-full"
                animate={{ width: `${stressScore}%` }}
                transition={{ duration: 0.8 }}
              />
            </GlassCard>

            {/* Fatigue */}
            <GlassCard>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Fatigue Level</span>
                <TrendingUp className="w-5 h-5 text-[#FFB300]" />
              </div>
              <div className="text-5xl font-bold">{Math.round(fatigueScore)}</div>
              <motion.div
                className="h-2 bg-gradient-to-r from-[#FFB300] to-[#FF8F00] rounded-full"
                animate={{ width: `${fatigueScore}%` }}
                transition={{ duration: 0.8 }}
              />
            </GlassCard>

            {/* Status */}
            <div className="col-span-2 glass-card rounded-[20px] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#00E676] animate-pulse"></div>
                <span className="text-sm text-gray-400">Last Updated:</span>
                <span className="text-sm">{lastUpdate}</span>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 rounded-full bg-[#00E676]/20 text-[#00E676] text-xs">AI Active</div>
                <div className="px-3 py-1 rounded-full bg-[#3A7AFE]/20 text-[#3A7AFE] text-xs">Live Sensors</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sensor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SensorCard icon={Volume2} title="Noise Level (INMP441)" value="68" unit="dB" status="normal" trend="stable" />
          <SensorCard icon={Heart} title="Heart Rate (Mi Band)" value="78" unit="bpm" status="normal" trend="up" />
          <SensorCard icon={Thermometer} title="Ambient Comfort (DHT22)" value="24°C" unit="72% RH" status="normal" trend="down" />
        </div>

        {/* Real-time Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard>
            <h3 className="text-lg mb-4">Stress Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={stressData}>
                <defs>
                  <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3D57" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#FF3D57" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: "rgba(10,14,26,0.9)", borderRadius: "10px" }} />
                <Area type="monotone" dataKey="stress" stroke="#FF3D57" fill="url(#stressGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <h3 className="text-lg mb-4">Fatigue Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: "rgba(10,14,26,0.9)", borderRadius: "10px" }} />
                <Line type="monotone" dataKey="fatigue" stroke="#FFB300" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* AI Insight */}
        <GlassCard>
          <div className="flex items-start gap-4">
            <div className="text-3xl">🤖</div>
            <div>
              <h3 className="text-lg mb-2">AI Health Insight</h3>
              <p className="text-gray-300">
                Your latest stress level is {Math.round(stressScore)}. Consider hydration and 2-minute deep breathing to maintain calm.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
}
