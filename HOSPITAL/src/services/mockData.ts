// ─── All static mock data + live simulation (no backend required) ─────────────

export interface WardStatus {
  id: string;
  name: string;
  isAlert: boolean;
  anomalyScore: number;
  floor?: number;
  infections?: number;
  patients?: number;
}

export interface MockAlert {
  id: string;
  wardId: string;
  wardName: string;
  severity: "critical" | "warning";
  message: string;
  type: "outbreak" | "resistance" | "positivity" | "cluster" | "onset";
  organism?: string;
  timestamp: number;
  resolved: boolean;
}

// ─── Dummy credentials ────────────────────────────────────────────────────────
export const MOCK_CREDENTIALS: Record<string, {
  password: string;
  user: {
    username: string;
    full_name: string;
    role: "doctor" | "wardman";
    department: string;
    employee_id: string;
    email: string;
  };
}> = {
  doctor: {
    password: "Doctor@2024",
    user: {
      username: "doctor",
      full_name: "Dr. Ravi Sharma",
      role: "doctor",
      department: "Infectious Diseases",
      employee_id: "DOC-001",
      email: "dr.sharma@hospital.com",
    },
  },
  wardman: {
    password: "Ward@2024",
    user: {
      username: "wardman",
      full_name: "Suresh Kumar",
      role: "wardman",
      department: "Ward Operations",
      employee_id: "WRD-001",
      email: "suresh.kumar@hospital.com",
    },
  },
};

// ─── Initial ward state — IDs match 3D map WARD_CONFIG ────────────────────────
export const INITIAL_WARDS: WardStatus[] = [
  { id: "isolation",  name: "Isolation",      anomalyScore: 0.92, isAlert: true,  floor: 2, patients: 3,  infections: 3 },
  { id: "icu_2",      name: "ICU Ward 2",     anomalyScore: 0.88, isAlert: true,  floor: 1, patients: 6,  infections: 4 },
  { id: "icu_1",      name: "ICU Ward 1",     anomalyScore: 0.78, isAlert: true,  floor: 1, patients: 8,  infections: 2 },
  { id: "emergency",  name: "Emergency",      anomalyScore: 0.71, isAlert: true,  floor: 0, patients: 12, infections: 3 },
  { id: "cardiology", name: "Cardiology",     anomalyScore: 0.64, isAlert: true,  floor: 2, patients: 11, infections: 2 },
  { id: "nicu",       name: "NICU",           anomalyScore: 0.51, isAlert: false, floor: 1, patients: 4,  infections: 1 },
  { id: "oncology",   name: "Oncology",       anomalyScore: 0.43, isAlert: false, floor: 2, patients: 9,  infections: 1 },
  { id: "ward_a",     name: "General Ward A", anomalyScore: 0.36, isAlert: false, floor: 0, patients: 18, infections: 2 },
  { id: "radiology",  name: "Radiology",      anomalyScore: 0.29, isAlert: false, floor: 0, patients: 4,  infections: 1 },
  { id: "ward_b",     name: "General Ward B", anomalyScore: 0.26, isAlert: false, floor: 0, patients: 14, infections: 1 },
  { id: "surgery_1",  name: "Surgery OT-1",   anomalyScore: 0.20, isAlert: false, floor: 0, patients: 2,  infections: 0 },
  { id: "surgery_2",  name: "Surgery OT-2",   anomalyScore: 0.17, isAlert: false, floor: 1, patients: 1,  infections: 0 },
  { id: "pediatric",  name: "Pediatrics",     anomalyScore: 0.19, isAlert: false, floor: 1, patients: 10, infections: 0 },
  { id: "maternity",  name: "Maternity",      anomalyScore: 0.12, isAlert: false, floor: 1, patients: 7,  infections: 0 },
  { id: "neurology",  name: "Neurology",      anomalyScore: 0.16, isAlert: false, floor: 2, patients: 5,  infections: 0 },
];

