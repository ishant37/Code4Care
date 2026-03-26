import React, { useEffect } from 'react';
import { Activity, X, Menu } from 'lucide-react';
import { Hospital3DSceneEnhanced } from './components/Hospital3DSceneEnhanced';
import { StatisticsPanel } from './components/StatisticsPanel';
import { AlertsPanel } from './components/AlertsPanel';
import { PatientRecordsPanel } from './components/PatientRecordsPanel';
import { WardDetailsSidebar } from './components/WardDetailsSidebar';
import { ConnectionStatus } from './components/ConnectionStatus';
import { useWebSocket } from './hooks/useWebSocket';
import { useAppStore } from './store';

/**
 * Main Dashboard Sidebar
 */
const DashboardSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const wards = useAppStore((state) => state.wards);
  const selectedWardId = useAppStore((state) => state.selectedWardId);
  const setSelectedWardId = useAppStore((state) => state.setSelectedWardId);

  const handleWardSelect = (wardId: string) => {
    setSelectedWardId(wardId);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:sticky top-0 left-0 w-80 h-full
          bg-gradient-to-b from-sci-fi-dark to-sci-fi-dark/80
          border-r border-gray-700/50
          overflow-y-auto
          transform transition-transform duration-300
          z-30
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="sticky top-0 bg-sci-fi-dark/95 border-b border-gray-700/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="text-sci-fi-blue" size={24} />
            <div>
              <h1 className="text-lg font-bold text-sci-fi-blue uppercase">HISS</h1>
              <p className="text-xs text-gray-400">Hospital Infection Surveillance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-sci-fi-blue"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Connection Status */}
          <ConnectionStatus />

          {/* Statistics */}
          <StatisticsPanel />

          {/* Ward Selection */}
          <div className="space-y-2">
            <div className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-3">
              Select Ward
            </div>
            {wards.map((ward) => (
              <button
                key={ward.id}
                onClick={() => handleWardSelect(ward.id)}
                className={`
                  w-full text-left p-2 rounded-lg text-sm transition
                  ${
                    selectedWardId === ward.id
                      ? 'bg-sci-fi-dark border border-sci-fi-blue glow-blue'
                      : 'sci-fi-border hover:border-sci-fi-blue/50'
                  }
                `}
              >
                <div className="font-bold text-gray-100">{ward.name}</div>
                <div className="text-xs text-gray-400 mt-1">
                  Patients: {ward.totalPatients} | Risk: {(ward.patientRiskScore * 100).toFixed(0)}%
                </div>
              </button>
            ))}
          </div>

          {/* Ward Details */}
          {selectedWardId && <WardDetailsSidebar />}

          {/* Recent Alerts */}
          <AlertsPanel />

          {/* Patient Records */}
          <PatientRecordsPanel />
        </div>
      </div>
    </>
  );
};

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Connect to WebSocket
  useWebSocket();

  return (
    <div className="flex h-screen w-screen bg-sci-fi-dark overflow-hidden">
      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Hospital3DSceneEnhanced />

        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-10 lg:hidden p-2 bg-sci-fi-dark/80 border border-sci-fi-blue/30 rounded-lg text-sci-fi-blue hover:border-sci-fi-blue transition"
        >
          <Menu size={24} />
        </button>

        {/* Instructions Overlay (optional) */}
        <div className="absolute bottom-4 left-4 bg-sci-fi-dark/80 border border-sci-fi-blue/30 rounded-lg p-3 max-w-xs text-xs text-gray-300">
          <p className="font-bold text-sci-fi-blue mb-1">💡 Instructions:</p>
          <p>Hover over ward footprints to view 3D structure • Red glow indicates critical alerts</p>
        </div>
      </div>

      {/* Dashboard Sidebar */}
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}

export default App;
