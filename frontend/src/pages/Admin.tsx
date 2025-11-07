import { useState } from 'react';
import { motion } from 'motion/react';
import { Layout } from '../components/Layout';
import { GlassCard } from '../components/GlassCard';
import { Users, TrendingUp, AlertTriangle, Download, Search, Filter } from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  department: string;
  stressLevel: number;
  fatigueLevel: number;
  wellnessScore: number;
  status: 'healthy' | 'warning' | 'critical';
  lastActive: string;
}

const userData: UserData[] = [
  { id: 1, name: 'Atharva', department: 'Engineering', stressLevel: 45, fatigueLevel: 38, wellnessScore: 72, status: 'healthy', lastActive: '2 min ago' },
  { id: 2, name: 'Amoghvarsh', department: 'Design', stressLevel: 82, fatigueLevel: 75, wellnessScore: 35, status: 'critical', lastActive: '5 min ago' },
  { id: 3, name: 'Feroz', department: 'Marketing', stressLevel: 65, fatigueLevel: 60, wellnessScore: 52, status: 'warning', lastActive: '10 min ago' },
  { id: 4, name: 'Samarth', department: 'Sales', stressLevel: 38, fatigueLevel: 32, wellnessScore: 78, status: 'healthy', lastActive: '1 min ago' },
  { id: 5, name: 'Lisa Brown', department: 'Engineering', stressLevel: 72, fatigueLevel: 68, wellnessScore: 42, status: 'warning', lastActive: '8 min ago' },
  { id: 6, name: 'Pawan', department: 'HR', stressLevel: 28, fatigueLevel: 25, wellnessScore: 85, status: 'healthy', lastActive: '3 min ago' },
  { id: 7, name: 'Aryan', department: 'Design', stressLevel: 55, fatigueLevel: 48, wellnessScore: 62, status: 'warning', lastActive: '12 min ago' },
  { id: 8, name: 'Mithun', department: 'Engineering', stressLevel: 90, fatigueLevel: 85, wellnessScore: 28, status: 'critical', lastActive: '15 min ago' },
];

const departmentStats = [
  { dept: 'Engineering', avgStress: 65, count: 3, color: '#3A7AFE' },
  { dept: 'Design', avgStress: 68, count: 2, color: '#B517FF' },
  { dept: 'Marketing', avgStress: 65, count: 1, color: '#00E676' },
  { dept: 'Sales', avgStress: 38, count: 1, color: '#FFB300' },
  { dept: 'HR', avgStress: 28, count: 1, color: '#FF3D57' },
];