// ─── Initial alert queue ──────────────────────────────────────────────────────
export const INITIAL_ALERTS: MockAlert[] = [
  {
    id: "a1", wardId: "isolation",  wardName: "Isolation",
    severity: "critical", type: "outbreak",
    message: "Outbreak detected: C. difficile cluster spreading",
    organism: "Clostridium difficile",
    timestamp: Date.now() - 480_000, resolved: false,
  },
  {
    id: "a2", wardId: "icu_2", wardName: "ICU Ward 2",
    severity: "critical", type: "resistance",
    message: "Antibiotic-resistant MRSA identified — isolation required",
    organism: "MRSA",
    timestamp: Date.now() - 720_000, resolved: false,
  },
  {
    id: "a3", wardId: "icu_1", wardName: "ICU Ward 1",
    severity: "critical", type: "cluster",
    message: "HAI cluster: 2 confirmed CLABSI cases in 24h",
    organism: "Staphylococcus aureus",
    timestamp: Date.now() - 1_200_000, resolved: false,
  },
  {
    id: "a4", wardId: "emergency", wardName: "Emergency",
    severity: "critical", type: "positivity",
    message: "Test positivity rate exceeds 30% threshold",
    timestamp: Date.now() - 1_800_000, resolved: false,
  },
  {
    id: "a5", wardId: "cardiology", wardName: "Cardiology",
    severity: "warning", type: "onset",
    message: "Elevated infection onset rate — monitor closely",
    timestamp: Date.now() - 2_400_000, resolved: false,
  },
];

// ─── DISHA-compliant synthetic patient records ────────────────────────────────
export interface DISHAPatient {
  record_id: string;
  patient_id: string;
  ward_id: string;
  ward_name: string;
  infection_type: string | null;
  risk_score: number;
  isolation_forest_flag: boolean;
  specimen_type: string;
  organism: string | null;
  antibiotic_resistant: boolean;
  status: "suspected" | "confirmed" | "resolved";
  severity: "mild" | "moderate" | "severe";
  data_consent: boolean;
  data_encrypted: boolean;
}

export const MOCK_PATIENTS: DISHAPatient[] = [
  { record_id:"r001", patient_id:"PAT-A7B2C3", ward_id:"icu_2",      ward_name:"ICU Ward 2",      infection_type:"CLABSI",  risk_score:0.91, isolation_forest_flag:true,  specimen_type:"Blood",  organism:"MRSA",                      antibiotic_resistant:true,  status:"confirmed", severity:"severe",   data_consent:true, data_encrypted:true },
  { record_id:"r002", patient_id:"PAT-D4E5F6", ward_id:"isolation",  ward_name:"Isolation",       infection_type:"HAP",     risk_score:0.88, isolation_forest_flag:true,  specimen_type:"Sputum", organism:"Pseudomonas aeruginosa",     antibiotic_resistant:true,  status:"confirmed", severity:"severe",   data_consent:true, data_encrypted:true },
  { record_id:"r003", patient_id:"PAT-G7H8I9", ward_id:"emergency",  ward_name:"Emergency",       infection_type:"SSI",     risk_score:0.74, isolation_forest_flag:true,  specimen_type:"Wound",  organism:"Staphylococcus aureus",      antibiotic_resistant:false, status:"confirmed", severity:"moderate", data_consent:true, data_encrypted:true },
  { record_id:"r004", patient_id:"PAT-J1K2L3", ward_id:"cardiology", ward_name:"Cardiology",      infection_type:"UTI",     risk_score:0.66, isolation_forest_flag:true,  specimen_type:"Urine",  organism:"Enterococcus faecium",       antibiotic_resistant:false, status:"suspected", severity:"moderate", data_consent:true, data_encrypted:true },
  { record_id:"r005", patient_id:"PAT-M4N5O6", ward_id:"nicu",       ward_name:"NICU",            infection_type:"CLABSI",  risk_score:0.53, isolation_forest_flag:false, specimen_type:"Blood",  organism:"Candida auris",              antibiotic_resistant:true,  status:"suspected", severity:"severe",   data_consent:true, data_encrypted:true },
  { record_id:"r006", patient_id:"PAT-P7Q8R9", ward_id:"oncology",   ward_name:"Oncology",        infection_type:"HAP",     risk_score:0.44, isolation_forest_flag:false, specimen_type:"Sputum", organism:"Acinetobacter baumannii",    antibiotic_resistant:true,  status:"suspected", severity:"moderate", data_consent:true, data_encrypted:true },
  { record_id:"r007", patient_id:"PAT-S1T2U3", ward_id:"ward_a",     ward_name:"General Ward A",  infection_type:"UTI",     risk_score:0.38, isolation_forest_flag:false, specimen_type:"Urine",  organism:"Escherichia coli",           antibiotic_resistant:false, status:"confirmed", severity:"mild",     data_consent:true, data_encrypted:true },
  { record_id:"r008", patient_id:"PAT-V4W5X6", ward_id:"ward_b",     ward_name:"General Ward B",  infection_type:null,      risk_score:0.22, isolation_forest_flag:false, specimen_type:"Blood",  organism:null,                         antibiotic_resistant:false, status:"resolved",  severity:"mild",     data_consent:true, data_encrypted:true },
  { record_id:"r009", patient_id:"PAT-Y7Z8A9", ward_id:"radiology",  ward_name:"Radiology",       infection_type:"SSI",     risk_score:0.31, isolation_forest_flag:false, specimen_type:"Wound",  organism:"Clostridium difficile",      antibiotic_resistant:false, status:"suspected", severity:"mild",     data_consent:true, data_encrypted:true },
  { record_id:"r010", patient_id:"PAT-B1C2D3", ward_id:"surgery_1",  ward_name:"Surgery OT-1",    infection_type:null,      risk_score:0.18, isolation_forest_flag:false, specimen_type:"Blood",  organism:null,                         antibiotic_resistant:false, status:"resolved",  severity:"mild",     data_consent:true, data_encrypted:true },
];

