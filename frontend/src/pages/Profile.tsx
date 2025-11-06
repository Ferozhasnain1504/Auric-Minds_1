import { useState } from 'react';
import { motion } from 'motion/react';
import { Layout } from '../components/Layout';
import { GlassCard } from '../components/GlassCard';
import { User, Mail, Phone, MapPin, Camera, Check, Watch, Wifi, WifiOff, Bell, Moon, Sun } from 'lucide-react';

export default function Profile() {
  const [stressAlertLevel, setStressAlertLevel] = useState(75);
  const [fatigueAlertLevel, setFatigueAlertLevel] = useState(70);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const devices = [
    { name: 'Mi Band 6', status: 'connected', battery: 78, lastSync: '2 min ago', icon: Watch },
    { name: 'ESP32 Sensors', status: 'connecting', battery: null, lastSync: '5 min ago', icon: Wifi },
    { name: 'INMP441 Microphone', status: 'connected', battery: null, lastSync: '1 min ago', icon: Wifi },
    { name: 'DHT22 Sensor', status: 'connected', battery: null, lastSync: '1 min ago', icon: Wifi },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl mb-2">Profile & Settings</h1>
          <p className="text-gray-400">Manage your account and device connections</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <GlassCard className="lg:col-span-1" glow>
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <motion.div
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-[#3A7AFE] to-[#B517FF] flex items-center justify-center text-4xl overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                >
                  <User className="w-16 h-16" />
                </motion.div>
                <motion.button
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#00E676] flex items-center justify-center cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Camera className="w-5 h-5" />
                </motion.button>
              </div>

              <h2 className="text-2xl mb-1">Sarah Johnson</h2>
              <p className="text-gray-400 mb-6">Premium Member</p>

              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail className="w-5 h-5 text-[#3A7AFE]" />
                  <span className="text-sm">sarah.j@company.com</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="w-5 h-5 text-[#3A7AFE]" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="w-5 h-5 text-[#3A7AFE]" />
                  <span className="text-sm">San Francisco, CA</span>
                </div>
              </div>

              <motion.button
                className="w-full mt-6 py-3 rounded-2xl bg-gradient-to-r from-[#3A7AFE] to-[#B517FF] hover:opacity-90"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Edit Profile
              </motion.button>
            </div>
          </GlassCard>

          {/* Settings and Devices */}
          <div className="lg:col-span-2 space-y-6">
            {/* Device Connections */}
            <GlassCard>
              <h3 className="text-lg mb-4">Device Connections</h3>
              <div className="space-y-3">
                {devices.map((device, i) => (
                  <motion.div
                    key={i}
                    className="glass-card rounded-2xl p-4 flex items-center justify-between"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        device.status === 'connected' 
                          ? 'bg-[#00E676]/20' 
                          : 'bg-[#FFB300]/20'
                      }`}>
                        <device.icon className={`w-6 h-6 ${
                          device.status === 'connected' 
                            ? 'text-[#00E676]' 
                            : 'text-[#FFB300]'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span>{device.name}</span>
                          {device.status === 'connected' ? (
                            <Check className="w-4 h-4 text-[#00E676]" />
                          ) : (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            >
                              <WifiOff className="w-4 h-4 text-[#FFB300]" />
                            </motion.div>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          Last sync: {device.lastSync}
                          {device.battery && ` • Battery: ${device.battery}%`}
                        </div>
                      </div>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-xs ${
                      device.status === 'connected'
                        ? 'bg-[#00E676]/20 text-[#00E676]'
                        : 'bg-[#FFB300]/20 text-[#FFB300]'
                    }`}>
                      {device.status === 'connected' ? '✅ Connected' : '⚠ Connecting...'}
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.button
                className="w-full mt-4 py-3 rounded-2xl glass-card hover:bg-white/10 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                + Add New Device
              </motion.button>
            </GlassCard>

            {/* Alert Thresholds */}
            <GlassCard>
              <h3 className="text-lg mb-6">Alert Thresholds</h3>
              
              <div className="space-y-6">
                {/* Stress Alert */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm">Stress Alert Level</span>
                      <p className="text-xs text-gray-400">Alert when stress exceeds this value</p>
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-[#FF3D57]/20 text-[#FF3D57]">
                      {stressAlertLevel}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stressAlertLevel}
                    onChange={(e) => setStressAlertLevel(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #FF3D57 0%, #FF3D57 ${stressAlertLevel}%, rgba(255,255,255,0.1) ${stressAlertLevel}%, rgba(255,255,255,0.1) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Fatigue Alert */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm">Fatigue Alert Level</span>
                      <p className="text-xs text-gray-400">Alert when fatigue exceeds this value</p>
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-[#FFB300]/20 text-[#FFB300]">
                      {fatigueAlertLevel}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={fatigueAlertLevel}
                    onChange={(e) => setFatigueAlertLevel(Number(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #FFB300 0%, #FFB300 ${fatigueAlertLevel}%, rgba(255,255,255,0.1) ${fatigueAlertLevel}%, rgba(255,255,255,0.1) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Preferences */}
            <GlassCard>
              <h3 className="text-lg mb-6">Preferences</h3>
              
              <div className="space-y-4">
                {/* Notifications Toggle */}
                <div className="flex items-center justify-between glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#3A7AFE]/20 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-[#3A7AFE]" />
                    </div>
                    <div>
                      <div className="text-sm">Push Notifications</div>
                      <div className="text-xs text-gray-400">Receive real-time alerts</div>
                    </div>
                  </div>
                  <motion.button
                    className={`w-14 h-8 rounded-full p-1 transition-colors ${
                      notifications ? 'bg-[#00E676]' : 'bg-white/10'
                    }`}
                    onClick={() => setNotifications(!notifications)}
                  >
                    <motion.div
                      className="w-6 h-6 rounded-full bg-white"
                      animate={{ x: notifications ? 24 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#B517FF]/20 flex items-center justify-center">
                      {darkMode ? <Moon className="w-5 h-5 text-[#B517FF]" /> : <Sun className="w-5 h-5 text-[#FFB300]" />}
                    </div>
                    <div>
                      <div className="text-sm">Dark Mode</div>
                      <div className="text-xs text-gray-400">Toggle dark theme</div>
                    </div>
                  </div>
                  <motion.button
                    className={`w-14 h-8 rounded-full p-1 transition-colors ${
                      darkMode ? 'bg-[#B517FF]' : 'bg-white/10'
                    }`}
                    onClick={() => setDarkMode(!darkMode)}
                  >
                    <motion.div
                      className="w-6 h-6 rounded-full bg-white"
                      animate={{ x: darkMode ? 24 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>

                {/* Email Reports */}
                <div className="flex items-center justify-between glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#00E676]/20 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-[#00E676]" />
                    </div>
                    <div>
                      <div className="text-sm">Weekly Reports</div>
                      <div className="text-xs text-gray-400">Receive summary via email</div>
                    </div>
                  </div>
                  <div className="px-4 py-1 rounded-full bg-[#00E676]/20 text-[#00E676] text-xs">
                    Enabled
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Danger Zone */}
            <GlassCard className="border-l-4 border-[#FF3D57]">
              <h3 className="text-lg mb-4 text-[#FF3D57]">Danger Zone</h3>
              <div className="space-y-3">
                <motion.button
                  className="w-full py-3 rounded-2xl glass-card hover:bg-white/10 transition-all text-gray-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Reset All Data
                </motion.button>
                <motion.button
                  className="w-full py-3 rounded-2xl bg-[#FF3D57]/20 hover:bg-[#FF3D57]/30 transition-all text-[#FF3D57]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Delete Account
                </motion.button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </Layout>
  );
}
