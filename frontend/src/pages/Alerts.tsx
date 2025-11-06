import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from '../components/Layout';
import { GlassCard } from '../components/GlassCard';
import { AlertTriangle, CheckCircle, Clock, X, TrendingUp } from 'lucide-react';

interface Alert {
  id: number;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: string;
  metric: string;
  value: number;
  threshold: number;
  resolved: boolean;
  recommendation: string;
}

const alertsData: Alert[] = [
  {
    id: 1,
    severity: 'high',
    title: 'Critical Stress Level Detected',
    description: 'Your stress level has exceeded the safe threshold',
    timestamp: '2 minutes ago',
    metric: 'Stress',
    value: 85,
    threshold: 75,
    resolved: false,
    recommendation: 'Take a 15-minute break. Practice deep breathing exercises. Step away from your workspace.',
  },
  {
    id: 2,
    severity: 'high',
    title: 'Elevated Fatigue Warning',
    description: 'Fatigue levels are critically high',
    timestamp: '15 minutes ago',
    metric: 'Fatigue',
    value: 82,
    threshold: 70,
    resolved: false,
    recommendation: 'Consider taking a short power nap (10-20 minutes). Hydrate and have a healthy snack.',
  },
  {
    id: 3,
    severity: 'medium',
    title: 'Heart Rate Elevated',
    description: 'Heart rate above normal resting range',
    timestamp: '1 hour ago',
    metric: 'Heart Rate',
    value: 95,
    threshold: 85,
    resolved: true,
    recommendation: 'Monitor your activity level. Consider reducing caffeine intake.',
  },
  {
    id: 4,
    severity: 'medium',
    title: 'High Ambient Noise',
    description: 'Noise level may affect concentration',
    timestamp: '2 hours ago',
    metric: 'Noise',
    value: 78,
    threshold: 70,
    resolved: false,
    recommendation: 'Use noise-cancelling headphones or move to a quieter environment.',
  },
  {
    id: 5,
    severity: 'low',
    title: 'Temperature Outside Comfort Zone',
    description: 'Ambient temperature is slightly high',
    timestamp: '3 hours ago',
    metric: 'Temperature',
    value: 27,
    threshold: 25,
    resolved: true,
    recommendation: 'Adjust air conditioning or open windows for better ventilation.',
  },
];

