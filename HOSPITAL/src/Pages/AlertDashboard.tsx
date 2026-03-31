import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Mock historical data ─────────────────────────────────────────────────────
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
  { name: "MRSA",        count: 12, color: "#ff0040" },
  { name: "E. coli",     count: 9,  color: "#ffaa00" },
  { name: "K. pneumoniae", count: 7, color: "#8800ff" },
  { name: "P. aeruginosa", count: 5, color: "#ff00ff" },
  { name: "C. diff",     count: 4,  color: "#ff6600" },
  { name: "Acinetobacter", count: 3, color: "#00ffff" },
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
  { id: "a1", wardId: "icu_2",     wardName: "ICU Ward 2",   severity: "critical", message: "MRSA outbreak detected — 4 confirmed cases",            timestamp: Date.now() - 120000,  organism: "MRSA",              resolved: false, type: "outbreak" },
  { id: "a2", wardId: "isolation", wardName: "Isolation",    severity: "critical", message: "Antibiotic resistance pattern — 3 resistant strains",    timestamp: Date.now() - 300000,  organism: "K. pneumoniae",     resolved: false, type: "resistance" },
  { id: "a3", wardId: "emergency", wardName: "Emergency",    severity: "critical", message: "Positivity rate exceeded 30% threshold",                 timestamp: Date.now() - 480000,  organism: "E. coli",           resolved: false, type: "positivity" },
  { id: "a4", wardId: "cardiology",wardName: "Cardiology",   severity: "warning",  message: "Organism clustering — same pathogen in 2 patients",      timestamp: Date.now() - 720000,  organism: "P. aeruginosa",     resolved: false, type: "cluster" },
  { id: "a5", wardId: "oncology",  wardName: "Oncology",     severity: "warning",  message: "Recent infection onset — 2 cases in last 48 hours",      timestamp: Date.now() - 900000,  organism: "C. diff",           resolved: false, type: "onset" },
  { id: "a6", wardId: "ward_a",    wardName: "General Ward A",severity:"warning",  message: "Elevated positivity rate — monitor closely",             timestamp: Date.now() - 1200000, organism: "E. coli",           resolved: false, type: "positivity" },
  { id: "a7", wardId: "icu_1",     wardName: "ICU Ward 1",   severity: "normal",   message: "Infection resolved — patient discharged",                timestamp: Date.now() - 1800000, organism: undefined,           resolved: true,  type: "onset" },
  { id: "a8", wardId: "pediatric", wardName: "Pediatrics",   severity: "normal",   message: "Routine check complete — no anomalies detected",         timestamp: Date.now() - 2400000, organism: undefined,           resolved: true,  type: "cluster" },
];

const RADAR_DATA = [
  { metric: "Positivity", score: 78 },
  { metric: "Resistance", score: 62 },
  { metric: "Clustering", score: 45 },
  { metric: "Severity",   score: 83 },
  { metric: "Onset Speed", score: 55 },
  { metric: "Spread Risk", score: 70 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SEV_COLOR = { critical: "#ff0040", warning: "#ffaa00", normal: "#00ff41" };
const SEV_BG    = { critical: "rgba(255,0,64,0.08)", warning: "rgba(255,170,0,0.08)", normal: "rgba(0,255,65,0.06)" };
const TYPE_ICON = { outbreak: "⬡", resistance: "◆", positivity: "▲", cluster: "◉", onset: "◈" };

function timeAgo(ts: number) {
  const d = Date.now() - ts;
  if (d < 60000)  return `${Math.floor(d / 1000)}s ago`;
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  return `${Math.floor(d / 3600000)}h ago`;
}

function statusIcon(trend: string) {
  if (trend === "up")   return { icon: "↑", color: "#ff0040" };
  if (trend === "down") return { icon: "↓", color: "#00ff41" };
  return { icon: "→", color: "#ffaa00" };
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(2,8,18,0.95)", border: "1px solid rgba(0,212,255,0.2)",
      borderRadius: 8, padding: "8px 12px", fontFamily: "monospace", fontSize: 11,
    }}>
      <div style={{ color: "#00d4ff", marginBottom: 4, letterSpacing: 1 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color, marginTop: 2 }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ label, count, accent = "#00d4ff" }: { label: string; count?: number | string; accent?: string }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid rgba(0,212,255,0.08)",
    }}>
      <span style={{ fontSize: 9, color: accent, letterSpacing: 2, fontWeight: 700 }}>{label}</span>
      {count !== undefined && (
        <span style={{
          fontSize: 9, color: accent, background: `${accent}12`,
          border: `1px solid ${accent}33`, padding: "2px 8px",
          borderRadius: 4, fontWeight: 700,
        }}>{count}</span>
      )}
    </div>
  );
}

