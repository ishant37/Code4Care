import { create } from 'zustand';
import { WardData, AlertMessage, PatientRecord, HospitalStats } from './types';

interface AppState {
  // Ward data
  wards: WardData[];
  setWards: (wards: WardData[]) => void;
  updateWardStatus: (wardId: string, status: 'normal' | 'warning' | 'critical', infectionCount: number) => void;

  // Alerts
  alerts: AlertMessage[];
  addAlert: (alert: AlertMessage) => void;
  clearOldAlerts: () => void;

  // Patient records
  patientRecords: PatientRecord[];
  addPatientRecord: (record: PatientRecord) => void;
  setPatientRecords: (records: PatientRecord[]) => void;

  // Global stats
  stats: HospitalStats | null;
  setStats: (stats: HospitalStats) => void;

  // UI State
  hoveredWardId: string | null;
  setHoveredWardId: (wardId: string | null) => void;
  selectedWardId: string | null;
  setSelectedWardId: (wardId: string | null) => void;

  // WebSocket connection state
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
}

const INITIAL_WARDS: WardData[] = [
  {
    id: 'icu-01',
    name: 'ICU Ward',
    position: [-8, 0, -8],
    color: '#00d4ff',
    status: 'normal',
    infectionCount: 2,
    totalPatients: 15,
    patientRiskScore: 0.25,
  },
  {
    id: 'gen-01',
    name: 'General Ward',
    position: [0, 0, -8],
    color: '#00ff41',
    status: 'normal',
    infectionCount: 1,
    totalPatients: 45,
    patientRiskScore: 0.18,
  },
  {
    id: 'surg-01',
    name: 'Surgery Ward',
    position: [8, 0, -8],
    color: '#8800ff',
    status: 'normal',
    infectionCount: 0,
    totalPatients: 20,
    patientRiskScore: 0.12,
  },
  {
    id: 'pedi-01',
    name: 'Pediatrics',
    position: [-8, 0, 8],
    color: '#ff00ff',
    status: 'normal',
    infectionCount: 1,
    totalPatients: 30,
    patientRiskScore: 0.22,
  },
  {
    id: 'emer-01',
    name: 'Emergency',
    position: [0, 0, 8],
    color: '#ffaa00',
    status: 'normal',
    infectionCount: 3,
    totalPatients: 50,
    patientRiskScore: 0.35,
  },
  {
    id: 'amb-01',
    name: 'Ambulatory',
    position: [8, 0, 8],
    color: '#00ffff',
    status: 'normal',
    infectionCount: 0,
    totalPatients: 25,
    patientRiskScore: 0.08,
  },
];

export const useAppStore = create<AppState>((set) => ({
  wards: INITIAL_WARDS,
  setWards: (wards) => set({ wards }),
  updateWardStatus: (wardId, status, infectionCount) =>
    set((state) => ({
      wards: state.wards.map((ward) =>
        ward.id === wardId ? { ...ward, status, infectionCount } : ward
      ),
    })),

  alerts: [],
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 50), // Keep only last 50 alerts
    })),
  clearOldAlerts: () =>
    set((state) => ({
      alerts: state.alerts.filter(
        (alert) => Date.now() - alert.timestamp < 5 * 60 * 1000 // Keep only last 5 minutes
      ),
    })),

  patientRecords: [],
  addPatientRecord: (record) =>
    set((state) => ({
      patientRecords: [record, ...state.patientRecords].slice(0, 100),
    })),
  setPatientRecords: (records) => set({ patientRecords: records }),

  stats: null,
  setStats: (stats) => set({ stats }),

  hoveredWardId: null,
  setHoveredWardId: (wardId) => set({ hoveredWardId: wardId }),
  selectedWardId: null,
  setSelectedWardId: (wardId) => set({ selectedWardId: wardId }),

  isConnected: false,
  setIsConnected: (connected) => set({ isConnected: connected }),
}));
