import { useState } from 'react';
import { motion } from 'motion/react';
import { Layout } from '../components/Layout';
import { GlassCard } from '../components/GlassCard';
import { Calendar, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area, Bar } from 'recharts';

const weeklyData = [
  { day: 'Mon', stress: 45, fatigue: 40, hr: 72, temp: 23 },
  { day: 'Tue', stress: 55, fatigue: 50, hr: 78, temp: 24 },
  { day: 'Wed', stress: 65, fatigue: 60, hr: 82, temp: 25 },
  { day: 'Thu', stress: 50, fatigue: 48, hr: 75, temp: 24 },
  { day: 'Fri', stress: 70, fatigue: 65, hr: 85, temp: 26 },
  { day: 'Sat', stress: 30, fatigue: 25, hr: 68, temp: 22 },
  { day: 'Sun', stress: 25, fatigue: 20, hr: 65, temp: 22 },
];

const monthlyData = [
  { week: 'Week 1', stress: 48, fatigue: 42 },
  { week: 'Week 2', stress: 55, fatigue: 50 },
  { week: 'Week 3', stress: 62, fatigue: 58 },
  { week: 'Week 4', stress: 45, fatigue: 40 },
];

const insights = [
  {
    icon: '⚡',
    title: 'Stress Peak Identified',
    description: 'Stress levels peaked at 3 PM last Wednesday. Consider scheduling breaks during this time.',
    color: '#FF3D57',
    trend: 'up',
  },
  {
    icon: '🌡️',
    title: 'Temperature Impact',
    description: 'Ambient heat increased fatigue by 14% on Friday. Optimal temperature is 22-24°C.',
    color: '#FFB300',
    trend: 'up',
  },
  {
    icon: '💓',
    title: 'Heart Rate Variability',
    description: 'Excellent recovery on weekend. Heart rate dropped to healthy baseline of 65 bpm.',
    color: '#00E676',
    trend: 'down',
  },
  {
    icon: '😌',
    title: 'Wellness Improvement',
    description: 'Overall wellness score improved by 18% compared to last week. Great progress!',
    color: '#3A7AFE',
    trend: 'down',
  },
];

export default function History() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl mb-2">History & Insights</h1>
            <p className="text-gray-400">Track your wellness trends over time</p>
          </div>

          <div className="flex gap-3">
            <motion.button
              className="glass-card rounded-2xl px-6 py-3 flex items-center gap-2 hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-5 h-5" />
              Export PDF
            </motion.button>
            <motion.button
              className="glass-card rounded-2xl px-6 py-3 flex items-center gap-2 hover:bg-white/10 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-5 h-5" />
              Export CSV
            </motion.button>
          </div>
        </div>

        {/* Time Range Selector */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-[#3A7AFE]" />
            <span className="text-gray-400">Select Time Range:</span>
            
            <div className="flex gap-2">
              {(['day', 'week', 'month'] as const).map((range) => (
                <motion.button
                  key={range}
                  className={`px-6 py-2 rounded-2xl capitalize transition-all ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-[#3A7AFE] to-[#B517FF] text-white'
                      : 'glass-card hover:bg-white/10'
                  }`}
                  onClick={() => setTimeRange(range)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {range}
                </motion.button>
              ))}
            </div>

            <div className="ml-auto text-sm text-gray-400">
              Viewing: <span className="text-white">Nov 1 - Nov 7, 2025</span>
            </div>
          </div>
        </GlassCard>

        {/* Main Charts */}
        <div className="grid grid-cols-1 gap-6">
          {/* Stress Trend */}
          <GlassCard>
            <h3 className="text-lg mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FF3D57] animate-pulse"></div>
              Stress Trend - {timeRange === 'week' ? 'Weekly' : timeRange === 'month' ? 'Monthly' : 'Daily'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={timeRange === 'week' ? weeklyData : monthlyData}>
                <defs>
                  <linearGradient id="stressAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3D57" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF3D57" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey={timeRange === 'week' ? 'day' : 'week'} stroke="#666" />
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
                  fill="url(#stressAreaGradient)"
                  stroke="none"
                />
                <Line
                  type="monotone"
                  dataKey="stress"
                  stroke="#FF3D57"
                  strokeWidth={3}
                  dot={{ fill: '#FF3D57', r: 5 }}
                  activeDot={{ r: 7 }}
                  animationDuration={1500}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Dual Axis Chart */}
          <GlassCard>
            <h3 className="text-lg mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FFB300] animate-pulse"></div>
              Fatigue vs Temperature Correlation
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis yAxisId="left" stroke="#666" />
                <YAxis yAxisId="right" orientation="right" stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(10, 14, 26, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="fatigue"
                  fill="#FFB300"
                  radius={[10, 10, 0, 0]}
                  animationDuration={1500}
                  opacity={0.8}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="temp"
                  stroke="#00E676"
                  strokeWidth={3}
                  dot={{ fill: '#00E676', r: 5 }}
                  animationDuration={1500}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#FFB300]"></div>
                <span className="text-gray-400">Fatigue Level</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#00E676]"></div>
                <span className="text-gray-400">Temperature (°C)</span>
              </div>
            </div>
          </GlassCard>

          {/* Heart Rate Trend */}
          {/* <GlassCard>
            <h3 className="text-lg mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#3A7AFE] animate-pulse"></div>
              Heart Rate Trend (Mi Band)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <defs>
                  <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3A7AFE" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#B517FF" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis stroke="#666" domain={[60, 90]} />
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
                  dataKey="hr"
                  stroke="url(#hrGradient)"
                  strokeWidth={3}
                  dot={{ fill: '#3A7AFE', r: 5 }}
                  activeDot={{ r: 7 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard> */}
        </div>

        {/* AI Insights Cards */}
        <div>
          <h2 className="text-2xl mb-4">AI-Generated Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard 
                  hover 
                  className="border-l-4" 
                  style={{ borderLeftColor: insight.color }}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{insight.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg">{insight.title}</h3>
                        {insight.trend === 'up' ? (
                          <TrendingUp className="w-5 h-5" style={{ color: insight.color }} />
                        ) : (
                          <TrendingDown className="w-5 h-5" style={{ color: insight.color }} />
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{insight.description}</p>
                      <div className="mt-3 flex gap-2">
                        <div 
                          className="px-3 py-1 rounded-full text-xs"
                          style={{ 
                            backgroundColor: `${insight.color}20`,
                            color: insight.color 
                          }}
                        >
                          AI Insight
                        </div>
                        <div className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400">
                          {timeRange === 'week' ? 'This Week' : 'This Month'}
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
