import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";

interface Alert {
  id: string;
  wardId: string;
  wardName: string;
  severity: "critical" | "warning" | "normal";
  message: string;
  timestamp: number;
  organism?: string;
  resolved: boolean;
  type: "outbreak" | "resistance" | "positivity" | "cluster" | "onset";
}

interface WardStat {
  wardId: string;
  wardName: string;
  floor: number;
  positivityRate: number;
  confirmedInfections: number;
  suspectedInfections: number;
  antibioticResistant: number;
  anomalyScore: number;
  status: "critical" | "warning" | "normal";
  patients: number;
  trend: "up" | "down" | "stable";
}

const HOURLY_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}:00`,
  infections: Math.floor(Math.random() * 8 + 2),
  alerts: Math.floor(Math.random() * 4),
  resolved: Math.floor(Math.random() * 6 + 1),
  positivity: parseFloat((Math.random() * 25 + 5).toFixed(1)),
}));

const WEEKLY_DATA = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => ({
  day,
  icu: Math.floor(Math.random() * 5 + 3),
  general: Math.floor(Math.random() * 3 + 1),
  surgery: Math.floor(Math.random() * 2),
  emergency: Math.floor(Math.random() * 4 + 2),
}));

const ORGANISM_DATA = [
  { name: "MRSA",           count: 12, color: "#C62828" },
  { name: "E. coli",        count: 9,  color: "#E65100" },
  { name: "K. pneumoniae",  count: 7,  color: "#6A1B9A" },
  { name: "P. aeruginosa",  count: 5,  color: "#AD1457" },
  { name: "C. diff",        count: 4,  color: "#00695C" },
  { name: "Acinetobacter",  count: 3,  color: "#1565C0" },
];

const WARD_STATS: WardStat[] = [
  { wardId: "icu_2",      wardName: "ICU Ward 2",    floor: 1, positivityRate: 48, confirmedInfections: 4, suspectedInfections: 2, antibioticResistant: 3, anomalyScore: 0.89, status: "critical", patients: 6,  trend: "up" },
  { wardId: "emergency",  wardName: "Emergency",     floor: 0, positivityRate: 34, confirmedInfections: 3, suspectedInfections: 4, antibioticResistant: 1, anomalyScore: 0.73, status: "critical", patients: 12, trend: "up" },
  { wardId: "isolation",  wardName: "Isolation",     floor: 2, positivityRate: 67, confirmedInfections: 3, suspectedInfections: 1, antibioticResistant: 3, anomalyScore: 0.91, status: "critical", patients: 3,  trend: "stable" },
  { wardId: "cardiology", wardName: "Cardiology",    floor: 2, positivityRate: 22, confirmedInfections: 2, suspectedInfections: 3, antibioticResistant: 0, anomalyScore: 0.61, status: "warning",  patients: 11, trend: "up" },
  { wardId: "oncology",   wardName: "Oncology",      floor: 2, positivityRate: 18, confirmedInfections: 1, suspectedInfections: 2, antibioticResistant: 1, anomalyScore: 0.54, status: "warning",  patients: 9,  trend: "down" },
  { wardId: "surgery_1",  wardName: "Surgery OT-1",  floor: 0, positivityRate: 12, confirmedInfections: 0, suspectedInfections: 1, antibioticResistant: 0, anomalyScore: 0.43, status: "warning",  patients: 2,  trend: "stable" },
  { wardId: "ward_a",     wardName: "General Ward A", floor: 0, positivityRate: 9, confirmedInfections: 2, suspectedInfections: 1, antibioticResistant: 0, anomalyScore: 0.38, status: "warning",  patients: 18, trend: "down" },
  { wardId: "icu_1",      wardName: "ICU Ward 1",    floor: 1, positivityRate: 7,  confirmedInfections: 2, suspectedInfections: 0, antibioticResistant: 0, anomalyScore: 0.31, status: "normal",   patients: 8,  trend: "down" },
  { wardId: "pediatric",  wardName: "Pediatrics",    floor: 1, positivityRate: 4,  confirmedInfections: 0, suspectedInfections: 1, antibioticResistant: 0, anomalyScore: 0.18, status: "normal",   patients: 10, trend: "stable" },
  { wardId: "radiology",  wardName: "Radiology",     floor: 0, positivityRate: 6,  confirmedInfections: 1, suspectedInfections: 0, antibioticResistant: 0, anomalyScore: 0.29, status: "normal",   patients: 4,  trend: "stable" },
];

const LIVE_ALERTS: Alert[] = [
  { id: "a1", wardId: "icu_2",      wardName: "ICU Ward 2",    severity: "critical", message: "MRSA outbreak detected — 4 confirmed cases",           timestamp: Date.now() - 120000,  organism: "MRSA",          resolved: false, type: "outbreak" },
  { id: "a2", wardId: "isolation",  wardName: "Isolation",     severity: "critical", message: "Antibiotic resistance pattern — 3 resistant strains",   timestamp: Date.now() - 300000,  organism: "K. pneumoniae", resolved: false, type: "resistance" },
  { id: "a3", wardId: "emergency",  wardName: "Emergency",     severity: "critical", message: "Positivity rate exceeded 30% threshold",                timestamp: Date.now() - 480000,  organism: "E. coli",       resolved: false, type: "positivity" },
  { id: "a4", wardId: "cardiology", wardName: "Cardiology",    severity: "warning",  message: "Organism clustering — same pathogen in 2 patients",     timestamp: Date.now() - 720000,  organism: "P. aeruginosa", resolved: false, type: "cluster" },
  { id: "a5", wardId: "oncology",   wardName: "Oncology",      severity: "warning",  message: "Recent infection onset — 2 cases in last 48 hours",     timestamp: Date.now() - 900000,  organism: "C. diff",       resolved: false, type: "onset" },
  { id: "a6", wardId: "ward_a",     wardName: "General Ward A",severity: "warning",  message: "Elevated positivity rate — monitor closely",            timestamp: Date.now() - 1200000, organism: "E. coli",       resolved: false, type: "positivity" },
  { id: "a7", wardId: "icu_1",      wardName: "ICU Ward 1",    severity: "normal",   message: "Infection resolved — patient discharged",               timestamp: Date.now() - 1800000, organism: undefined,       resolved: true,  type: "onset" },
  { id: "a8", wardId: "pediatric",  wardName: "Pediatrics",    severity: "normal",   message: "Routine check complete — no anomalies detected",        timestamp: Date.now() - 2400000, organism: undefined,       resolved: true,  type: "cluster" },
];

const RADAR_DATA = [
  { metric: "Positivity", score: 78 },
  { metric: "Resistance", score: 62 },
  { metric: "Clustering", score: 45 },
  { metric: "Severity",   score: 83 },
  { metric: "Onset Speed", score: 55 },
  { metric: "Spread Risk", score: 70 },
];

const DOCTOR_CONTACT = {
  name: "Dr. On-Call Specialist",
  phone: "+91 6367690519",
  role: "Infection Control Officer",
};

const SOLUTIONS: Record<Alert["type"], { title: string; steps: string[] }> = {
  outbreak: {
    title: "Outbreak Response Protocol",
    steps: [
      "Initiate strict contact and droplet precautions immediately.",
      "Collect new cultures from all close-contact patients.",
      "Notify the Infection Control Officer and Ward Medical Officer.",
      "Cohort affected patients to a separate bay or room.",
      "Audit hand hygiene and PPE compliance in the ward.",
    ],
  },
  resistance: {
    title: "Antimicrobial Resistance Protocol",
    steps: [
      "Switch to susceptibility-guided antimicrobial therapy.",
      "Consult Microbiology for targeted treatment options.",
      "Review and update the ward antibiogram immediately.",
      "Restrict empirical broad-spectrum antibiotic use.",
      "Flag all resistant isolates for Infection Control review.",
    ],
  },
  positivity: {
    title: "High Positivity Rate Protocol",
    steps: [
      "Increase active surveillance testing across the ward.",
      "Audit hand hygiene compliance and cleaning schedules.",
      "Review and reinforce disinfection protocols.",
      "Consider environmental sampling of high-touch surfaces.",
      "Brief all ward staff on enhanced precaution measures.",
    ],
  },
  cluster: {
    title: "Cluster Investigation Protocol",
    steps: [
      "Investigate common source (shared procedure, device, or staff).",
      "Request whole-genome sequencing if available.",
      "Restrict cross-ward staff movement temporarily.",
      "Review all invasive devices and procedures in the cluster.",
      "Notify the Epidemiology department for formal investigation.",
    ],
  },
  onset: {
    title: "New Infection Onset Protocol",
    steps: [
      "Confirm HAI classification using admission vs. onset date.",
      "Review catheter, ventilator, and IV line insertion days.",
      "Escalate management for immunocompromised patients.",
      "Document and report in the HAI surveillance register.",
      "Schedule follow-up cultures at 48-hour intervals.",
    ],
  },
};

const SEV_COLOR = { critical: "#C62828", warning: "#E65100", normal: "#2E7D32" };
const SEV_BG    = { critical: "#FFEBEE", warning: "#FFF3E0", normal: "#E8F5E9" };
const SEV_BORDER = { critical: "#EF9A9A", warning: "#FFCC80", normal: "#A5D6A7" };

function timeAgo(ts: number) {
  const d = Date.now() - ts;
  if (d < 60000) return `${Math.floor(d / 1000)}s ago`;
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  return `${Math.floor(d / 3600000)}h ago`;
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#FFFFFF", border: "1px solid #E0E0E0",
      borderRadius: 8, padding: "8px 12px", fontSize: 11,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    }}>
      <div style={{ color: "#607D8B", marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color, marginTop: 2 }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

function SectionHeader({ label, count, accent = "#1565C0" }: { label: string; count?: number | string; accent?: string }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #ECEFF1",
    }}>
      <span style={{ fontSize: 10, color: accent, letterSpacing: 1.5, fontWeight: 700, textTransform: "uppercase" }}>{label}</span>
      {count !== undefined && (
        <span style={{
          fontSize: 10, color: accent, background: `${accent}14`,
          border: `1px solid ${accent}33`, padding: "2px 8px",
          borderRadius: 4, fontWeight: 700,
        }}>{count}</span>
      )}
    </div>
  );
}

function AlertRow({ alert, onSelect, isSelected }: { alert: Alert; onSelect: () => void; isSelected: boolean }) {
  const [hovered, setHovered] = useState(false);
  const c = SEV_COLOR[alert.severity];
  const bg = SEV_BG[alert.severity];
  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "10px 12px 10px 14px", borderRadius: 8, cursor: "pointer",
        background: isSelected ? bg : hovered ? "#F8FAFC" : "transparent",
        border: `1px solid ${isSelected ? c + "44" : hovered ? "#E0E0E0" : "transparent"}`,
        transition: "all 0.15s", position: "relative",
        marginBottom: 4,
      }}
    >
      <div style={{
        position: "absolute", left: 0, top: "15%", bottom: "15%", width: 3,
        background: alert.resolved ? "#A5D6A7" : c, borderRadius: "0 2px 2px 0",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#1A2332" }}>{alert.wardName}</span>
            {alert.resolved && (
              <span style={{ fontSize: 9, color: "#2E7D32", background: "#E8F5E9", border: "1px solid #A5D6A7", padding: "1px 6px", borderRadius: 3, fontWeight: 700 }}>
                RESOLVED
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "#546E7A", lineHeight: 1.5 }}>{alert.message}</div>
          {alert.organism && (
            <span style={{ marginTop: 5, display: "inline-block", fontSize: 10, color: c, background: SEV_BG[alert.severity], border: `1px solid ${c}33`, borderRadius: 4, padding: "2px 7px", fontWeight: 600 }}>
              {alert.organism}
            </span>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
          <div style={{ fontSize: 10, color: "#90A4AE" }}>{timeAgo(alert.timestamp)}</div>
          <div style={{
            marginTop: 4, fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
            color: c, background: SEV_BG[alert.severity],
            border: `1px solid ${c}33`,
            padding: "2px 6px", borderRadius: 3,
          }}>{alert.severity.toUpperCase()}</div>
        </div>
      </div>
    </div>
  );
}

function WardStatRow({ ward }: { ward: WardStat }) {
  const [hovered, setHovered] = useState(false);
  const c = SEV_COLOR[ward.status];
  const trendColor = ward.trend === "up" ? "#C62828" : ward.trend === "down" ? "#2E7D32" : "#E65100";
  const trendIcon = ward.trend === "up" ? "↑" : ward.trend === "down" ? "↓" : "→";
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid", gridTemplateColumns: "1fr 60px 60px 60px 60px 56px",
        alignItems: "center", gap: 8,
        padding: "8px 12px", borderRadius: 8,
        background: hovered ? "#F8FAFC" : "transparent",
        border: `1px solid ${hovered ? "#E0E0E0" : "transparent"}`,
        transition: "all 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: c, flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: "#1A2332", fontWeight: 500 }}>{ward.wardName}</span>
        <span style={{ fontSize: 9, color: "#90A4AE" }}>F{ward.floor}</span>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: ward.positivityRate > 20 ? "#C62828" : ward.positivityRate > 10 ? "#E65100" : "#2E7D32" }}>
          {ward.positivityRate}%
        </div>
        <div style={{ fontSize: 9, color: "#90A4AE" }}>POS RATE</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: ward.confirmedInfections > 0 ? "#C62828" : "#90A4AE" }}>
          {ward.confirmedInfections}
        </div>
        <div style={{ fontSize: 9, color: "#90A4AE" }}>CONFIRMED</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: ward.antibioticResistant > 0 ? "#6A1B9A" : "#90A4AE" }}>
          {ward.antibioticResistant}
        </div>
        <div style={{ fontSize: 9, color: "#90A4AE" }}>RESISTANT</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#1565C0" }}>{ward.patients}</div>
        <div style={{ fontSize: 9, color: "#90A4AE" }}>PATIENTS</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end" }}>
        <div style={{ height: 4, width: 36, background: "#ECEFF1", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${ward.anomalyScore * 100}%`, background: c, borderRadius: 2 }} />
        </div>
        <span style={{ fontSize: 11, color: trendColor, fontWeight: 700 }}>{trendIcon}</span>
      </div>
    </div>
  );
}