export default function Alerts() {
  const [alerts, setAlerts] = useState(alertsData);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');

  const severityColors = {
    high: { bg: '#FF3D57', text: 'High Priority' },
    medium: { bg: '#FFB300', text: 'Medium' },
    low: { bg: '#3A7AFE', text: 'Low' },
  };

  const handleResolve = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, resolved: true } : alert
    ));
    setSelectedAlert(null);
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'active') return !alert.resolved;
    if (filter === 'resolved') return alert.resolved;
    return true;
  });

  const activeHighAlerts = alerts.filter(a => !a.resolved && a.severity === 'high').length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Active Alert Banner */}
        {activeHighAlerts > 0 && (
          <motion.div
            className="glass-card rounded-[20px] p-4 border-2 border-[#FF3D57] bg-[#FF3D57]/10 animate-shake"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FF3D57] flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg">⚠️ Active Critical Alerts: {activeHighAlerts}</h3>
                <p className="text-sm text-gray-300">Immediate attention required</p>
              </div>
              <motion.button
                className="px-6 py-2 rounded-2xl bg-[#FF3D57] hover:bg-[#E91E63] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View All
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Title and Filters */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl mb-2">Alerts & Incidents</h1>
            <p className="text-gray-400">Monitor and manage health alerts</p>
          </div>

          <div className="flex gap-2">
            {(['all', 'active', 'resolved'] as const).map((filterType) => (
              <motion.button
                key={filterType}
                className={`px-6 py-2 rounded-2xl capitalize transition-all ${
                  filter === filterType
                    ? 'bg-gradient-to-r from-[#3A7AFE] to-[#B517FF] text-white'
                    : 'glass-card hover:bg-white/10'
                }`}
                onClick={() => setFilter(filterType)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {filterType}
                {filterType === 'active' && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-[#FF3D57] text-xs">
                    {alerts.filter(a => !a.resolved).length}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <GlassCard className="border-l-4 border-[#FF3D57]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">High Priority</p>
                <p className="text-3xl">{alerts.filter(a => a.severity === 'high' && !a.resolved).length}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#FF3D57]/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-[#FF3D57]" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="border-l-4 border-[#FFB300]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Medium Priority</p>
                <p className="text-3xl">{alerts.filter(a => a.severity === 'medium' && !a.resolved).length}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#FFB300]/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#FFB300]" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="border-l-4 border-[#3A7AFE]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Low Priority</p>
                <p className="text-3xl">{alerts.filter(a => a.severity === 'low' && !a.resolved).length}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#3A7AFE]/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#3A7AFE]" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="border-l-4 border-[#00E676]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Resolved Today</p>
                <p className="text-3xl">{alerts.filter(a => a.resolved).length}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#00E676]/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#00E676]" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Alerts Table */}
        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-sm text-gray-400">Severity</th>
                  <th className="text-left py-4 px-4 text-sm text-gray-400">Alert</th>
                  <th className="text-left py-4 px-4 text-sm text-gray-400">Metric</th>
                  <th className="text-left py-4 px-4 text-sm text-gray-400">Value</th>
                  <th className="text-left py-4 px-4 text-sm text-gray-400">Time</th>
                  <th className="text-left py-4 px-4 text-sm text-gray-400">Status</th>
                  <th className="text-left py-4 px-4 text-sm text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((alert, i) => (
                  <motion.tr
                    key={alert.id}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                      alert.severity === 'high' && !alert.resolved ? 'animate-shake' : ''
                    }`}
                    onClick={() => setSelectedAlert(alert)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td className="py-4 px-4">
                      <div
                        className="inline-block px-3 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: `${severityColors[alert.severity].bg}20`,
                          color: severityColors[alert.severity].bg,
                        }}
                      >
                        {severityColors[alert.severity].text}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="mb-1">{alert.title}</div>
                        <div className="text-sm text-gray-400">{alert.description}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{alert.metric}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span>{alert.value}</span>
                        <span className="text-gray-400 text-sm">/ {alert.threshold}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-400">{alert.timestamp}</td>
                    <td className="py-4 px-4">
                      {alert.resolved ? (
                        <div className="flex items-center gap-2 text-[#00E676]">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Resolved</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[#FF3D57]">
                          <div className="w-2 h-2 rounded-full bg-[#FF3D57] animate-pulse"></div>
                          <span className="text-sm">Active</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <motion.button
                        className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#3A7AFE] to-[#B517FF] text-sm hover:opacity-90"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAlert(alert);
                        }}
                      >
                        View
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Alert Detail Slide-Over Panel */}
      <AnimatePresence>
        {selectedAlert && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAlert(null)}
            />
            <motion.div
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl glass-card border-l border-white/10 z-50 overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div
                      className="inline-block px-4 py-2 rounded-full text-sm mb-4"
                      style={{
                        backgroundColor: `${severityColors[selectedAlert.severity].bg}20`,
                        color: severityColors[selectedAlert.severity].bg,
                      }}
                    >
                      {severityColors[selectedAlert.severity].text}
                    </div>
                    <h2 className="text-2xl mb-2">{selectedAlert.title}</h2>
                    <p className="text-gray-400">{selectedAlert.timestamp}</p>
                  </div>
                  <motion.button
                    className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/10"
                    onClick={() => setSelectedAlert(null)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Details */}
                <div className="space-y-6">
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-sm text-gray-400 mb-3">Alert Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Metric:</span>
                        <span>{selectedAlert.metric}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Value:</span>
                        <span className="text-[#FF3D57]">{selectedAlert.value}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Threshold:</span>
                        <span>{selectedAlert.threshold}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Exceeded By:</span>
                        <span className="text-[#FF3D57]">+{selectedAlert.value - selectedAlert.threshold}</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-6 border-l-4 border-[#3A7AFE]">
                    <h3 className="text-sm text-gray-400 mb-3">📋 Description</h3>
                    <p className="text-gray-300">{selectedAlert.description}</p>
                  </div>

                  <div className="glass-card rounded-2xl p-6 border-l-4 border-[#00E676]">
                    <h3 className="text-sm text-gray-400 mb-3">💡 Recommended Actions</h3>
                    <p className="text-gray-300">{selectedAlert.recommendation}</p>
                  </div>

                  {!selectedAlert.resolved && (
                    <motion.button
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00E676] to-[#00C853] flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleResolve(selectedAlert.id)}
                    >
                      <CheckCircle className="w-5 h-5" />
                      Mark as Resolved
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
}
