import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AutoCADMap } from "../components/AutoCADMap";
import HospitalScene from "../components/3D/HospitalScene";
import SideNavbar from "./Navbar";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WardStatus {
  id: string;
  name: string;
  isAlert: boolean;
  anomalyScore: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  critical: "#ff0040",
  warning:  "#ffaa00",
  normal:   "#00ff41",
};

const WARD_LIST: WardStatus[] = [
  { id: "ICU_1",     name: "ICU Ward 1",    isAlert: false, anomalyScore: 0.31 },
  { id: "ICU_2",     name: "ICU Ward 2",    isAlert: true,  anomalyScore: 0.89 },
  { id: "Ward_A",    name: "General Ward A", isAlert: false, anomalyScore: 0.42 },
  { id: "Surgery_1", name: "Surgery 1",     isAlert: false, anomalyScore: 0.55 },
  { id: "Emergency", name: "Emergency",     isAlert: true,  anomalyScore: 0.73 },
  { id: "Pediatric", name: "Pediatrics",    isAlert: false, anomalyScore: 0.18 },
];

// ─── Small helpers ────────────────────────────────────────────────────────────
function scoreLabel(s: number): { label: string; color: string } {
  if (s >= 0.7) return { label: "CRITICAL", color: STATUS_COLOR.critical };
  if (s >= 0.4) return { label: "WARNING",  color: STATUS_COLOR.warning  };
  return              { label: "NORMAL",   color: STATUS_COLOR.normal   };
}

function ScoreBar({ value }: { value: number }) {
  const { color } = scoreLabel(value);
  return (
    <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value * 100}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ height: "100%", background: color, boxShadow: `0 0 6px ${color}` }}
      />
    </div>
  );
}

// ─── Metric tile ──────────────────────────────────────────────────────────────
interface MetricTileProps {
  label: string;
  value: string;
  unit: string;
  color: string;
  icon: React.ReactNode;
  sub?: string;
}
function MetricTile({ label, value, unit, color, icon, sub }: MetricTileProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `${color}0d` : "rgba(255,255,255,0.02)",
        border: `1px solid ${hovered ? color + "44" : "rgba(255,255,255,0.06)"}`,
        borderRadius: 12, padding: "14px 16px",
        transition: "all 0.25s ease",
        cursor: "default",
        boxShadow: hovered ? `0 0 20px ${color}18` : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 9, color: "#445566", letterSpacing: 2, fontFamily: "monospace", fontWeight: 700 }}>{label}</span>
        <span style={{ color: hovered ? color : "#334455", transition: "color 0.25s", fontSize: 14 }}>{icon}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "monospace", lineHeight: 1, textShadow: hovered ? `0 0 12px ${color}88` : "none", transition: "text-shadow 0.25s" }}>{value}</span>
        <span style={{ fontSize: 11, color: "#445566", fontFamily: "monospace" }}>{unit}</span>
      </div>
      {sub && <div style={{ fontSize: 9, color: "#334455", marginTop: 6, fontFamily: "monospace", letterSpacing: 1 }}>{sub}</div>}
    </div>
  );
}

// ─── Ward row in alert sidebar ────────────────────────────────────────────────
interface WardRowProps {
  ward: WardStatus;
  isSelected: boolean;
  onClick: () => void;
}
function WardRow({ ward, isSelected, onClick }: WardRowProps) {
  const { label, color } = scoreLabel(ward.anomalyScore);
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      layout
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "10px 12px", borderRadius: 10, cursor: "pointer",
        background: isSelected ? `${color}12` : hovered ? "rgba(255,255,255,0.03)" : "transparent",
        border: `1px solid ${isSelected ? color + "44" : hovered ? "rgba(255,255,255,0.08)" : "transparent"}`,
        transition: "all 0.2s ease",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* alert pulse bar */}
      {ward.isAlert && (
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
            background: STATUS_COLOR.critical,
            boxShadow: `0 0 8px ${STATUS_COLOR.critical}`,
            borderRadius: "3px 0 0 3px",
          }}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!ward.isAlert && (
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
          )}
          <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? "#e0eeff" : "#8899aa", fontFamily: "monospace", paddingLeft: ward.isAlert ? 6 : 0 }}>
            {ward.name}
          </span>
        </div>
        <span style={{
          fontSize: 8, fontWeight: 700, letterSpacing: 1,
          color, background: `${color}15`,
          border: `1px solid ${color}33`,
          padding: "2px 6px", borderRadius: 4, fontFamily: "monospace",
        }}>{label}</span>
      </div>

      <ScoreBar value={ward.anomalyScore} />

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        <span style={{ fontSize: 9, color: "#334455", fontFamily: "monospace" }}>anomaly score</span>
        <span style={{ fontSize: 9, color, fontFamily: "monospace", fontWeight: 700 }}>{(ward.anomalyScore * 100).toFixed(0)}%</span>
      </div>
    </motion.div>
  );
}

