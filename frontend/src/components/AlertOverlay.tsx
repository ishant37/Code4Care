import React, { useEffect } from 'react';
import { Html } from '@react-three/drei';
import { useAppStore } from '../store';
import { AlertMessage } from '../types';

/**
 * Alert Box - 3D HTML element positioned above a ward
 */
export const AlertBox: React.FC<{
  alert: AlertMessage;
  wardPosition: [number, number, number];
}> = ({ alert, wardPosition }) => {
  const getAlertStyling = () => {
    switch (alert.severity) {
      case 'critical':
        return {
          bgColor: 'bg-red-900',
          borderColor: 'border-red-500',
          textColor: 'text-red-100',
          glowClass: 'glow-red pulse-red',
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-900',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-100',
          glowClass: 'glow-blue',
        };
      default:
        return {
          bgColor: 'bg-blue-900',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-100',
          glowClass: 'glow-blue',
        };
    }
  };

  const styling = getAlertStyling();
  const alertPosition: [number, number, number] = [
    wardPosition[0],
    wardPosition[1] + 3,
    wardPosition[2],
  ];

  return (
    <Html position={alertPosition} distanceFactor={1.5} scale={0.8}>
      <div
        className={`
          ${styling.bgColor}
          ${styling.borderColor}
          ${styling.textColor}
          border-2
          rounded-lg
          p-3
          w-48
          shadow-lg
          ${styling.glowClass}
          text-sm
          font-mono
          pointer-events-auto
          z-50
        `}
      >
        <div className="font-bold mb-1 text-xs uppercase">
          {alert.severity === 'critical' ? '🚨' : '⚠️'} {alert.severity}
        </div>
        <div className="text-xs">{alert.message}</div>
        <div className="text-xs opacity-75 mt-1">
          {new Date(alert.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </Html>
  );
};

/**
 * Alert Overlay Component - renders all active alerts in 3D space
 */
export const AlertOverlay: React.FC = () => {
  const alerts = useAppStore((state) => state.alerts);
  const wards = useAppStore((state) => state.wards);

  return (
    <group>
      {alerts.slice(0, 10).map((alert) => {
        const ward = wards.find((w) => w.id === alert.wardId);
        if (!ward) return null;

        return (
          <AlertBox
            key={alert.id}
            alert={alert}
            wardPosition={ward.position}
          />
        );
      })}
    </group>
  );
};
