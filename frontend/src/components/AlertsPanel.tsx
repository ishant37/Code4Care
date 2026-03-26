import React from 'react';
import { useAppStore } from '../store';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * Recent Alerts Display
 */
export const AlertsPanel: React.FC = () => {
  const alerts = useAppStore((state) => state.alerts);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle size={16} className="text-sci-fi-red" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-sci-fi-purple" />;
      default:
        return <CheckCircle size={16} className="text-sci-fi-green" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-900/20 border-red-700/50';
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-700/50';
      default:
        return 'bg-green-900/20 border-green-700/50';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-gray-400 text-xs uppercase tracking-widest font-bold">
        Recent Alerts
      </div>

      {alerts.length === 0 ? (
        <div className="sci-fi-border rounded-lg p-4 bg-sci-fi-dark/50 text-center text-gray-500">
          No alerts
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {alerts.slice(0, 15).map((alert) => (
            <div
              key={alert.id}
              className={`sci-fi-border rounded-lg p-3 text-sm ${getSeverityColor(
                alert.severity
              )} transition hover:bg-opacity-40`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5 flex-shrink-0">{getSeverityIcon(alert.severity)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-200 uppercase text-xs">
                    {alert.wardName} - {alert.severity}
                  </div>
                  <div className="text-gray-300 text-xs mt-1">{alert.message}</div>
                  <div className="text-gray-500 text-xs mt-1">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
