import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../store';
import { WebSocketMessage, AlertMessage, PatientRecord, HospitalStats } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

export const useWebSocket = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const store = useAppStore();

  const connect = useCallback(() => {
    if (ws?.readyState === WebSocket.OPEN) return;

    try {
      const newWs = new WebSocket(WS_URL);

      newWs.onopen = () => {
        console.log('✓ WebSocket connected');
        store.setIsConnected(true);
      };

      newWs.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      newWs.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      newWs.onclose = () => {
        console.log('✗ WebSocket disconnected');
        store.setIsConnected(false);
        // Reconnect after 3 seconds
        setTimeout(() => {
          connect();
        }, 3000);
      };

      setWs(newWs);
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [ws, store]);

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'alert': {
        const alert: AlertMessage = message.payload;
        store.addAlert(alert);
        store.updateWardStatus(alert.wardId, alert.severity, 0);
        break;
      }
      case 'update': {
        const { wardId, status, infectionCount } = message.payload;
        store.updateWardStatus(wardId, status, infectionCount);
        break;
      }
      case 'stats': {
        const stats: HospitalStats = message.payload;
        store.setStats(stats);
        break;
      }
      case 'patient_record': {
        const record: PatientRecord = message.payload;
        store.addPatientRecord(record);
        break;
      }
      default:
        console.warn('Unknown message type:', message.type);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return { ws, isConnected: store.isConnected };
};
