import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface SensorCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'danger';
  trend?: 'up' | 'down' | 'stable';
}

export function SensorCard({ icon: Icon, title, value, unit, status, trend }: SensorCardProps) {
  const statusColors = {
    normal: 'from-[#00E676] to-[#00C853]',
    warning: 'from-[#FFB300] to-[#FF8F00]',
    danger: 'from-[#FF3D57] to-[#E91E63]',
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    stable: '→',
  };

  return (
    <GlassCard hover className="relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${statusColors[status]} opacity-10 rounded-full blur-2xl`}></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${statusColors[status]}`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <motion.div
              className="text-2xl"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {trendIcons[trend]}
            </motion.div>
          )}
        </div>

        <h3 className="text-sm text-gray-400 mb-2">{title}</h3>
        
        <div className="flex items-baseline gap-2">
          <motion.span
            className="text-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {value}
          </motion.span>
          <span className="text-gray-400">{unit}</span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <motion.div
            className={`w-2 h-2 rounded-full bg-gradient-to-r ${statusColors[status]}`}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>
    </GlassCard>
  );
}
