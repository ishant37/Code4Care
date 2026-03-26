import React from 'react';
import { useAppStore } from '../store';
import { Wifi, WifiOff } from 'lucide-react';

/**
 * Connection Status Indicator
 */
export const ConnectionStatus: React.FC = () => {
  const isConnected = useAppStore((state) => state.isConnected);

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sci-fi-dark/50 sci-fi-border">
      {isConnected ? (
        <>
          <div className="w-2 h-2 rounded-full bg-sci-fi-green animate-pulse" />
          <span className="text-xs text-sci-fi-green uppercase font-mono">Connected</span>
        </>
      ) : (
        <>
          <div className="w-2 h-2 rounded-full bg-sci-fi-red animate-pulse" />
          <span className="text-xs text-sci-fi-red uppercase font-mono">Disconnected</span>
        </>
      )}
    </div>
  );
};
