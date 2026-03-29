import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface WardStatus {
  id: string;
  name: string;
  isAlert: boolean;
  anomalyScore: number;
}

export const AlertSidebar: React.FC<{ 
  alerts: any[], 
  selectedWard: any,
  onWardSelect?: (wardId: string) => void
}> = ({ alerts, selectedWard, onWardSelect }) => {
  const [pulseStates, setPulseStates] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseStates(prev => ({}));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Active Alerts Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900/50 via-slate-950/50 to-slate-900/50 p-6 rounded-2xl border border-red-500/20 backdrop-blur-xl shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-mono text-red-400 uppercase tracking-wider font-bold">
            ✕ ACTIVE ALERTS
          </h3>
          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded font-bold">{alerts.length}</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {alerts.length === 0 ? (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-slate-500 italic font-mono"
            >
              [SYSTEM_NOMINAL] No threats detected
            </motion.p>
          ) : (
            alerts.map((alert, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => onWardSelect?.(alert.id)}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/30 rounded-lg hover:border-red-500/60 transition-all cursor-pointer group"
              >
                <div className="flex-shrink-0">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-red-400 group-hover:text-red-300 transition-colors">{alert.id}</p>
                  <p className="text-[10px] text-red-400/60 font-mono">CONFIDENCE: 94.2%</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Ward Intelligence Panel */}
      {selectedWard && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-cyan-500/10 via-slate-950/50 to-slate-900/50 p-6 rounded-2xl border border-cyan-500/30 backdrop-blur-xl shadow-lg"
        >
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
                [◆] WARD INTELLIGENCE
              </h3>
              <span className={`text-[10px] px-2 py-1 rounded font-bold ${selectedWard.isAlert ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                {selectedWard.isAlert ? 'CRITICAL' : 'STABLE'}
              </span>
            </div>
            <p className="text-xl font-bold text-cyan-400 mb-3">{selectedWard.name}</p>
          </div>

          <div className="space-y-2 text-[11px] font-mono text-slate-300">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex justify-between p-2 bg-slate-900/50 rounded border border-cyan-500/10"
            >
              <span className="text-slate-400">ANOMALY_INDEX:</span> 
              <span className="text-cyan-400 font-bold">{(selectedWard.anomalyScore * 100).toFixed(1)}%</span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-between p-2 bg-slate-900/50 rounded border border-cyan-500/10"
            >
              <span className="text-slate-400">PATHOGEN_LOAD:</span> 
              <span className="text-cyan-400 font-bold">ELEVATED</span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-between p-2 bg-slate-900/50 rounded border border-cyan-500/10"
            >
              <span className="text-slate-400">STAFF_RISK:</span> 
              <span className="text-yellow-400 font-bold">MODERATE</span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-between p-2 bg-slate-900/50 rounded border border-cyan-500/10"
            >
              <span className="text-slate-400">OXYGEN_LVL:</span> 
              <span className="text-cyan-400 font-bold">96%</span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-between p-2 bg-slate-900/50 rounded border border-cyan-500/10"
            >
              <span className="text-slate-400">HEART_RATE:</span> 
              <span className="text-cyan-400 font-bold">78 BPM</span>
            </motion.div>
          </div>

          {/* Status indicator */}
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-3 pt-3 border-t border-cyan-500/20 text-[10px] text-cyan-400/60 font-mono text-center"
          >
            ▓▒░ MONITORING_ACTIVE ░▒▓
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};