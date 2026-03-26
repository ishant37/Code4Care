import React from 'react';
import {
  AlertCircle,
  Activity,
  Users,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useAppStore } from '../store';

/**
 * Global Hospital Statistics Display
 */
export const StatisticsPanel: React.FC = () => {
  const stats = useAppStore((state) => state.stats);

  if (!stats) {
    return (
      <div className="space-y-4">
        <div className="sci-fi-border rounded-lg p-4 bg-sci-fi-dark/50">
          <div className="text-center text-gray-500 animate-pulse">Loading stats...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total Patients */}
      <div className="sci-fi-border rounded-lg p-4 bg-sci-fi-dark/50 hover:bg-sci-fi-dark/70 transition">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-widest">Total Patients</div>
            <div className="text-2xl font-bold text-sci-fi-blue mt-1">{stats.totalPatients}</div>
          </div>
          <Users className="text-sci-fi-blue opacity-30" size={32} />
        </div>
      </div>

      {/* Suspected Infections */}
      <div className="sci-fi-border rounded-lg p-4 bg-sci-fi-dark/50 hover:bg-sci-fi-dark/70 transition">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-widest">Suspected Infections</div>
            <div className="text-2xl font-bold text-sci-fi-green mt-1">
              {stats.suspectedInfections}
            </div>
          </div>
          <Activity className="text-sci-fi-green opacity-30" size={32} />
        </div>
      </div>

      {/* Critical Alerts */}
      <div className="sci-fi-border rounded-lg p-4 bg-sci-fi-dark/50 hover:bg-sci-fi-dark/70 transition">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-400 text-xs uppercase tracking-widest">Critical Alerts</div>
            <div className="text-2xl font-bold text-sci-fi-red mt-1">{stats.criticalAlerts}</div>
          </div>
          <AlertCircle className="text-sci-fi-red opacity-30" size={32} />
        </div>
      </div>

      {/* Ward Status Breakdown */}
      <div className="sci-fi-border rounded-lg p-4 bg-sci-fi-dark/50 space-y-2">
        <div className="text-gray-400 text-xs uppercase tracking-widest mb-3">Ward Status</div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm">Normal</span>
          <span className="text-sci-fi-green font-bold">{stats.normalWards}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm">Warning</span>
          <span className="text-sci-fi-purple font-bold">{stats.warningWards}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm">Critical</span>
          <span className="text-sci-fi-red font-bold">{stats.criticalWards}</span>
        </div>
      </div>
    </div>
  );
};