function DoctorContactCard() {
  return (
    <div style={{
      background: "#FFEBEE", border: "1.5px solid #EF9A9A",
      borderRadius: 10, padding: "12px 16px", marginBottom: 14,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#C62828", animation: "pulse-dot 1s infinite" }} />
        <span style={{ fontSize: 11, fontWeight: 800, color: "#C62828", letterSpacing: 0.5 }}>CRITICAL — CONTACT DOCTOR IMMEDIATELY</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1A2332" }}>{DOCTOR_CONTACT.name}</div>
          <div style={{ fontSize: 11, color: "#607D8B" }}>{DOCTOR_CONTACT.role}</div>
        </div>
        <a
          href={`tel:${DOCTOR_CONTACT.phone}`}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            background: "#C62828", color: "#FFFFFF",
            borderRadius: 8, padding: "8px 14px",
            textDecoration: "none", fontSize: 13, fontWeight: 700,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
          </svg>
          {DOCTOR_CONTACT.phone}
        </a>
      </div>
    </div>
  );
}

function AlertDetail({ alert }: { alert: Alert }) {
  const solution = SOLUTIONS[alert.type];
  const c = SEV_COLOR[alert.severity];
  const isCritical = alert.severity === "critical";

  return (
    <div style={{ padding: "14px", overflowY: "auto", height: "100%" }}>
      {isCritical && !alert.resolved && <DoctorContactCard />}

      <div style={{
        background: SEV_BG[alert.severity], border: `1px solid ${SEV_BORDER[alert.severity]}`,
        borderRadius: 10, padding: "14px 16px", marginBottom: 14,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#1A2332" }}>{alert.wardName}</div>
            <div style={{ fontSize: 10, color: "#90A4AE", marginTop: 2 }}>{timeAgo(alert.timestamp)}</div>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, color: c,
            background: "#FFFFFF", border: `1px solid ${c}44`,
            padding: "3px 8px", borderRadius: 4,
          }}>
            {alert.severity.toUpperCase()}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "#1A2332", lineHeight: 1.6, marginBottom: alert.organism ? 8 : 0 }}>
          {alert.message}
        </div>
        {alert.organism && (
          <div style={{ fontSize: 11, color: c, fontWeight: 700 }}>
            Pathogen: {alert.organism}
          </div>
        )}
      </div>

      <div style={{
        background: "#FFFFFF", border: "1px solid #E3F2FD",
        borderRadius: 10, padding: "14px 16px", marginBottom: 14,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#1565C0", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {solution.title}
        </div>
        <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 7 }}>
          {solution.steps.map((step, i) => (
            <li key={i} style={{ fontSize: 12, color: "#1A2332", lineHeight: 1.6 }}>{step}</li>
          ))}
        </ol>
      </div>

      <div style={{
        background: "#F8FAFC", border: "1px solid #ECEFF1",
        borderRadius: 10, padding: "12px 16px",
      }}>
        <div style={{ fontSize: 10, color: "#90A4AE", fontWeight: 700, letterSpacing: 0.5, marginBottom: 10 }}>WARD METRICS</div>
        {(() => {
          const w = WARD_STATS.find(s => s.wardId === alert.wardId);
          if (!w) return <div style={{ fontSize: 11, color: "#90A4AE" }}>No ward data available.</div>;
          return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Positivity Rate", val: `${w.positivityRate}%`, color: w.positivityRate > 20 ? "#C62828" : "#2E7D32" },
                { label: "Confirmed HAI", val: w.confirmedInfections, color: w.confirmedInfections > 0 ? "#C62828" : "#2E7D32" },
                { label: "Resistant Strains", val: w.antibioticResistant, color: w.antibioticResistant > 0 ? "#6A1B9A" : "#2E7D32" },
                { label: "Patients", val: w.patients, color: "#1565C0" },
              ].map(m => (
                <div key={m.label} style={{ background: "#FFFFFF", borderRadius: 8, padding: "8px 10px", border: "1px solid #ECEFF1" }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: m.color }}>{m.val}</div>
                  <div style={{ fontSize: 9, color: "#90A4AE", marginTop: 2 }}>{m.label}</div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

const AlertDashboard: React.FC = () => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(LIVE_ALERTS[0]);
  const [activeTab, setActiveTab] = useState<"live" | "history">("live");
  const [timeRange, setTimeRange] = useState<"24h" | "7d">("24h");
  const [time, setTime] = useState(new Date());
  const [newAlert, setNewAlert] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setNewAlert(true);
      setTimeout(() => setNewAlert(false), 3000);
    }, 12000);
    return () => clearInterval(t);
  }, []);

  const liveAlerts     = LIVE_ALERTS.filter(a => !a.resolved);
  const resolvedAlerts = LIVE_ALERTS.filter(a => a.resolved);
  const critCount      = liveAlerts.filter(a => a.severity === "critical").length;
  const warnCount      = liveAlerts.filter(a => a.severity === "warning").length;
  const totalPatients  = WARD_STATS.reduce((s, w) => s + w.patients, 0);
  const totalHAI       = WARD_STATS.reduce((s, w) => s + w.confirmedInfections, 0);

  return (
    <div style={{
      height: "100%", width: "100%",
      background: "#F0F4F8", color: "#1A2332",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>

      {/* TOP BAR */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", height: 50, flexShrink: 0,
        borderBottom: "1px solid #E0E0E0",
        background: "#FFFFFF",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1A2332" }}>Alert Intelligence Dashboard</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFEBEE", border: "1px solid #EF9A9A", borderRadius: 6, padding: "3px 10px" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C62828", display: "inline-block" }} />
            <span style={{ fontSize: 11, color: "#C62828", fontWeight: 700 }}>{critCount} Critical Active</span>
          </div>
          <AnimatePresence>
            {newAlert && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                style={{
                  background: "#FFEBEE", border: "1px solid #EF9A9A",
                  borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#C62828", fontWeight: 700,
                }}
              >
                New Alert Incoming
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {[
            { label: "Critical",  val: critCount,     color: "#C62828" },
            { label: "Warning",   val: warnCount,     color: "#E65100" },
            { label: "Patients",  val: totalPatients, color: "#1565C0" },
            { label: "HAI Today", val: totalHAI,      color: "#6A1B9A" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "right" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 9, color: "#90A4AE", letterSpacing: 0.5 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
          <div style={{
            fontSize: 12, fontWeight: 700, color: "#1565C0",
            background: "#E3F2FD", border: "1px solid #90CAF9",
            borderRadius: 6, padding: "4px 10px",
          }}>
            {time.toLocaleTimeString("en-IN", { hour12: false })}
          </div>
        </div>
      </div>

      {/* MAIN 3-COL GRID */}
      <div style={{
        flex: 1, display: "grid",
        gridTemplateColumns: "280px 1fr 300px",
        overflow: "hidden", minHeight: 0,
      }}>

        {/* COL 1: ALERTS FEED */}
        <div style={{
          borderRight: "1px solid #E0E0E0",
          display: "flex", flexDirection: "column", overflow: "hidden",
          background: "#FFFFFF",
        }}>
          <div style={{ display: "flex", borderBottom: "1px solid #ECEFF1", flexShrink: 0 }}>
            {(["live", "history"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: "11px 0", fontSize: 11, fontWeight: 700,
                  letterSpacing: 0.5, cursor: "pointer",
                  border: "none", background: "transparent",
                  color: activeTab === tab ? "#1565C0" : "#90A4AE",
                  borderBottom: activeTab === tab ? "2px solid #1565C0" : "2px solid transparent",
                  transition: "all 0.2s", fontFamily: "inherit",
                  textTransform: "uppercase",
                }}
              >
                {tab === "live" ? `Live (${liveAlerts.length})` : `Resolved (${resolvedAlerts.length})`}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
            {(activeTab === "live" ? liveAlerts : resolvedAlerts).map(alert => (
              <AlertRow
                key={alert.id}
                alert={alert}
                isSelected={selectedAlert?.id === alert.id}
                onSelect={() => setSelectedAlert(alert)}
              />
            ))}
          </div>
        </div>

        {/* COL 2: CHARTS + WARD TABLE */}
        <div style={{ overflow: "hidden auto", padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#607D8B", fontWeight: 700, letterSpacing: 0.5 }}>TEMPORAL ANALYSIS</span>
            <div style={{
              display: "flex", gap: 0, background: "#F5F5F5",
              border: "1px solid #E0E0E0", borderRadius: 7, overflow: "hidden",
            }}>
              {(["24h", "7d"] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  style={{
                    padding: "6px 16px", fontSize: 11, fontWeight: 600,
                    border: "none", cursor: "pointer", fontFamily: "inherit",
                    background: timeRange === r ? "#1565C0" : "transparent",
                    color: timeRange === r ? "#FFFFFF" : "#90A4AE",
                    transition: "all 0.2s",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Area chart */}
          <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #ECEFF1", padding: "14px 16px" }}>
            <SectionHeader label="Infections Over Time" accent="#1565C0" />
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={timeRange === "24h" ? HOURLY_DATA : WEEKLY_DATA.map(d => ({ ...d, infections: d.icu + d.general + d.surgery + d.emergency, alerts: d.icu }))}>
                <defs>
                  <linearGradient id="infGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1565C0" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#1565C0" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="altGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C62828" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#C62828" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey={timeRange === "24h" ? "hour" : "day"} tick={{ fill: "#90A4AE", fontSize: 9 }} tickLine={false} axisLine={{ stroke: "#ECEFF1" }} interval={timeRange === "24h" ? 3 : 0} />
                <YAxis tick={{ fill: "#90A4AE", fontSize: 9 }} tickLine={false} axisLine={false} width={24} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="infections" name="Infections" stroke="#1565C0" strokeWidth={2} fill="url(#infGrad)" />
                <Area type="monotone" dataKey="alerts" name="Alerts" stroke="#C62828" strokeWidth={1.5} fill="url(#altGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bar + Radar row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #ECEFF1", padding: "14px 16px" }}>
              <SectionHeader label="Pathogen Distribution" accent="#6A1B9A" />
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={ORGANISM_DATA} layout="vertical" barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#90A4AE", fontSize: 9 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#546E7A", fontSize: 9 }} tickLine={false} axisLine={false} width={80} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Cases" radius={[0, 4, 4, 0]}>
                    {ORGANISM_DATA.map((entry, index) => (
                      <rect key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #ECEFF1", padding: "14px 16px" }}>
              <SectionHeader label="Risk Radar" accent="#C62828" />
              <ResponsiveContainer width="100%" height={120}>
                <RadarChart data={RADAR_DATA}>
                  <PolarGrid stroke="#ECEFF1" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "#90A4AE", fontSize: 8 }} />
                  <Radar name="Risk" dataKey="score" stroke="#C62828" fill="#C62828" fillOpacity={0.12} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ward table */}
          <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #ECEFF1", padding: "14px 16px", flex: 1 }}>
            <SectionHeader label="Ward Status Table" count={WARD_STATS.length} accent="#1565C0" />
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 60px 60px 60px 60px 56px",
              gap: 8, padding: "4px 12px 8px", marginBottom: 4,
            }}>
              {["Ward", "Pos. Rate", "Confirmed", "Resistant", "Patients", "Score"].map(h => (
                <div key={h} style={{ fontSize: 9, color: "#90A4AE", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, textAlign: h === "Ward" ? "left" : "right" }}>{h}</div>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {WARD_STATS.map(ward => <WardStatRow key={ward.wardId} ward={ward} />)}
            </div>
          </div>
        </div>

        {/* COL 3: ALERT DETAIL */}
        <div style={{
          borderLeft: "1px solid #E0E0E0",
          background: "#FFFFFF",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid #ECEFF1", flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#607D8B", letterSpacing: 0.5, textTransform: "uppercase" }}>Alert Detail</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {selectedAlert
              ? <AlertDetail alert={selectedAlert} />
              : <div style={{ padding: 20, fontSize: 12, color: "#90A4AE", textAlign: "center", marginTop: 40 }}>Select an alert to view details</div>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDashboard;
