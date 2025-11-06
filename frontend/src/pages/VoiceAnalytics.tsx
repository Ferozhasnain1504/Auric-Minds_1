import { useState } from 'react';
import { motion } from 'motion/react';
import { Layout } from '../components/Layout';
import { GlassCard } from '../components/GlassCard';
import { Mic, Play, Square, Volume2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';

const emotionData = [
  { emotion: 'Calm', value: 75, color: '#00E676' },
  { emotion: 'Happy', value: 60, color: '#FFB300' },
  { emotion: 'Nervous', value: 30, color: '#FF8F00' },
  { emotion: 'Angry', value: 15, color: '#FF3D57' },
  { emotion: 'Sad', value: 10, color: '#B517FF' },
];

const audioFeatures = [
  { feature: 'Pitch', value: 180, max: 300 },
  { feature: 'Volume', value: 65, max: 100 },
  { feature: 'Rate', value: 140, max: 200 },
  { feature: 'Clarity', value: 85, max: 100 },
  { feature: 'Tone', value: 72, max: 100 },
];

export default function VoiceAnalytics() {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setHasRecording(true);
    } else {
      setIsRecording(true);
      // Simulate waveform
      const interval = setInterval(() => {
        setWaveformData(prev => {
          const newData = [...prev, Math.random() * 100];
          return newData.slice(-50);
        });
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
      }, 5000);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl mb-2">Voice Analytics</h1>
          <p className="text-gray-400">AI-powered emotion detection from speech patterns</p>
        </div>

        {/* Recording Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="flex flex-col items-center justify-center p-12" glow>
            <motion.div
              className={`w-40 h-40 rounded-full flex items-center justify-center cursor-pointer relative ${
                isRecording ? 'bg-gradient-to-br from-[#FF3D57] to-[#E91E63]' : 'bg-gradient-to-br from-[#3A7AFE] to-[#B517FF]'
              }`}
              onClick={handleRecord}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={isRecording ? {
                boxShadow: [
                  '0 0 40px rgba(255, 61, 87, 0.6)',
                  '0 0 80px rgba(255, 61, 87, 0.8)',
                  '0 0 40px rgba(255, 61, 87, 0.6)',
                ],
              } : {}}
              transition={{ duration: 1.5, repeat: isRecording ? Infinity : 0 }}
            >
              {isRecording ? (
                <Square className="w-16 h-16" />
              ) : (
                <Mic className="w-16 h-16" />
              )}

              {isRecording && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute inset-0 rounded-full border-2 border-white/30"
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.6,
                      }}
                    />
                  ))}
                </>
              )}
            </motion.div>

            <motion.p
              className="mt-6 text-xl"
              animate={isRecording ? { opacity: [1, 0.5, 1] } : {}}
              transition={{ duration: 1.5, repeat: isRecording ? Infinity : 0 }}
            >
              {isRecording ? 'Recording...' : hasRecording ? 'Tap to Record Again' : 'Tap to Record'}
            </motion.p>

            {isRecording && (
              <motion.div
                className="mt-4 px-4 py-2 rounded-full bg-[#FF3D57]/20 text-[#FF3D57] text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                🔴 Live Recording
              </motion.div>
            )}
          </GlassCard>

          {/* Waveform Visualization */}
          <GlassCard className="p-6">
            <h3 className="text-lg mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-[#3A7AFE]" />
              Audio Waveform
            </h3>
            
            <div className="h-64 flex items-center justify-center gap-1">
              {isRecording || hasRecording ? (
                waveformData.map((height, i) => (
                  <motion.div
                    key={i}
                    className="w-2 bg-gradient-to-t from-[#3A7AFE] to-[#B517FF] rounded-full"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.1 }}
                  />
                ))
              ) : (
                <div className="text-gray-500">Start recording to see waveform</div>
              )}
            </div>

            {hasRecording && !isRecording && (
              <motion.button
                className="w-full mt-4 glass-card rounded-2xl py-3 flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Play className="w-5 h-5" />
                Play Recording
              </motion.button>
            )}
          </GlassCard>
        </div>

        {/* Emotion Detection */}
        {hasRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard>
              <h3 className="text-lg mb-6">Emotion Detection Results</h3>
              
              <div className="grid grid-cols-5 gap-4 mb-6">
                {emotionData.map((emotion, i) => (
                  <motion.div
                    key={emotion.emotion}
                    className="glass-card rounded-2xl p-4 text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-3xl mb-2">
                      {emotion.emotion === 'Calm' && '😌'}
                      {emotion.emotion === 'Happy' && '😊'}
                      {emotion.emotion === 'Nervous' && '😰'}
                      {emotion.emotion === 'Angry' && '😠'}
                      {emotion.emotion === 'Sad' && '😢'}
                    </div>
                    <div className="text-sm text-gray-400 mb-2">{emotion.emotion}</div>
                    <div className="text-2xl" style={{ color: emotion.color }}>{emotion.value}%</div>
                    <div className="mt-2 h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: emotion.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${emotion.value}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Audio Features */}
                <div>
                  <h4 className="text-sm text-gray-400 mb-4">Audio Features Analysis</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={audioFeatures}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="feature" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(10, 14, 26, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          backdropFilter: 'blur(10px)',
                        }}
                      />
                      <Bar dataKey="value" fill="url(#barGradient)" radius={[10, 10, 0, 0]} animationDuration={1500} />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3A7AFE" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#B517FF" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Emotional Profile */}
                <div>
                  <h4 className="text-sm text-gray-400 mb-4">Emotional Profile</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={emotionData}>
                      <PolarGrid stroke="rgba(255,255,255,0.1)" />
                      <PolarAngleAxis dataKey="emotion" stroke="#666" />
                      <Radar
                        name="Emotion"
                        dataKey="value"
                        stroke="#3A7AFE"
                        fill="#3A7AFE"
                        fillOpacity={0.5}
                        animationDuration={1500}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* AI Insights */}
        {hasRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <GlassCard className="border-l-4 border-[#00E676]">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🎯</div>
                <div>
                  <h3 className="text-lg mb-2">Voice Analysis Summary</h3>
                  <div className="space-y-2 text-gray-300">
                    <p>• Primary emotion detected: <span className="text-[#00E676]">Calm (75%)</span></p>
                    <p>• Speaking rate: <span className="text-[#FFB300]">140 words/min</span> - Normal range</p>
                    <p>• Voice clarity: <span className="text-[#00E676]">85%</span> - Excellent</p>
                    <p>• Stress indicators: <span className="text-[#00E676]">Low</span> - No immediate concerns</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
