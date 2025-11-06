import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Layout } from '../components/Layout';
import { GlassCard } from '../components/GlassCard';
import { WellnessGauge } from '../components/WellnessGauge';
import { SensorCard } from '../components/SensorCard';
import { Volume2, Heart, Thermometer, Zap, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const stressData = [
  { time: '9:00', stress: 30, fatigue: 20 },
  { time: '10:00', stress: 45, fatigue: 35 },
  { time: '11:00', stress: 55, fatigue: 40 },
  { time: '12:00', stress: 40, fatigue: 45 },
  { time: '1:00', stress: 35, fatigue: 50 },
  { time: '2:00', stress: 60, fatigue: 55 },
  { time: '3:00', stress: 75, fatigue: 65 },
  { time: '4:00', stress: 50, fatigue: 60 },
  { time: '5:00', stress: 40, fatigue: 55 },
];

export default function Dashboard() {
  const [wellnessScore, setWellnessScore] = useState(72);
  const [stressScore, setStressScore] = useState(45);
  const [fatigueScore, setFatigueScore] = useState(38);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setWellnessScore(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 5)));
      setStressScore(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 3)));
      setFatigueScore(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 3)));
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const emotionalState = wellnessScore >= 70 ? { emoji: '😌', text: 'Calm', color: '#00E676' } :
                         wellnessScore >= 40 ? { emoji: '😐', text: 'Neutral', color: '#FFB300' } :
                         { emoji: '😰', text: 'Stressed', color: '#FF3D57' };

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
            animate={{ boxShadow: ['0 0 20px rgba(58, 122, 254, 0.3)', '0 0 30px rgba(181, 23, 255, 0.4)', '0 0 20px rgba(58, 122, 254, 0.3)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-3xl">{emotionalState.emoji}</div>
            <div>
              <div className="text-sm text-gray-400">Current State</div>
              <div className="text-lg" style={{ color: emotionalState.color }}>{emotionalState.text}</div>
            </div>
          </motion.div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wellness Gauge */}
          <GlassCard className="col-span-1 lg:col-span-1" glow>
            <WellnessGauge value={wellnessScore} />
          </GlassCard>

          {/* Score Cards */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-2 gap-6">
            <motion.div
              className="glass-card rounded-[20px] p-6 relative overflow-hidden"
              animate={{ scale: stressScore > 70 ? [1, 1.02, 1] : 1 }}
              transition={{ duration: 0.5, repeat: stressScore > 70 ? Infinity : 0 }}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-[#FF3D57] opacity-20 rounded-full blur-2xl ${stressScore > 70 ? 'animate-pulse-glow' : ''}`}></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400">Stress Level</span>
                  <Zap className="w-5 h-5 text-[#FF3D57]" />
                </div>
                <div className="text-5xl mb-2">{Math.round(stressScore)}</div>
                <div className="text-xs text-gray-400">Real-time score</div>
                <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#FF3D57] to-[#E91E63]"
                    initial={{ width: 0 }}
                    animate={{ width: `${stressScore}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="glass-card rounded-[20px] p-6 relative overflow-hidden"
              animate={{ scale: fatigueScore > 70 ? [1, 1.02, 1] : 1 }}
              transition={{ duration: 0.5, repeat: fatigueScore > 70 ? Infinity : 0 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFB300] opacity-20 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400">Fatigue Level</span>
                  <TrendingUp className="w-5 h-5 text-[#FFB300]" />
                </div>
                <div className="text-5xl mb-2">{Math.round(fatigueScore)}</div>
                <div className="text-xs text-gray-400">Real-time score</div>
                <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#FFB300] to-[#FF8F00]"
                    initial={{ width: 0 }}
                    animate={{ width: `${fatigueScore}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </motion.div>

            <div className="col-span-2 glass-card rounded-[20px] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#00E676] animate-pulse"></div>
                <span className="text-sm text-gray-400">Last Updated:</span>
                <span className="text-sm">{lastUpdate.toLocaleTimeString()}</span>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 rounded-full bg-[#00E676]/20 text-[#00E676] text-xs">AI Active</div>
                <div className="px-3 py-1 rounded-full bg-[#3A7AFE]/20 text-[#3A7AFE] text-xs">3 Sensors Online</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sensor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SensorCard
            icon={Volume2}
            title="Noise Level (INMP441)"
            value="68"
            unit="dB"
            status="normal"
            trend="stable"
          />
          <SensorCard
            icon={Heart}
            title="Heart Rate (Mi Band)"
            value="78"
            unit="bpm"
            status="normal"
            trend="up"
          />
          <SensorCard
            icon={Thermometer}
            title="Ambient Comfort (DHT22)"
            value="24°C"
            unit="72% RH"
            status="normal"
            trend="down"
          />
        </div>

        {/* Real-time Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard>
            <h3 className="text-lg mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#3A7AFE] animate-pulse"></div>
              Stress Trend (Today)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={stressData}>
                <defs>
                  <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3D57" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FF3D57" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10, 14, 26, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
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
            <h3 className="text-lg mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FFB300] animate-pulse"></div>
              Fatigue Trend (Today)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10, 14, 26, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="fatigue"
                  stroke="#FFB300"
                  strokeWidth={3}
                  dot={{ fill: '#FFB300', r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* AI Insights */}
        <GlassCard className="border-l-4 border-[#00E676]">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🤖</div>
            <div>
              <h3 className="text-lg mb-2 flex items-center gap-2">
                AI Health Insight
                <span className="px-2 py-1 rounded-full bg-[#00E676]/20 text-[#00E676] text-xs">New</span>
              </h3>
              <p className="text-gray-300">
                Your stress levels show a peak around 3 PM. Consider taking short breaks every 90 minutes 
                to maintain optimal wellness. Heart rate variability suggests good recovery.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
}