// ─── Live simulation engine (replaces WebSocket) ──────────────────────────────
type SimCallback = (type: "update" | "alert", payload: unknown) => void;

const ALERT_MESSAGES = [
  { msg: "Outbreak detected: elevated positivity rate exceeds threshold",    type: "outbreak"    as const },
  { msg: "Antibiotic-resistant organism confirmed — contact precautions",    type: "resistance"  as const },
  { msg: "HAI cluster: multiple cases on same ward within 48 hours",         type: "cluster"     as const },
  { msg: "Lab positivity >25% — Isolation Forest flagged anomaly",           type: "positivity"  as const },
  { msg: "New infection onset detected within last 12 hours",                type: "onset"       as const },
];

const ORGANISMS = [
  "MRSA", "Pseudomonas aeruginosa", "Candida auris",
  "Clostridium difficile", "Acinetobacter baumannii", "Enterococcus faecium",
];

export function startSimulation(onEvent: SimCallback): () => void {
  const scores: Record<string, number> = {};
  INITIAL_WARDS.forEach(w => { scores[w.id] = w.anomalyScore; });

  // Every 6s: drift a random ward's score slightly
  const scoreTimer = setInterval(() => {
    const ward = INITIAL_WARDS[Math.floor(Math.random() * INITIAL_WARDS.length)];
    const drift = (Math.random() - 0.48) * 0.06;
    scores[ward.id] = Math.max(0.05, Math.min(0.98, scores[ward.id] + drift));
    const s = scores[ward.id];
    const status = s >= 0.6 ? "critical" : s >= 0.35 ? "warning" : "normal";
    onEvent("update", { wardId: ward.id, wardName: ward.name, status, score: s });
  }, 6000);

  // Every 22s: fire an alert from a high-risk ward
  const alertTimer = setInterval(() => {
    const critical = INITIAL_WARDS.filter(w => scores[w.id] >= 0.6);
    if (critical.length === 0) return;
    const ward = critical[Math.floor(Math.random() * critical.length)];
    const entry = ALERT_MESSAGES[Math.floor(Math.random() * ALERT_MESSAGES.length)];
    onEvent("alert", {
      id: `sim_${Date.now()}`,
      wardId: ward.id,
      wardName: ward.name,
      severity: "critical",
      type: entry.type,
      message: entry.msg,
      organism: ORGANISMS[Math.floor(Math.random() * ORGANISMS.length)],
      timestamp: Date.now(),
      resolved: false,
    });
  }, 22000);

  return () => {
    clearInterval(scoreTimer);
    clearInterval(alertTimer);
  };
}