export default function Admin() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'healthy' | 'warning' | 'critical'>('all');

  const filteredUsers = userData.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusColors = {
    healthy: '#00E676',
    warning: '#FFB300',
    critical: '#FF3D57',
  };

  const criticalCount = userData.filter(u => u.status === 'critical').length;
  const warningCount = userData.filter(u => u.status === 'warning').length;
  const avgWellness = Math.round(userData.reduce((acc, u) => acc + u.wellnessScore, 0) / userData.length);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Organization-wide health monitoring & analytics</p>
          </div>

          <motion.button
            className="glass-card rounded-2xl px-6 py-3 flex items-center gap-2 bg-gradient-to-r from-[#3A7AFE] to-[#B517FF] hover:opacity-90"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-5 h-5" />
            Export Weekly Summary
          </motion.button>
        </div>

        {/* Critical Alert Banner */}
        {criticalCount > 0 && (
          <motion.div
            className="glass-card rounded-[20px] p-4 border-2 border-[#FF3D57] bg-[#FF3D57]/10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FF3D57] flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg">⚠️ {criticalCount} Team Member{criticalCount > 1 ? 's' : ''} Need Immediate Attention</h3>
                <p className="text-sm text-gray-300">Critical stress or fatigue levels detected</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <GlassCard className="border-l-4 border-[#3A7AFE]" hover>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-400">Total Employees</p>
                <p className="text-4xl mt-1">{userData.length}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#3A7AFE]/20 flex items-center justify-center">
                <Users className="w-7 h-7 text-[#3A7AFE]" />
              </div>
            </div>
            <div className="text-xs text-gray-400">Active monitoring</div>
          </GlassCard>

          <GlassCard className="border-l-4 border-[#FF3D57]" hover>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-400">Critical Alerts</p>
                <p className="text-4xl mt-1">{criticalCount}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#FF3D57]/20 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-[#FF3D57]" />
              </div>
            </div>
            <div className="text-xs text-[#FF3D57]">Requires action</div>
          </GlassCard>

          <GlassCard className="border-l-4 border-[#FFB300]" hover>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-400">Warnings</p>
                <p className="text-4xl mt-1">{warningCount}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#FFB300]/20 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-[#FFB300]" />
              </div>
            </div>
            <div className="text-xs text-gray-400">Monitor closely</div>
          </GlassCard>

          <GlassCard className="border-l-4 border-[#00E676]" hover>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-400">Avg. Wellness</p>
                <p className="text-4xl mt-1">{avgWellness}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#00E676]/20 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-[#00E676]" />
              </div>
            </div>
            <div className="text-xs text-[#00E676]">+5% vs last week</div>
          </GlassCard>
        </div>

        {/* Department Heatmap */}
        <GlassCard>
          <h3 className="text-lg mb-6">Department Stress Distribution</h3>
          <div className="space-y-4">
            {departmentStats.map((dept, i) => (
              <motion.div
                key={dept.dept}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: dept.color }}
                    />
                    <span>{dept.dept}</span>
                    <span className="text-sm text-gray-400">({dept.count} {dept.count === 1 ? 'member' : 'members'})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Avg Stress:</span>
                    <span 
                      className="px-3 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: `${dept.avgStress > 70 ? '#FF3D57' : dept.avgStress > 50 ? '#FFB300' : '#00E676'}20`,
                        color: dept.avgStress > 70 ? '#FF3D57' : dept.avgStress > 50 ? '#FFB300' : '#00E676'
                      }}
                    >
                      {dept.avgStress}
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: dept.avgStress > 70 ? '#FF3D57' : dept.avgStress > 50 ? '#FFB300' : '#00E676'
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${dept.avgStress}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-card rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#3A7AFE]/30 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            {(['all', 'healthy', 'warning', 'critical'] as const).map((status) => (
              <motion.button
                key={status}
                className={`px-4 py-2 rounded-2xl capitalize transition-all ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-[#3A7AFE] to-[#B517FF] text-white'
                    : 'glass-card hover:bg-white/10'
                }`}
                onClick={() => setFilterStatus(status)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {status}
              </motion.button>
            ))}
          </div>
        </div>

        {/* User Table */}
        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-sm text-gray-400">Employee</th>
                  <th className="text-left py-4 px-4 text-sm text-gray-400">Department</th>
                  <th className="text-left py-4 px-4 text-sm text-gray-400">Wellness</th>
                  <th className="text-left py-4 px-4 text-sm text-gray-400">Stress</th>
                  <th className="text-left py-4 px-4 text-sm text-gray-400">Fatigue</th>
                  <th className="text-left py-4 px-4 text-sm text-gray-400">Status</th>
                  <th className="text-left py-4 px-4 text-sm text-gray-400">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3A7AFE] to-[#B517FF] flex items-center justify-center">
                          {user.name.charAt(0)}
                        </div>
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full bg-white/5 text-sm">
                        {user.department}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: user.wellnessScore >= 70 ? '#00E676' : 
                                             user.wellnessScore >= 40 ? '#FFB300' : '#FF3D57'
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${user.wellnessScore}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                        <span className="text-sm">{user.wellnessScore}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span 
                        className="px-3 py-1 rounded-full text-sm"
                        style={{
                          backgroundColor: `${user.stressLevel > 70 ? '#FF3D57' : user.stressLevel > 50 ? '#FFB300' : '#00E676'}20`,
                          color: user.stressLevel > 70 ? '#FF3D57' : user.stressLevel > 50 ? '#FFB300' : '#00E676'
                        }}
                      >
                        {user.stressLevel}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span 
                        className="px-3 py-1 rounded-full text-sm"
                        style={{
                          backgroundColor: `${user.fatigueLevel > 70 ? '#FF3D57' : user.fatigueLevel > 50 ? '#FFB300' : '#00E676'}20`,
                          color: user.fatigueLevel > 70 ? '#FF3D57' : user.fatigueLevel > 50 ? '#FFB300' : '#00E676'
                        }}
                      >
                        {user.fatigueLevel}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: statusColors[user.status] }}
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span 
                          className="capitalize text-sm"
                          style={{ color: statusColors[user.status] }}
                        >
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-400">{user.lastActive}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
}