// ─── Alert row ────────────────────────────────────────────────────────────────
function AlertRow({ alert, onSelect, isSelected }: { alert: Alert; onSelect: () => void; isSelected: boolean }) {
  const [hovered, setHovered] = useState(false);
  const c = SEV_COLOR[alert.severity];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "10px 12px", borderRadius: 10, cursor: "pointer",
        background: isSelected ? `${c}10` : hovered ? "rgba(255,255,255,0.02)" : "transparent",
        border: `1px solid ${isSelected ? c + "44" : hovered ? "rgba(255,255,255,0.07)" : "transparent"}`,
        transition: "all 0.18s ease", position: "relative", overflow: "hidden",
        marginBottom: 4,
      }}
    >
      {/* Severity bar */}
      {!alert.resolved && (
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: alert.severity === "critical" ? 1 : 2, repeat: Infinity }}
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
            background: c, borderRadius: "3px 0 0 3px",
            boxShadow: `0 0 8px ${c}`,
          }}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingLeft: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: c, opacity: 0.8 }}>{TYPE_ICON[alert.type]}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? "#e0eeff" : "#8899aa", fontFamily: "monospace" }}>
              {alert.wardName}
            </span>
            {alert.resolved && (
              <span style={{ fontSize: 8, color: "#00ff41", background: "rgba(0,255,65,0.1)", border: "1px solid rgba(0,255,65,0.2)", padding: "1px 5px", borderRadius: 3 }}>
                RESOLVED
              </span>
            )}
          </div>
          <div style={{ fontSize: 10, color: "#556677", lineHeight: 1.5, fontFamily: "monospace" }}>
            {alert.message}
          </div>
          {alert.organism && (
            <div style={{ marginTop: 4, fontSize: 9, color: c, background: `${c}0d`, border: `1px solid ${c}22`, borderRadius: 4, padding: "2px 6px", display: "inline-block", fontFamily: "monospace" }}>
              {alert.organism}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
          <div style={{ fontSize: 8, color: "#334455", fontFamily: "monospace" }}>{timeAgo(alert.timestamp)}</div>
          <div style={{
            marginTop: 4, fontSize: 7, fontWeight: 700, letterSpacing: 1,
            color: c, background: `${c}12`, border: `1px solid ${c}30`,
            padding: "2px 5px", borderRadius: 3, fontFamily: "monospace",
          }}>{alert.severity.toUpperCase()}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Ward stat row ────────────────────────────────────────────────────────────
function WardStatRow({ ward }: { ward: WardStat }) {
  const [hovered, setHovered] = useState(false);
  const c = SEV_COLOR[ward.status];
  const t = statusIcon(ward.trend);
  return (
    <motion.div
      layout
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid", gridTemplateColumns: "1fr 60px 60px 60px 60px 72px",
        alignItems: "center", gap: 8,
        padding: "8px 12px", borderRadius: 8,
        background: hovered ? "rgba(255,255,255,0.02)" : "transparent",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.06)" : "transparent"}`,
        transition: "all 0.18s",
        cursor: "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: c, boxShadow: `0 0 5px ${c}`, flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: "#8899aa", fontFamily: "monospace" }}>{ward.wardName}</span>
        <span style={{ fontSize: 8, color: "#334455", fontFamily: "monospace" }}>F{ward.floor}</span>
      </div>

      {/* Positivity */}
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: ward.positivityRate > 20 ? "#ff0040" : ward.positivityRate > 10 ? "#ffaa00" : "#00ff41", fontFamily: "monospace" }}>
          {ward.positivityRate}%
        </div>
        <div style={{ fontSize: 7, color: "#334455" }}>POS RATE</div>
      </div>

      {/* Confirmed */}
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: ward.confirmedInfections > 0 ? "#ff0040" : "#445566", fontFamily: "monospace" }}>
          {ward.confirmedInfections}
        </div>
        <div style={{ fontSize: 7, color: "#334455" }}>CONFIRMED</div>
      </div>

      {/* Resistant */}
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: ward.antibioticResistant > 0 ? "#ff00ff" : "#445566", fontFamily: "monospace" }}>
          {ward.antibioticResistant}
        </div>
        <div style={{ fontSize: 7, color: "#334455" }}>RESISTANT</div>
      </div>

      {/* Patients */}
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#00d4ff", fontFamily: "monospace" }}>{ward.patients}</div>
        <div style={{ fontSize: 7, color: "#334455" }}>PATIENTS</div>
      </div>

      {/* Score + trend */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
        <div style={{ height: 4, width: 50, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${ward.anomalyScore * 100}%`, background: c, boxShadow: `0 0 4px ${c}` }} />
        </div>
        <span style={{ fontSize: 10, color: t.color, fontFamily: "monospace" }}>{t.icon}</span>
      </div>
    </motion.div>
  );
}

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.15); border-radius: 3px; }
  @keyframes ping { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
`;

// ─── MAIN Dashboard ───────────────────────────────────────────────────────────
const AlertDashboard: React.FC = () => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(LIVE_ALERTS[0]);
  const [activeTab, setActiveTab]         = useState<"live" | "history">("live");
  const [timeRange, setTimeRange]         = useState<"24h" | "7d">("24h");
  const [time, setTime]                   = useState(new Date());
  const [newAlert, setNewAlert]           = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Simulate incoming alert
  useEffect(() => {
    const t = setInterval(() => {
      setNewAlert(true);
      setTimeout(() => setNewAlert(false), 3000);
    }, 12000);
    return () => clearInterval(t);
  }, []);

  const liveAlerts    = LIVE_ALERTS.filter(a => !a.resolved);
  const resolvedAlerts = LIVE_ALERTS.filter(a => a.resolved);
  const critCount     = liveAlerts.filter(a => a.severity === "critical").length;
  const warnCount     = liveAlerts.filter(a => a.severity === "warning").length;
  const totalPatients = WARD_STATS.reduce((s, w) => s + w.patients, 0);
  const totalHAI      = WARD_STATS.reduce((s, w) => s + w.confirmedInfections, 0);

  return (
    <>
      <style>{CSS}</style>
      <div style={{
        height: "100vh", width: "100%", background: "#020a14",
        color: "#e0eeff", fontFamily: "'JetBrains Mono', monospace",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>

        {/* ── TOP BAR ──────────────────────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px", height: 46, flexShrink: 0,
          borderBottom: "1px solid rgba(0,212,255,0.1)",
          background: "rgba(2,8,18,0.97)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#e0eeff" }}>
              Code<span style={{ color: "#00d4ff" }}>4</span>Care
            </span>
            <span style={{ color: "rgba(0,212,255,0.2)" }}>›</span>
            <span style={{ fontSize: 9, color: "#445566", letterSpacing: 2 }}>ALERT INTELLIGENCE DASHBOARD</span>
          </div>

          {/* New alert toast */}
          <AnimatePresence>
            {newAlert && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  background: "rgba(255,0,64,0.12)", border: "1px solid rgba(255,0,64,0.4)",
                  borderRadius: 8, padding: "5px 14px", fontSize: 10, color: "#ff6080",
                  display: "flex", alignItems: "center", gap: 8, fontFamily: "monospace",
                }}
              >
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{ color: "#ff0040", fontSize: 14 }}
                >●</motion.span>
                NEW ALERT INCOMING
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {[
              { label: "CRITICAL", val: critCount, color: "#ff0040" },
              { label: "WARNING",  val: warnCount,  color: "#ffaa00" },
              { label: "PATIENTS", val: totalPatients, color: "#00d4ff" },
              { label: "HAI TODAY", val: totalHAI, color: "#ff00ff" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 7, color: "#334455", letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
            <div style={{
              fontSize: 11, fontWeight: 700, color: "#00d4ff",
              background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)",
              borderRadius: 6, padding: "4px 10px",
            }}>
              {time.toLocaleTimeString("en-IN", { hour12: false })}
            </div>
          </div>
        </div>

        {/* ── MAIN 3-COL GRID ──────────────────────────────────────── */}
        <div style={{
          flex: 1, display: "grid",
          gridTemplateColumns: "280px 1fr 300px",
          overflow: "hidden", minHeight: 0,
        }}>

          {/* ── COL 1: LIVE ALERTS FEED ──────────────────────────── */}
          <div style={{
            borderRight: "1px solid rgba(0,212,255,0.08)",
            display: "flex", flexDirection: "column", overflow: "hidden",
            background: "rgba(2,8,18,0.6)",
          }}>
            {/* Tab strip */}
            <div style={{
              display: "flex", borderBottom: "1px solid rgba(0,212,255,0.08)",
              flexShrink: 0,
            }}>
              {(["live", "history"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1, padding: "10px 0", fontSize: 9, fontWeight: 700,
                    letterSpacing: 2, fontFamily: "monospace", cursor: "pointer",
                    border: "none", background: "transparent",
                    color: activeTab === tab ? "#00d4ff" : "#334455",
                    borderBottom: activeTab === tab ? "2px solid #00d4ff" : "2px solid transparent",
                    transition: "all 0.2s",
                  }}
                >
                  {tab === "live" ? `LIVE (${liveAlerts.length})` : `RESOLVED (${resolvedAlerts.length})`}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
              <AnimatePresence>
                {(activeTab === "live" ? liveAlerts : resolvedAlerts).map(alert => (
                  <AlertRow
                    key={alert.id}
                    alert={alert}
                    isSelected={selectedAlert?.id === alert.id}
                    onSelect={() => setSelectedAlert(alert)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* ── COL 2: CHARTS + WARD TABLE ───────────────────────── */}
          <div style={{ overflow: "hidden auto", padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Time range toggle */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 9, color: "#334455", letterSpacing: 2 }}>TEMPORAL ANALYSIS</div>
              <div style={{
                display: "flex", gap: 0, background: "rgba(0,212,255,0.05)",
                border: "1px solid rgba(0,212,255,0.15)", borderRadius: 7, overflow: "hidden",
              }}>
                {(["24h", "7d"] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    style={{
                      padding: "5px 14px", fontSize: 9, fontWeight: 700, letterSpacing: 1,
                      fontFamily: "monospace", cursor: "pointer", border: "none",
                      background: timeRange === r ? "rgba(0,212,255,0.15)" : "transparent",
                      color: timeRange === r ? "#00d4ff" : "#445566",
                      transition: "all 0.2s",
                    }}
                  >{r}</button>
                ))}
              </div>
            </div>

            {/* Infection trend + alerts area chart */}
            <div style={{ background: "rgba(2,8,18,0.7)", border: "1px solid rgba(0,212,255,0.1)", borderRadius: 12, padding: "14px 16px" }}>
              <SectionHeader label="INFECTION EVENTS OVER TIME" />
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={timeRange === "24h" ? HOURLY_DATA : WEEKLY_DATA.map(d => ({ hour: d.day, infections: d.icu + d.general + d.surgery + d.emergency, alerts: d.emergency }))}>
                  <defs>
                    <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ff0040" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ff0040" stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ffaa00" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ffaa00" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey={timeRange === "24h" ? "hour" : "day"} tick={{ fill: "#334455", fontSize: 9, fontFamily: "monospace" }} tickLine={false} axisLine={false} interval={timeRange === "24h" ? 3 : 0} />
                  <YAxis tick={{ fill: "#334455", fontSize: 9, fontFamily: "monospace" }} tickLine={false} axisLine={false} width={24} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="infections" stroke="#ff0040" strokeWidth={1.5} fill="url(#gi)" name="Infections" />
                  <Area type="monotone" dataKey="alerts"     stroke="#ffaa00" strokeWidth={1.5} fill="url(#ga)" name="Alerts" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* 2-col chart row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {/* Ward breakdown bar */}
              <div style={{ background: "rgba(2,8,18,0.7)", border: "1px solid rgba(0,212,255,0.1)", borderRadius: 12, padding: "14px 16px" }}>
                <SectionHeader label="WARD BREAKDOWN" accent="#ffaa00" />
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={WEEKLY_DATA} barGap={2}>
                    <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: "#334455", fontSize: 8, fontFamily: "monospace" }} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="icu"       fill="#ff0040" radius={[2,2,0,0]} name="ICU"       maxBarSize={10} />
                    <Bar dataKey="emergency" fill="#ffaa00" radius={[2,2,0,0]} name="Emergency" maxBarSize={10} />
                    <Bar dataKey="general"   fill="#00ff41" radius={[2,2,0,0]} name="General"   maxBarSize={10} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Organism pie */}
              <div style={{ background: "rgba(2,8,18,0.7)", border: "1px solid rgba(0,212,255,0.1)", borderRadius: 12, padding: "14px 16px" }}>
                <SectionHeader label="TOP ORGANISMS" accent="#8800ff" />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {ORGANISM_DATA.map(o => (
                    <div key={o.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 9, color: o.color, width: 80, fontFamily: "monospace", flexShrink: 0 }}>{o.name}</span>
                      <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(o.count / 12) * 100}%`, background: o.color, borderRadius: 2, boxShadow: `0 0 4px ${o.color}` }} />
                      </div>
                      <span style={{ fontSize: 9, color: "#445566", width: 16, textAlign: "right", fontFamily: "monospace" }}>{o.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ward performance table */}
            <div style={{ background: "rgba(2,8,18,0.7)", border: "1px solid rgba(0,212,255,0.1)", borderRadius: 12, padding: "14px 0 8px" }}>
              <div style={{ padding: "0 16px" }}>
                <SectionHeader label="ALL WARDS · LIVE METRICS" count={`${WARD_STATS.length} wards`} />
              </div>

              {/* Column headers */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 60px 60px 60px 60px 72px",
                gap: 8, padding: "4px 12px 8px",
                fontSize: 7, color: "#334455", letterSpacing: 1,
                borderBottom: "1px solid rgba(0,212,255,0.06)",
              }}>
                <span>WARD</span>
                <span style={{ textAlign: "right" }}>POS %</span>
                <span style={{ textAlign: "right" }}>CONF</span>
                <span style={{ textAlign: "right" }}>RES</span>
                <span style={{ textAlign: "right" }}>PTS</span>
                <span style={{ textAlign: "right" }}>SCORE</span>
              </div>

              <div style={{ maxHeight: 240, overflowY: "auto", padding: "4px 0" }}>
                {[...WARD_STATS].sort((a, b) => b.anomalyScore - a.anomalyScore).map(ward => (
                  <WardStatRow key={ward.wardId} ward={ward} />
                ))}
              </div>
            </div>
          </div>

          {/* ── COL 3: SELECTED ALERT DETAIL + RADAR ────────────── */}
          <div style={{
            borderLeft: "1px solid rgba(0,212,255,0.08)",
            display: "flex", flexDirection: "column", overflow: "hidden auto",
            background: "rgba(2,8,18,0.5)", padding: "14px 12px", gap: 14,
          }}>

            {/* Alert detail */}
            <AnimatePresence mode="wait">
              {selectedAlert ? (
                <motion.div
                  key={selectedAlert.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <SectionHeader label="ALERT DETAIL" />
                  <div style={{
                    background: `${SEV_COLOR[selectedAlert.severity]}08`,
                    border: `1px solid ${SEV_COLOR[selectedAlert.severity]}33`,
                    borderRadius: 12, padding: 14,
                    boxShadow: `0 0 20px ${SEV_COLOR[selectedAlert.severity]}10`,
                  }}>
                    {/* Severity */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <motion.div
                        animate={!selectedAlert.resolved && selectedAlert.severity === "critical" ? { scale: [1, 1.08, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{
                          fontSize: 9, fontWeight: 800, letterSpacing: 2,
                          color: SEV_COLOR[selectedAlert.severity],
                          background: `${SEV_COLOR[selectedAlert.severity]}15`,
                          border: `1px solid ${SEV_COLOR[selectedAlert.severity]}44`,
                          borderRadius: 6, padding: "4px 10px",
                          boxShadow: selectedAlert.severity === "critical" ? `0 0 14px ${SEV_COLOR.critical}33` : "none",
                        }}
                      >
                        {selectedAlert.resolved ? "RESOLVED" : selectedAlert.severity.toUpperCase()}
                      </motion.div>
                      <span style={{ fontSize: 9, color: "#334455" }}>{timeAgo(selectedAlert.timestamp)}</span>
                    </div>

                    {/* Ward name */}
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#e0eeff", marginBottom: 6 }}>{selectedAlert.wardName}</div>
                    <div style={{ fontSize: 11, color: "#667788", lineHeight: 1.6, marginBottom: 12 }}>{selectedAlert.message}</div>

                    {/* Meta grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[
                        { k: "TYPE",     v: selectedAlert.type.toUpperCase() },
                        { k: "ORGANISM", v: selectedAlert.organism ?? "N/A" },
                        { k: "WARD ID",  v: selectedAlert.wardId },
                        { k: "STATUS",   v: selectedAlert.resolved ? "CLOSED" : "OPEN" },
                      ].map(f => (
                        <div key={f.k} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ fontSize: 7, color: "#334455", letterSpacing: 1, marginBottom: 3 }}>{f.k}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#c0d4e8" }}>{f.v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Related ward stats */}
                    {(() => {
                      const ws = WARD_STATS.find(w => w.wardId === selectedAlert.wardId);
                      if (!ws) return null;
                      return (
                        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <div style={{ fontSize: 7, color: "#334455", letterSpacing: 2, marginBottom: 8 }}>WARD METRICS</div>
                          {[
                            { k: "Anomaly Score", v: `${(ws.anomalyScore * 100).toFixed(0)}%`, c: SEV_COLOR[ws.status] },
                            { k: "Positivity Rate", v: `${ws.positivityRate}%`, c: ws.positivityRate > 20 ? "#ff0040" : "#ffaa00" },
                            { k: "Confirmed HAI", v: ws.confirmedInfections, c: "#ff0040" },
                            { k: "Resistant", v: ws.antibioticResistant, c: "#ff00ff" },
                          ].map(m => (
                            <div key={m.k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                              <span style={{ fontSize: 10, color: "#445566" }}>{m.k}</span>
                              <span style={{ fontSize: 10, fontWeight: 700, color: m.c, fontFamily: "monospace" }}>{m.v}</span>
                            </div>
                          ))}
                          {/* Anomaly score bar */}
                          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginTop: 8 }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${ws.anomalyScore * 100}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              style={{ height: "100%", background: SEV_COLOR[ws.status], boxShadow: `0 0 6px ${SEV_COLOR[ws.status]}` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>
              ) : (
                <div style={{ color: "#334455", fontSize: 11, textAlign: "center", marginTop: 32 }}>
                  Select an alert to view details
                </div>
              )}
            </AnimatePresence>

            {/* Radar chart — risk profile */}
            <div style={{ background: "rgba(2,8,18,0.7)", border: "1px solid rgba(0,212,255,0.1)", borderRadius: 12, padding: "14px 12px" }}>
              <SectionHeader label="HOSPITAL RISK PROFILE" accent="#8800ff" />
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={RADAR_DATA}>
                  <PolarGrid stroke="rgba(0,212,255,0.1)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: "#334455", fontSize: 8, fontFamily: "monospace" }} />
                  <Radar dataKey="score" stroke="#ff0040" fill="#ff0040" fillOpacity={0.15} strokeWidth={1.5} />
                  <Radar dataKey="score" stroke="#8800ff" fill="#8800ff" fillOpacity={0.08} strokeWidth={0} />
                  <Tooltip content={<ChartTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick stats bottom */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "AVG POSITIVITY", value: "18.4%", color: "#ffaa00", icon: "▲" },
                { label: "TOTAL HAI",      value: totalHAI, color: "#ff0040", icon: "◉" },
                { label: "RESISTANT",      value: WARD_STATS.reduce((s,w)=>s+w.antibioticResistant,0), color: "#ff00ff", icon: "◆" },
                { label: "DETECTION TIME", value: "30s", color: "#00d4ff", icon: "⬡" },
              ].map(s => (
                <div key={s.label} style={{
                  background: `${s.color}08`, border: `1px solid ${s.color}22`,
                  borderRadius: 10, padding: "10px 12px",
                }}>
                  <div style={{ fontSize: 11, color: s.color, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: s.color, fontFamily: "monospace", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 7, color: "#334455", marginTop: 4, letterSpacing: 1 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AlertDashboard;