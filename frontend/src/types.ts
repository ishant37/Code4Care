// State management types
export interface WardData {
  id: string;
  name: string;
  position: [number, number, number];
  color: string;
  status: 'normal' | 'warning' | 'critical';
  infectionCount: number;
  totalPatients: number;
  patientRiskScore: number;
}

export interface AlertMessage {
  id: string;
  wardId: string;
  wardName: string;
  severity: 'normal' | 'warning' | 'critical';
  message: string;
  timestamp: number;
}

export interface PatientRecord {
  id: string;
  wardId: string;
  wardName: string;
  patientId: string;
  testType: string;
  result: string;
  timestamp: number;
}

export interface HospitalStats {
  totalPatients: number;
  suspectedInfections: number;
  criticalAlerts: number;
  normalWards: number;
  warningWards: number;
  criticalWards: number;
}

export interface WebSocketMessage {
  type: 'alert' | 'update' | 'stats' | 'patient_record';
  payload: any;
}

export interface AnomalyDetectionResult {
  wardId: string;
  wardName: string;
  anomalyScore: number;
  status: 'normal' | 'warning' | 'critical';
  detectedAt: number;
  details: {
    infectionClusters: number;
    riskFactors: string[];
  };
}
