import React from 'react';
import { useAppStore } from '../store';
import { Activity, AlertCircle, TrendingUp } from 'lucide-react';

/**
 * Ward Details Sidebar
 */
export const WardDetailsSidebar: React.FC = () => {
  const wards = useAppStore((state) => state.wards);
  const selectedWardId = useAppStore((state) => state.selectedWardId);
  const setSelectedWardId = useAppStore((state) => state.setSelectedWardId);

  const selectedWard = wards.find((w) => w.id === selectedWardId);

  if (!selectedWard) {
    return (
      <div className="sci-fi-border rounded-lg p-4 bg-sci-fi-dark/50 text-center text-gray-500 text-sm">
        Select a ward to view details
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (selectedWard.status) {
      case 'critical':
        return <AlertCircle className="text-sci-fi-red" />;
      case 'warning':
        return <TrendingUp className="text-sci-fi-purple" />;
      default:
        return <Activity className="text-sci-fi-green" />;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-3">
          Ward Details
        </div>
        <div className="sci-fi-border rounded-lg p-4 bg-sci-fi-dark/50 space-y-3">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <div className="text-lg font-bold text-gray-100">{selectedWard.name}</div>
              <div
                className={`text-xs uppercase font-bold ${
                  selectedWard.status === 'critical'
                    ? 'text-sci-fi-red'
                    : selectedWard.status === 'warning'
                    ? 'text-sci-fi-purple'
                    : 'text-sci-fi-green'
                }`}
              >
                {selectedWard.status}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-600/30 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Patients</span>
              <span className="text-sci-fi-blue font-bold">{selectedWard.totalPatients}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Infections Detected</span>
              <span className="text-sci-fi-red font-bold">{selectedWard.infectionCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Risk Score</span>
              <span className="text-sci-fi-purple font-bold">
                {(selectedWard.patientRiskScore * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setSelectedWardId(null)}
        className="w-full py-2 px-3 bg-sci-fi-dark/50 border border-gray-600/30 rounded-lg text-gray-300 text-sm uppercase font-mono hover:border-sci-fi-blue hover:text-sci-fi-blue transition"
      >
        Clear Selection
      </button>
    </div>
  );
};
