import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface WellnessGaugeProps {
  value: number;
  label?: string;
}

export function WellnessGauge({ value, label = 'Wellness Score' }: WellnessGaugeProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayValue(value), 300);
    return () => clearTimeout(timer);
  }, [value]);

  const rotation = (displayValue / 100) * 180 - 90;
  const color = value >= 70 ? '#00E676' : value >= 40 ? '#FFB300' : '#FF3D57';

  return (
    <div className="relative w-full h-64 flex flex-col items-center justify-center">
      {/* Gauge Background */}
      <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 200 120">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF3D57" />
            <stop offset="50%" stopColor="#FFB300" />
            <stop offset="100%" stopColor="#00E676" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background Arc */}
        <path
          d="M 30 100 A 70 70 0 0 1 170 100"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        
        {/* Colored Arc */}
        <motion.path
          d="M 30 100 A 70 70 0 0 1 170 100"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: displayValue / 100 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        
        {/* Center Needle */}
        <motion.line
          x1="100"
          y1="100"
          x2="100"
          y2="40"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#glow)"
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ transformOrigin: '100px 100px' }}
        />
        
        {/* Center Circle */}
        <circle cx="100" cy="100" r="8" fill={color} filter="url(#glow)" />
      </svg>

      {/* Value Display */}
      <div className="relative z-10 mt-16">
        <motion.div
          className="text-6xl mb-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{ color }}
        >
          {Math.round(displayValue)}
        </motion.div>
        <div className="text-sm text-gray-400 text-center">{label}</div>
      </div>

      {/* Markers */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-8 text-xs text-gray-500">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}
