import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SideNavbar from "./Navbar";
import { HospitalMap } from "./Dashboard";
import AlertDashboard from "./AlertDashboard";
import { getWards, connectWebSocket } from "../services/api";
import { useAuth } from "../context/AuthContext";

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

type ViewMode = "3d-map" | "alerts";

const STAT_COLORS = {
  critical: "#C62828",
  warning:  "#E65100",
  normal:   "#2E7D32",
  blue:     "#1565C0",
  purple:   "#6A1B9A",
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode]         = useState<ViewMode>("3d-map");
  const [selectedWard, setSelectedWard] = useState<WardStatus>(FALLBACK_WARDS[0]);
  const [liveAlerts, setLiveAlerts]     = useState<WardStatus[]>(FALLBACK_WARDS.filter(w => w.isAlert));
  const [wards, setWards]               = useState<WardStatus[]>(FALLBACK_WARDS);
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
      } catch { }
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
          }
        },
        () => setWsConnected(false)
      );
    } catch { setWsConnected(false); }
    return () => { ws?.close(); };
  }, []);

  const handleWardClick = useCallback((wardId: string) => {
    const found = wards.find(w => w.id === wardId);
    setSelectedWard(found ?? { id: wardId, name: wardId.replace(/_/g, " "), isAlert: liveAlerts.some(a => a.id === wardId), anomalyScore: Math.random() });
  }, [wards, liveAlerts]);

  const critCount = liveAlerts.filter(a => a.anomalyScore >= 0.7).length;
  const warnCount = liveAlerts.filter(a => a.anomalyScore >= 0.4 && a.anomalyScore < 0.7).length;

  const isDoctor = user?.role === "doctor";

  const TABS: { mode: ViewMode; label: string; emoji: string; badge?: number }[] = [
    { mode: "3d-map", label: "3D Hospital Map", emoji: "🏥", badge: critCount > 0 ? critCount : undefined },
    { mode: "alerts", label: "Alert Dashboard", emoji: "🚨", badge: liveAlerts.length },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: "#F0F4F8", color: "#1A2332", overflow: "hidden", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <SideNavbar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* HEADER */}
        <header style={{
          height: 60, padding: "0 24px", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid #E0E0E0",
          background: "#FFFFFF",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          zIndex: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1A2332" }}>HISS</span>
            <span style={{ color: "#CFD8DC", fontSize: 14 }}>›</span>
            <span style={{ fontSize: 13, color: "#607D8B" }}>Command Center</span>
            {isDoctor && (
              <>
                <span style={{ color: "#CFD8DC", fontSize: 14 }}>›</span>
                <span style={{
                  fontSize: 11, color: "#1565C0", fontWeight: 600,
                  background: "#E3F2FD", padding: "2px 8px", borderRadius: 4,
                }}>
                  🩺 Doctor View
                </span>
              </>
            )}
            {!isDoctor && (
              <>
                <span style={{ color: "#CFD8DC", fontSize: 14 }}>›</span>
                <span style={{
                  fontSize: 11, color: "#00695C", fontWeight: 600,
                  background: "#E0F2F1", padding: "2px 8px", borderRadius: 4,
                }}>
                  🏥 Ward Manager View
                </span>
              </>
            )}
          </div>

          {/* CENTER TABS */}
          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, background: "#F5F5F5", border: "1px solid #E0E0E0", borderRadius: 10, padding: 4 }}>
            {TABS.map(tab => (
              <button key={tab.mode} onClick={() => setViewMode(tab.mode)} style={{
                padding: "8px 20px", fontSize: 13, fontWeight: 600,
                cursor: "pointer", border: "none", borderRadius: 7,
                background: viewMode === tab.mode ? "#FFFFFF" : "transparent",
                color: viewMode === tab.mode ? "#1565C0" : "#90A4AE",
                boxShadow: viewMode === tab.mode ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.2s", display: "flex", alignItems: "center", gap: 7,
                fontFamily: "inherit",
              }}>
                <span>{tab.emoji}</span>
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#FFFFFF", background: "#C62828", borderRadius: 10, padding: "1px 6px", minWidth: 18, textAlign: "center" }}>{tab.badge}</span>
                )}
              </button>
            ))}
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {critCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFEBEE", border: "1px solid #EF9A9A", borderRadius: 8, padding: "4px 12px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#C62828", display: "inline-block", animation: "pulse-dot 1s infinite" }} />
                <span style={{ fontSize: 12, color: "#C62828", fontWeight: 700 }}>{critCount} Critical</span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: wsConnected ? "#4CAF50" : "#EF5350", display: "inline-block", animation: "pulse-dot 2s infinite" }} />
              <span style={{ fontSize: 12, color: wsConnected ? "#2E7D32" : "#C62828", fontWeight: 600 }}>
                {wsConnected ? "Live" : "Offline"}
              </span>
            </div>
            <div style={{
              fontSize: 13, fontWeight: 700, color: "#1565C0",
              background: "#E3F2FD", border: "1px solid #90CAF9",
              borderRadius: 8, padding: "5px 12px",
            }}>
              {time.toLocaleTimeString("en-IN", { hour12: false })}
            </div>
          </div>
        </header>

        {/* STAT STRIP */}
        <div style={{
          display: "flex", alignItems: "center",
          borderBottom: "1px solid #ECEFF1",
          background: "#FFFFFF", flexShrink: 0,
          padding: "0 20px", gap: 0,
          overflowX: "auto",
        }}>
          {[
            { label: "Total Wards", value: wards.length,                         color: STAT_COLORS.blue,     icon: "🏥" },
            { label: "Critical",    value: critCount,                             color: STAT_COLORS.critical, icon: "🔴" },
            { label: "Warning",     value: warnCount,                             color: STAT_COLORS.warning,  icon: "🟡" },
            { label: "Normal",      value: wards.length - liveAlerts.length,      color: STAT_COLORS.normal,   icon: "🟢" },
            ...(isDoctor ? [
              { label: "AI Engine",   value: "Active",                            color: STAT_COLORS.purple,   icon: "🤖" },
              { label: "Algorithm",   value: "Iso·Forest",                        color: STAT_COLORS.blue,     icon: "🔬" },
              { label: "Cycle",       value: "30s",                               color: STAT_COLORS.normal,   icon: "⏱️" },
            ] : [
              { label: "My Wards",    value: 3,                                   color: STAT_COLORS.blue,     icon: "🏥" },
              { label: "Tasks Today", value: 7,                                   color: STAT_COLORS.normal,   icon: "✅" },
            ]),
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div style={{ width: 1, height: 36, background: "#ECEFF1", flexShrink: 0 }} />}
              <div style={{ padding: "8px 18px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span style={{ fontSize: 16 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 10, color: "#90A4AE", fontWeight: 600, letterSpacing: 0.5, marginBottom: 1 }}>{s.label.toUpperCase()}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* MAIN VIEW */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative", minHeight: 0, background: "#F0F4F8" }}>
          <AnimatePresence mode="wait">
            {viewMode === "3d-map" ? (
              <motion.div key="3d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ width: "100%", height: "100%", position: "relative" }}>
                {/* Selected ward info */}
                <div style={{
                  position: "absolute", top: 16, right: 16, zIndex: 10,
                  background: "#FFFFFF", border: "1px solid #E0E0E0",
                  borderRadius: 10, padding: "10px 16px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  fontSize: 13, color: "#607D8B",
                }}>
                  Selected: <strong style={{ color: "#1565C0" }}>{selectedWard.name}</strong>
                  <div style={{ fontSize: 11, color: "#90A4AE", marginTop: 4 }}>
                    Risk Score: <span style={{ color: selectedWard.anomalyScore >= 0.7 ? "#C62828" : selectedWard.anomalyScore >= 0.4 ? "#E65100" : "#2E7D32", fontWeight: 700 }}>
                      {(selectedWard.anomalyScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div style={{
                  position: "absolute", bottom: 70, right: 16, zIndex: 10,
                  background: "#FFFFFF", border: "1px solid #E0E0E0",
                  borderRadius: 8, padding: "6px 14px", fontSize: 11, color: "#90A4AE",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}>
                  🖱 Drag · Scroll · Click ward
                </div>

                <HospitalMap selectedWard={selectedWard} alerts={liveAlerts} onWardClick={handleWardClick} wards={wards} />
              </motion.div>
            ) : (
              <motion.div key="alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ width: "100%", height: "100%", overflow: "auto" }}>
                <AlertDashboard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
