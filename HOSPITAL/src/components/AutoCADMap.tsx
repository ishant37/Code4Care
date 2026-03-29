import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  onWardSelect: (id: string) => void;
  alerts: any[];
}

export const AutoCADMap: React.FC<Props> = ({ onWardSelect, alerts }) => {
  const wards = [
    { id: 'Ward_A', x: 80, y: 80, label: 'General Ward A', beds: 12, occupancy: '92%' },
    { id: 'Ward_B', x: 380, y: 80, label: 'ICU / Critical Care', beds: 8, occupancy: '100%' },
    { id: 'Ward_C', x: 80, y: 320, label: 'Pediatrics', beds: 10, occupancy: '78%' },
    { id: 'Ward_D', x: 380, y: 320, label: 'Isolation Ward', beds: 6, occupancy: '50%' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-10 bg-gradient-to-b from-transparent to-slate-900/30">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-cyan-500/60 font-mono text-[11px] mb-6 self-start uppercase tracking-tighter flex items-center gap-2"
      >
        <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
        VECTOR_ENGINE: HOSPITAL_BLUEPRINT_V2.0
      </motion.div>

      <motion.svg 
        viewBox="0 0 800 600" 
        className="w-full max-w-4xl h-auto drop-shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Grid background */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 212, 255, 0.05)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="800" height="600" fill="url(#grid)" />

        {/* Main building outline */}
        <motion.rect
          x="40" y="40" width="720" height="520"
          fill="none"
          stroke="#00d4ff"
          strokeWidth="2"
          opacity="0.3"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Ward boxes */}
        {wards.map((ward, idx) => {
          const isAlert = alerts.some(a => a.id === ward.id);
          const color = isAlert ? '#ff1744' : '#00d4ff';
          const glowColor = isAlert ? 'url(#redGlow)' : 'url(#cyanGlow)';

          return (
            <motion.g 
              key={ward.id}
              onClick={() => onWardSelect(ward.id)}
              className="group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <defs>
                <filter id={`blur-${ward.id}`}>
                  <feGaussianBlur in="SourceGraphic" stdDeviation={isAlert ? "3" : "2"} />
                </filter>
                <filter id="cyanGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="redGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Ward rectangle with glow */}
              <motion.rect
                x={ward.x}
                y={ward.y}
                width="250"
                height="180"
                fill={isAlert ? 'rgba(255, 23, 68, 0.1)' : 'rgba(0, 212, 255, 0.08)'}
                stroke={color}
                strokeWidth="2"
                rx="8"
                filter={glowColor}
                animate={{
                  opacity: isAlert ? [0.6, 1, 0.6] : 0.6,
                  strokeWidth: isAlert ? [2, 3, 2] : 2
                }}
                transition={{ duration: isAlert ? 1 : 2, repeat: Infinity }}
              />

              {/* Inner accent lines */}
              <line x1={ward.x + 10} y1={ward.y} x2={ward.x + 10} y2={ward.y + 180} stroke={color} strokeWidth="0.5" opacity="0.3" />
              <line x1={ward.x + 125} y1={ward.y} x2={ward.x + 125} y2={ward.y + 180} stroke={color} strokeWidth="0.5" opacity="0.2" />
              <line x1={ward.x} y1={ward.y + 60} x2={ward.x + 250} y2={ward.y + 60} stroke={color} strokeWidth="0.5" opacity="0.3" />

              {/* Ward label */}
              <motion.text
                x={ward.x + 125}
                y={ward.y + 40}
                className="text-[16px] font-bold fill-current"
                fill={color}
                textAnchor="middle"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {ward.label}
              </motion.text>

              {/* Bed count */}
              <text
                x={ward.x + 125}
                y={ward.y + 70}
                className="text-[12px] fill-current"
                fill={isAlert ? '#ff5252' : '#00d4ff'}
                textAnchor="middle"
                opacity="0.7"
              >
                {ward.beds} BEDS • {ward.occupancy}
              </text>

              {/* Status indicator */}
              <circle
                cx={ward.x + 15}
                cy={ward.y + 15}
                r="6"
                fill={isAlert ? '#ff1744' : '#00d4ff'}
                opacity={isAlert ? 0.8 : 0.6}
              />
              {isAlert && (
                <motion.circle
                  cx={ward.x + 15}
                  cy={ward.y + 15}
                  r="6"
                  fill="none"
                  stroke="#ff1744"
                  strokeWidth="1"
                  animate={{ r: [6, 10, 6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}

              {/* Hover highlight */}
              <rect
                x={ward.x}
                y={ward.y}
                width="250"
                height="180"
                fill="none"
                stroke={color}
                strokeWidth="1"
                rx="8"
                opacity="0"
                className="group-hover:opacity-100 transition-opacity"
                strokeDasharray="5,5"
              />
            </motion.g>
          );
        })}

        {/* Connection lines between wards */}
        <motion.g opacity="0.2" animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 3, repeat: Infinity }}>
          <line x1="330" y1="170" x2="380" y2="170" stroke="#00d4ff" strokeWidth="1" />
          <line x1="205" y1="260" x2="205" y2="320" stroke="#00d4ff" strokeWidth="1" />
          <line x1="505" y1="260" x2="505" y2="320" stroke="#00d4ff" strokeWidth="1" />
        </motion.g>

        {/* Legend */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <text x="50" y="580" className="text-[12px]" fill="#00d4ff" opacity="0.6">
            ◆ NORMAL ZONE
          </text>
          <text x="250" y="580" className="text-[12px]" fill="#ff1744" opacity="0.7">
            ✕ ALERT ZONE
          </text>
          <text x="450" y="580" className="text-[12px]" fill="#00d4ff" opacity="0.5">
            CLICK WARD TO VIEW 3D MODEL
          </text>
        </motion.g>
      </motion.svg>
    </div>
  );
};