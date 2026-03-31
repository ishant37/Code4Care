import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SideNavbar from "./Navbar";
import { HospitalMap } from "./Dashboard";
import AlertDashboard from "./AlertDashboard";
import { getWards, connectWebSocket } from "../services/api";

interface WardStatus {
  id: string;
  name: string;
  isAlert: boolean;
  anomalyScore: number;
}

const FALLBACK_WARDS: WardStatus[] = [
  { id: "icu_2",     name: "ICU Ward 2",    isAlert: true,  anomalyScore: 0.89 },
  { id: "emergency", name: "Emergency",     isAlert: true,  anomalyScore: 0.73 },
  { id: "isolation", name: "Isolation",     isAlert: true,  anomalyScore: 0.91 },
  { id: "icu_1",     name: "ICU Ward 1",    isAlert: false, anomalyScore: 0.31 },
  { id: "ward_a",    name: "General Ward A",isAlert: false, anomalyScore: 0.38 },
  { id: "pediatric", name: "Pediatrics",    isAlert: false, anomalyScore: 0.18 },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'JetBrains Mono', monospace; background: #020a14; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.2); border-radius: 3px; }
  @keyframes pulse-ring { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
  @keyframes scanline { 0%{top:-2px} 100%{top:100%} }
`;

type ViewMode = "3d-map" | "alerts";
type Floor = "all" | "gnd" | "f1" | "f2";

const Dashboard: React.FC = () => {
  const [viewMode, setViewMode]         = useState<ViewMode>("3d-map");
  const [selectedWard, setSelectedWard] = useState<WardStatus>(FALLBACK_WARDS[0]);
  const [liveAlerts, setLiveAlerts]     = useState<WardStatus[]>(FALLBACK_WARDS.filter(w => w.isAlert));
  const [wards, setWards]               = useState<WardStatus[]>(FALLBACK_WARDS);
  const [selectedFloor, setSelectedFloor] = useState<Floor>("all");
  const [time, setTime]                 = useState(new Date());
  const [wsConnected, setWsConnected]   = useState(true);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await getWards();
        if (res.data?.wards) {
          const mapped: WardStatus[] = res.data.wards.map((w: any) => ({
            id: w.id, name: w.name, isAlert: false, anomalyScore: Math.random() * 0.8,
          }));
          setWards(mapped);
          setSelectedWard(mapped[0]);
        }
      } catch { /* use fallback */ }
    })();
  }, []);

  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      ws = connectWebSocket(
        (data: any) => {
          setWsConnected(true);
          if (data.type === "alert") {
            const a: WardStatus = { id: data.payload.wardId, name: data.payload.wardName, isAlert: true, anomalyScore: data.payload.severity === "critical" ? 0.9 : 0.6 };
            setLiveAlerts(prev => prev.find(x => x.id === a.id) ? prev : [...prev, a]);
          } else if (data.type === "update") {
            const scoreMap: Record<string, number> = { critical: 0.85, warning: 0.55, normal: 0.25 };
            setWards(prev => prev.map(w => w.id === data.payload.wardId ? { ...w, anomalyScore: scoreMap[data.payload.status] ?? w.anomalyScore, isAlert: data.payload.status !== "normal" } : w));
            setLiveAlerts(prev => data.payload.status === "normal"
              ? prev.filter(a => a.id !== data.payload.wardId)
              : prev.find(a => a.id === data.payload.wardId) ? prev : [...prev, { id: data.payload.wardId, name: data.payload.wardId.replace(/_/g, " "), isAlert: true, anomalyScore: data.payload.status === "critical" ? 0.9 : 0.6 }]
            );
          }
        },
        () => setWsConnected(false)
      );
    } catch { setWsConnected(false); }
    return () => { ws?.close(); };
  }, []);

  useEffect(() => {
    if (wsConnected) return;
    const iv = setInterval(async () => {
      try { await fetch("http://localhost:8000/health"); setWsConnected(true); } catch { setWsConnected(false); }
    }, 5000);
    return () => clearInterval(iv);
  }, [wsConnected]);

  const handleWardClick = useCallback((wardId: string) => {
    const found = wards.find(w => w.id === wardId);
    setSelectedWard(found ?? { id: wardId, name: wardId.replace(/_/g, " "), isAlert: liveAlerts.some(a => a.id === wardId), anomalyScore: Math.random() });
  }, [wards, liveAlerts]);

  // Floor mapping
  const floorMap: Record<string, Floor> = {
    "icu_2": "gnd",
    "emergency": "gnd",
    "isolation": "f1",
    "icu_1": "f1",
    "ward_a": "f2",
    "pediatric": "f2",
  };

  const filteredWards = selectedFloor === "all" ? wards : wards.filter(w => floorMap[w.id] === selectedFloor);
  const filteredAlerts = selectedFloor === "all" ? liveAlerts : liveAlerts.filter(w => floorMap[w.id] === selectedFloor);

  const critCount = filteredAlerts.filter(a => a.anomalyScore >= 0.7).length;
  const warnCount = filteredAlerts.filter(a => a.anomalyScore >= 0.4 && a.anomalyScore < 0.7).length;

  const TABS: { mode: ViewMode; label: string; icon: string; badge?: number }[] = [
    { mode: "3d-map", label: "3D HOSPITAL",     icon: "⬡", badge: critCount > 0 ? critCount : undefined },
    { mode: "alerts", label: "ALERT DASHBOARD", icon: "◉", badge: liveAlerts.length },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div style={{ display: "flex", height: "100vh", width: "100vw", background: "#020a14", color: "#e0eeff", overflow: "hidden", fontFamily: "'JetBrains Mono', monospace" }}>
        <SideNavbar />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

          {/* HEADER */}
          <header style={{
            height: 56, padding: "0 24px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid rgba(0,212,255,0.1)",
            background: "rgba(2,8,18,0.97)", backdropFilter: "blur(12px)", zIndex: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(136,0,255,0.2))", border: "1px solid rgba(0,212,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#00d4ff" }}>⬡</div>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#e0eeff" }}>Code<span style={{ color: "#00d4ff" }}>4</span>Care</span>
              <span style={{ color: "rgba(0,212,255,0.2)", fontSize: 12 }}>›</span>
              <span style={{ fontSize: 9, color: "#445566", letterSpacing: 2 }}>HISS · COMMAND CENTER</span>
              
              {/* FLOOR FILTER */}
              <div style={{ display: "flex", gap: 6, marginLeft: 40, alignItems: "center" }}>
                {[
                  { label: "ALL FLOORS", value: "all" as Floor },
                  { label: "GND", value: "gnd" as Floor },
                  { label: "F1", value: "f1" as Floor },
                  { label: "F2", value: "f2" as Floor },
                ].map(floor => (
                  <button key={floor.value} onClick={() => setSelectedFloor(floor.value)} style={{
                    padding: "6px 14px", fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
                    fontFamily: "monospace", cursor: "pointer", border: "1px solid rgba(0,212,255,0.2)",
                    borderRadius: 6, background: selectedFloor === floor.value ? "rgba(0,212,255,0.2)" : "transparent",
                    color: selectedFloor === floor.value ? "#00d4ff" : "#445566",
                    transition: "all 0.2s",
                  }}>
                    {floor.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CENTER TAB SWITCHER */}
            <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4, background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)", borderRadius: 10, padding: 4 }}>
              {TABS.map(tab => (
                <button key={tab.mode} onClick={() => setViewMode(tab.mode)} style={{
                  padding: "6px 18px", fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
                  fontFamily: "monospace", cursor: "pointer", border: "none", borderRadius: 7,
                  background: viewMode === tab.mode ? "rgba(0,212,255,0.15)" : "transparent",
                  color: viewMode === tab.mode ? "#00d4ff" : "#445566",
                  outline: viewMode === tab.mode ? "1px solid rgba(0,212,255,0.25)" : "none",
                  transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span>{tab.icon}</span>
                  {tab.label}
                  {tab.badge !== undefined && (
                    <span style={{ fontSize: 8, fontWeight: 800, color: "#ff0040", background: "rgba(255,0,64,0.15)", border: "1px solid rgba(255,0,64,0.3)", borderRadius: 4, padding: "1px 5px" }}>{tab.badge}</span>
                  )}
                </button>
              ))}
            </div>

            {/* RIGHT */}
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {[{ label: "CRITICAL", val: critCount, color: "#ff0040" }, { label: "WARNING", val: warnCount, color: "#ffaa00" }].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 7, color: "#334455", letterSpacing: 1 }}>{s.label}</div>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: wsConnected ? "#00ff41" : "#ff0040", boxShadow: `0 0 8px ${wsConnected ? "#00ff41" : "#ff0040"}`, display: "inline-block", animation: "pulse-ring 2s infinite" }} />
                <span style={{ fontSize: 9, color: wsConnected ? "#00ff41" : "#ff0040", letterSpacing: 1 }}>{wsConnected ? "LIVE" : "OFFLINE"}</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#00d4ff", background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: 6, padding: "4px 10px" }}>
                {time.toLocaleTimeString("en-IN", { hour12: false })}
              </div>
            </div>
          </header>

          {/* STAT STRIP */}
          <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid rgba(0,212,255,0.07)", background: "rgba(2,8,18,0.8)", flexShrink: 0, padding: "0 20px" }}>
            {[
              { label: "TOTAL WARDS", value: filteredWards.length,             color: "#00d4ff", icon: "▣" },
              { label: "CRITICAL",    value: critCount,                 color: "#ff0040", icon: "◉" },
              { label: "ALERTS",      value: filteredAlerts.length,         color: "#ffaa00", icon: "⚠" },
              { label: "NORMAL",      value: filteredWards.length - filteredAlerts.length, color: "#00ff41", icon: "◈" },
              { label: "AI ENGINE",   value: "ACTIVE",                  color: "#8800ff", icon: "⬡" },
              { label: "ALGORITHM",   value: "ISO·FOREST",              color: "#00ffff", icon: "◆" },
              { label: "CYCLE",       value: "30s",                     color: "#ff00ff", icon: "▲" },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <div style={{ width: 1, height: 34, background: "rgba(255,255,255,0.04)" }} />}
                <div style={{ padding: "6px 16px", display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ fontSize: 11, color: s.color, opacity: 0.6 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize: 7, color: "#2a3a4a", letterSpacing: 1.5, marginBottom: 1 }}>{s.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: s.color, lineHeight: 1, textShadow: `0 0 8px ${s.color}55` }}>{s.value}</div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* MAIN VIEW */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative", minHeight: 0 }}>
            <AnimatePresence mode="wait">
              {viewMode === "3d-map" ? (
                <motion.div key="3d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ width: "100%", height: "100%", position: "relative" }}>
                  {/* Scanline */}
                  <div style={{ position: "absolute", left: 0, right: 0, height: 1, zIndex: 5, pointerEvents: "none", background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.25), transparent)", animation: "scanline 8s linear infinite" }} />
                  {/* Corner frames */}
                  {[
                    { top: 12, left: 12, borderTop: "1px solid rgba(0,212,255,0.3)", borderLeft: "1px solid rgba(0,212,255,0.3)" },
                    { top: 12, right: 12, borderTop: "1px solid rgba(0,212,255,0.3)", borderRight: "1px solid rgba(0,212,255,0.3)" },
                    { bottom: 12, left: 12, borderBottom: "1px solid rgba(0,212,255,0.3)", borderLeft: "1px solid rgba(0,212,255,0.3)" },
                    { bottom: 12, right: 12, borderBottom: "1px solid rgba(0,212,255,0.3)", borderRight: "1px solid rgba(0,212,255,0.3)" },
                  ].map((s, i) => (
                    <div key={i} style={{ position: "absolute", width: 24, height: 24, zIndex: 5, pointerEvents: "none", ...s }} />
                  ))}
                  <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10, background: "rgba(2,8,18,0.88)", backdropFilter: "blur(8px)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 8, padding: "6px 14px", fontSize: 10, color: "#445566", fontFamily: "monospace" }}>
                    SELECTED: <span style={{ color: "#00d4ff", fontWeight: 700 }}>{selectedWard.name}</span>
                  </div>
                  <div style={{ position: "absolute", bottom: 60, right: 20, zIndex: 10, background: "rgba(2,8,18,0.75)", border: "1px solid rgba(0,212,255,0.1)", borderRadius: 8, padding: "6px 12px", fontSize: 9, color: "#334455", fontFamily: "monospace" }}>
                    🖱 Drag · Scroll · Click ward
                  </div>
                  <HospitalMap selectedWard={selectedWard} alerts={filteredAlerts} onWardClick={handleWardClick} wards={filteredWards} />
                </motion.div>
              ) : (
                <motion.div key="alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ width: "100%", height: "100%", overflow: "hidden" }}>
                  <AlertDashboard />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;