// ─── Selected ward detail panel ───────────────────────────────────────────────
function WardDetailPanel({ ward }: { ward: WardStatus }) {
  const { label, color } = scoreLabel(ward.anomalyScore);
  const facts = [
    { key: "HAI Risk",         val: `${(ward.anomalyScore * 100).toFixed(1)}%` },
    { key: "Status",           val: label },
    { key: "Detection Cycle",  val: "30s" },
    { key: "Last Scan",        val: "Just now" },
  ];
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={ward.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        style={{
          background: "rgba(2,8,18,0.8)",
          border: `1px solid ${color}33`,
          borderRadius: 14, padding: "16px",
          boxShadow: `0 0 24px ${color}12`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 9, color: "#334455", letterSpacing: 2, fontFamily: "monospace", marginBottom: 4 }}>SELECTED WARD</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#e0eeff", fontFamily: "monospace" }}>{ward.name}</div>
            <div style={{ fontSize: 10, color: "#445566", fontFamily: "monospace", marginTop: 2 }}>ID: {ward.id}</div>
          </div>
          <motion.div
            animate={ward.isAlert ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            style={{
              background: `${color}18`, border: `1px solid ${color}44`,
              borderRadius: 8, padding: "4px 10px",
              fontSize: 9, fontWeight: 700, letterSpacing: 1,
              color, fontFamily: "monospace",
              boxShadow: ward.isAlert ? `0 0 12px ${color}44` : "none",
            }}
          >{label}</motion.div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {facts.map(f => (
            <div key={f.key} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 8, color: "#334455", letterSpacing: 1, fontFamily: "monospace", marginBottom: 3 }}>{f.key}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: f.key === "Status" ? color : "#c0d4e8", fontFamily: "monospace" }}>{f.val}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Scrollable styles injected once ─────────────────────────────────────────
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'JetBrains Mono', monospace; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.2); border-radius: 4px; }
  @keyframes pulse-ring {
    0%,100% { opacity:1; transform:scale(1); }
    50% { opacity:0.4; transform:scale(0.85); }
  }
  @keyframes scanline {
    0% { top: -2px; }
    100% { top: 100%; }
  }
  @keyframes ticker {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
`;

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const [view, setView] = useState<"2D" | "3D">("3D");
  const [selectedWard, setSelectedWard] = useState<WardStatus>(WARD_LIST[0]);
  const [liveAlerts, setLiveAlerts] = useState<WardStatus[]>(
    WARD_LIST.filter(w => w.isAlert)
  );
  const [wards, setWards] = useState<WardStatus[]>(WARD_LIST);
  const [time, setTime] = useState(new Date());
  const [wsConnected, setWsConnected] = useState(true);

  // clock tick
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // API polling
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/status");
        const data = await res.json();
        setLiveAlerts(data.red_alert_wards);
        setWsConnected(true);
      } catch {
        setWsConnected(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleWardClick = useCallback((wardId: string) => {
    const found = wards.find(w => w.id === wardId);
    if (found) setSelectedWard(found);
    else setSelectedWard({
      id: wardId,
      name: wardId.replace(/_/g, " "),
      isAlert: liveAlerts.some(a => a.id === wardId),
      anomalyScore: Math.random(),
    });
  }, [wards, liveAlerts]);

  const criticalCount = wards.filter(w => w.anomalyScore >= 0.7).length;
  const warningCount  = wards.filter(w => w.anomalyScore >= 0.4 && w.anomalyScore < 0.7).length;
  const normalCount   = wards.filter(w => w.anomalyScore < 0.4).length;

  return (
    <>
      <style>{globalCSS}</style>

      <div style={{
        display: "flex", height: "100vh", width: "100vw",
        background: "#020a14", color: "#e0eeff",
        overflow: "hidden", fontFamily: "'JetBrains Mono', monospace",
      }}>
        {/* ── Side Navbar ─────────────────────────────── */}
        <SideNavbar />

        {/* ── Main content ────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* ── HEADER ──────────────────────────────────── */}
          <header style={{
            padding: "0 24px",
            height: 56,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid rgba(0,212,255,0.1)",
            background: "rgba(2,8,18,0.95)",
            backdropFilter: "blur(12px)",
            flexShrink: 0,
            position: "relative", zIndex: 10,
          }}>
            {/* Left — brand + breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(136,0,255,0.2))",
                  border: "1px solid rgba(0,212,255,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: "#00d4ff",
                }}>⬡</div>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#e0eeff", letterSpacing: 0.5 }}>
                  Code<span style={{ color: "#00d4ff" }}>4</span>Care
                </span>
              </div>
              <span style={{ color: "rgba(0,212,255,0.25)", fontSize: 12 }}>›</span>
              <span style={{ fontSize: 11, color: "#445566", letterSpacing: 1 }}>SURVEILLANCE DASHBOARD</span>
            </div>

            {/* Center — live ticker */}
            <div style={{
              display: "flex", alignItems: "center", gap: 16,
              background: "rgba(255,0,64,0.06)", border: "1px solid rgba(255,0,64,0.2)",
              borderRadius: 100, padding: "5px 14px",
            }}>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff0040", display: "inline-block", boxShadow: "0 0 8px #ff0040" }}
              />
              <span style={{ fontSize: 10, color: "#ff6080", letterSpacing: 2, fontWeight: 700 }}>
                {liveAlerts.length} CRITICAL WARD{liveAlerts.length !== 1 ? "S" : ""} · LIVE
              </span>
            </div>

            {/* Right — status + time */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: wsConnected ? "#00ff41" : "#ff0040",
                  boxShadow: `0 0 8px ${wsConnected ? "#00ff41" : "#ff0040"}`,
                  display: "inline-block",
                  animation: "pulse-ring 2s infinite",
                }} />
                <span style={{ fontSize: 10, color: wsConnected ? "#00ff41" : "#ff0040", letterSpacing: 1 }}>
                  {wsConnected ? "CONNECTED" : "OFFLINE"}
                </span>
              </div>

              <div style={{
                fontSize: 12, fontWeight: 700, color: "#00d4ff",
                fontFamily: "monospace", letterSpacing: 1,
                background: "rgba(0,212,255,0.06)", padding: "4px 10px",
                border: "1px solid rgba(0,212,255,0.15)", borderRadius: 6,
              }}>
                {time.toLocaleTimeString("en-IN", { hour12: false })}
              </div>
            </div>
          </header>

          {/* ── STAT BAR ────────────────────────────────── */}
          <div style={{
            display: "flex", alignItems: "center", gap: 1,
            borderBottom: "1px solid rgba(0,212,255,0.08)",
            background: "rgba(2,8,18,0.7)",
            flexShrink: 0, padding: "0 24px",
          }}>
            {[
              { label: "WARDS MONITORED", value: wards.length, color: "#00d4ff", icon: "▣" },
              { label: "CRITICAL",        value: criticalCount, color: "#ff0040", icon: "◉" },
              { label: "WARNING",         value: warningCount,  color: "#ffaa00", icon: "⚠" },
              { label: "NORMAL",          value: normalCount,   color: "#00ff41", icon: "◈" },
              { label: "AI CYCLE",        value: "30s",         color: "#8800ff", icon: "⬡" },
              { label: "DETECTION ALGO",  value: "ISO FOREST",  color: "#00ffff", icon: "◆" },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.05)" }} />}
                <div style={{ padding: "8px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: s.color, opacity: 0.7 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize: 8, color: "#334455", letterSpacing: 1.5, marginBottom: 1 }}>{s.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: s.color, lineHeight: 1, textShadow: `0 0 8px ${s.color}66` }}>{s.value}</div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* ── MAIN GRID ───────────────────────────────── */}
          <div style={{
            flex: 1, display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: 0, overflow: "hidden", minHeight: 0,
          }}>

            {/* ── LEFT — 3D / 2D Viewer ─────────────────── */}
            <div style={{ position: "relative", overflow: "hidden", borderRight: "1px solid rgba(0,212,255,0.08)" }}>

              {/* Scan line effect */}
              <div style={{
                position: "absolute", left: 0, right: 0, height: 1, zIndex: 5, pointerEvents: "none",
                background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)",
                animation: "scanline 8s linear infinite",
              }} />

              {/* Corner brackets */}
              {[
                { top: 12, left: 12, borderTop: "1px solid #00d4ff44", borderLeft: "1px solid #00d4ff44" },
                { top: 12, right: 12, borderTop: "1px solid #00d4ff44", borderRight: "1px solid #00d4ff44" },
                { bottom: 12, left: 12, borderBottom: "1px solid #00d4ff44", borderLeft: "1px solid #00d4ff44" },
                { bottom: 12, right: 12, borderBottom: "1px solid #00d4ff44", borderRight: "1px solid #00d4ff44" },
              ].map((s, i) => (
                <div key={i} style={{ position: "absolute", width: 20, height: 20, zIndex: 5, pointerEvents: "none", ...s }} />
              ))}

              {/* View toggle */}
              <div style={{
                position: "absolute", top: 20, left: 20, zIndex: 10,
                display: "flex", background: "rgba(2,8,18,0.85)", backdropFilter: "blur(8px)",
                border: "1px solid rgba(0,212,255,0.2)", borderRadius: 8, overflow: "hidden",
              }}>
                {(["3D", "2D"] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    style={{
                      padding: "6px 14px", fontSize: 10, fontWeight: 700,
                      letterSpacing: 1, fontFamily: "monospace", cursor: "pointer", border: "none",
                      background: view === v ? "rgba(0,212,255,0.15)" : "transparent",
                      color: view === v ? "#00d4ff" : "#445566",
                      transition: "all 0.2s",
                      boxShadow: view === v ? "inset 0 0 12px rgba(0,212,255,0.1)" : "none",
                    }}
                  >{v} VIEW</button>
                ))}
              </div>

              {/* Ward ID badge */}
              <div style={{
                position: "absolute", top: 20, right: 20, zIndex: 10,
                background: "rgba(2,8,18,0.85)", backdropFilter: "blur(8px)",
                border: "1px solid rgba(0,212,255,0.2)", borderRadius: 8,
                padding: "6px 12px", fontSize: 10, color: "#445566",
                fontFamily: "monospace", letterSpacing: 1,
              }}>
                ACTIVE: <span style={{ color: "#00d4ff" }}>{selectedWard.id}</span>
              </div>

              {/* 3D/2D Scene */}
              <AnimatePresence mode="wait">
                {view === "2D" ? (
                  <motion.div key="2d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ height: "100%" }}>
                    <AutoCADMap onWardSelect={handleWardClick} alerts={liveAlerts} />
                  </motion.div>
                ) : (
                  <motion.div key="3d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ height: "100%" }}>
                    <HospitalScene selectedWard={selectedWard} alerts={liveAlerts} onWardClick={handleWardClick} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── RIGHT PANEL ───────────────────────────── */}
            <div style={{
              display: "flex", flexDirection: "column", gap: 0,
              overflow: "hidden", background: "rgba(2,8,18,0.6)",
            }}>

              {/* Panel header */}
              <div style={{
                padding: "12px 16px", borderBottom: "1px solid rgba(0,212,255,0.08)",
                fontSize: 9, color: "#00d4ff", letterSpacing: 2, fontWeight: 700,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span>WARD SURVEILLANCE</span>
                <span style={{ color: "#334455" }}>{wards.length} WARDS</span>
              </div>

              {/* Ward list */}
              <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
                {/* Critical first */}
                {[...wards].sort((a, b) => b.anomalyScore - a.anomalyScore).map(ward => (
                  <WardRow
                    key={ward.id}
                    ward={ward}
                    isSelected={selectedWard.id === ward.id}
                    onClick={() => setSelectedWard(ward)}
                  />
                ))}
              </div>

              {/* Selected ward detail */}
              <div style={{ padding: "12px", borderTop: "1px solid rgba(0,212,255,0.08)" }}>
                <WardDetailPanel ward={selectedWard} />
              </div>

              {/* Metrics section */}
              <div style={{ padding: "12px", borderTop: "1px solid rgba(0,212,255,0.08)" }}>
                <div style={{ fontSize: 9, color: "#334455", letterSpacing: 2, marginBottom: 10 }}>ENVIRONMENT</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  <MetricTile label="O₂ SAT" value="96" unit="%" color="#00d4ff" icon="◉" sub="STABLE" />
                  <MetricTile label="TEMP"   value="22" unit="°C" color="#ffaa00" icon="▲" sub="+0.2°" />
                  <MetricTile label="HUMID"  value="48" unit="%" color="#8800ff" icon="◈" sub="NORMAL" />
                </div>
              </div>

              {/* System status */}
              <div style={{
                padding: "10px 16px", borderTop: "1px solid rgba(0,212,255,0.08)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", gap: 12 }}>
                  {[
                    { label: "AI MODEL", ok: true },
                    { label: "WEBSOCKET", ok: wsConnected },
                    { label: "DATA FEED", ok: true },
                  ].map(s => (
                    <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: s.ok ? "#00ff41" : "#ff0040",
                        display: "inline-block",
                        boxShadow: `0 0 5px ${s.ok ? "#00ff41" : "#ff0040"}`,
                      }} />
                      <span style={{ fontSize: 8, color: "#334455", letterSpacing: 1 }}>{s.label}</span>
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: 8, color: "#223344", fontFamily: "monospace" }}>
                  {time.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;