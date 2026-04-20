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

const DOCTOR_PHONE = "+91 6367690519";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode]         = useState<ViewMode>("3d-map");
  const [selectedWard, setSelectedWard] = useState<WardStatus>(FALLBACK_WARDS[0]);
  const [liveAlerts, setLiveAlerts]     = useState<WardStatus[]>(FALLBACK_WARDS.filter(w => w.isAlert));
  const [wards, setWards]               = useState<WardStatus[]>(FALLBACK_WARDS);
  const [time, setTime]                 = useState(new Date());
  const [wsConnected, setWsConnected]   = useState(true);
  const [error, setError]               = useState<string | null>(null);

  // Lifecycle logging
  useEffect(() => {
    console.log("🎯 Dashboard mounted - User:", user?.username);
    return () => {
      console.warn("⚠️ Dashboard unmounting - Check if this is unexpected!");
    };
  }, [user]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        console.log("📡 Fetching wards from API...");
        const res = await getWards();
        console.log("✅ Wards fetched:", res.data);
        if (res.data?.wards) {
          const mapped: WardStatus[] = res.data.wards.map((w: any) => ({
            id: w.id, name: w.name, isAlert: false, anomalyScore: Math.random() * 0.8,
          }));
          setWards(mapped);
          setSelectedWard(mapped[0]);
        }
      } catch (err) {
        console.warn("⚠️ Failed to fetch wards (using fallback):", err);
        // Continue with fallback data
      }
    })();
  }, []);

  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      console.log("🔌 Connecting to WebSocket...");
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
        () => {
          console.warn("⚠️ WebSocket error or disconnection");
          setWsConnected(false);
        }
      );
    } catch (err) {
      console.error("❌ WebSocket connection error:", err);
      setWsConnected(false);
    }
    return () => { ws?.close(); };
  }, []);

  const handleWardClick = useCallback((wardId: string) => {
    const found = wards.find(w => w.id === wardId);
    setSelectedWard(found ?? { id: wardId, name: wardId.replace(/_/g, " "), isAlert: liveAlerts.some(a => a.id === wardId), anomalyScore: Math.random() });
  }, [wards, liveAlerts]);

  const critCount = liveAlerts.filter(a => a.anomalyScore >= 0.7).length;
  const warnCount = liveAlerts.filter(a => a.anomalyScore >= 0.4 && a.anomalyScore < 0.7).length;
  const isDoctor = user?.role === "doctor";

  const TABS: { mode: ViewMode; label: string; badge?: number }[] = [
    { mode: "3d-map", label: "3D Hospital Map",     badge: critCount > 0 ? critCount : undefined },
    { mode: "alerts", label: "Alert Dashboard",     badge: liveAlerts.length },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: "#F0F4F8", color: "#1A2332", overflow: "hidden", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <SideNavbar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* ERROR DISPLAY */}
        {error && (
          <div style={{
            background: "#C62828", color: "#FFFFFF",
            padding: "12px 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0, zIndex: 30,
            fontWeight: 600,
          }}>
            <span>⚠️ Error: {error}</span>
            <button onClick={() => setError(null)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#FFFFFF", cursor: "pointer", padding: "4px 8px", borderRadius: 4 }}>✕</button>
          </div>
        )}

        {/* CRITICAL BANNER */}
        {critCount > 0 && (
          <div style={{
            background: "#C62828", color: "#FFFFFF",
            padding: "8px 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0, zIndex: 30,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFCDD2", animation: "pulse-dot 1s infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
                {critCount} CRITICAL ALERT{critCount > 1 ? "S" : ""} ACTIVE — Immediate medical attention required
              </span>
            </div>
            <a
              href={`tel:${DOCTOR_PHONE}`}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                background: "rgba(255,255,255,0.18)", color: "#FFFFFF",
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: 7, padding: "5px 14px",
                textDecoration: "none", fontSize: 12, fontWeight: 800, letterSpacing: 0.2,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
              Call Doctor — {DOCTOR_PHONE}
            </a>
          </div>
        )}

        {/* HEADER */}
        <header style={{
          height: 56, padding: "0 24px", flexShrink: 0,
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
            <span style={{ color: "#CFD8DC", fontSize: 14 }}>›</span>
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: isDoctor ? "#1565C0" : "#00695C",
              background: isDoctor ? "#E3F2FD" : "#E0F2F1",
              padding: "2px 8px", borderRadius: 4,
            }}>
              {isDoctor ? "Doctor View" : "Ward Manager View"}
            </span>
          </div>

          {/* CENTER TABS */}
          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4, background: "#F5F5F5", border: "1px solid #E0E0E0", borderRadius: 10, padding: 4 }}>
            {TABS.map(tab => (
              <button key={tab.mode} onClick={() => setViewMode(tab.mode)} style={{
                padding: "7px 20px", fontSize: 12, fontWeight: 600,
                cursor: "pointer", border: "none", borderRadius: 7,
                background: viewMode === tab.mode ? "#FFFFFF" : "transparent",
                color: viewMode === tab.mode ? "#1565C0" : "#90A4AE",
                boxShadow: viewMode === tab.mode ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.2s", display: "flex", alignItems: "center", gap: 7,
                fontFamily: "inherit",
              }}>
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#FFFFFF", background: "#C62828", borderRadius: 10, padding: "1px 6px", minWidth: 18, textAlign: "center" }}>{tab.badge}</span>
                )}
              </button>
            ))}
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: wsConnected ? "#4CAF50" : "#EF5350", display: "inline-block" }} />
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
            { label: "Total Wards", value: wards.length,                         color: STAT_COLORS.blue,     dot: "#1565C0" },
            { label: "Critical",    value: critCount,                             color: STAT_COLORS.critical, dot: "#C62828" },
            { label: "Warning",     value: warnCount,                             color: STAT_COLORS.warning,  dot: "#E65100" },
            { label: "Normal",      value: wards.length - liveAlerts.length,      color: STAT_COLORS.normal,   dot: "#2E7D32" },
            ...(isDoctor ? [
              { label: "AI Engine",   value: "Active",        color: STAT_COLORS.purple, dot: "#6A1B9A" },
              { label: "Algorithm",   value: "Iso·Forest",    color: STAT_COLORS.blue,   dot: "#1565C0" },
              { label: "Cycle",       value: "30s",           color: STAT_COLORS.normal,  dot: "#2E7D32" },
            ] : [
              { label: "My Wards",    value: 3,               color: STAT_COLORS.blue,   dot: "#1565C0" },
              { label: "Tasks Today", value: 7,               color: STAT_COLORS.normal,  dot: "#2E7D32" },
            ]),
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div style={{ width: 1, height: 36, background: "#ECEFF1", flexShrink: 0 }} />}
              <div style={{ padding: "8px 18px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
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
                  {selectedWard.anomalyScore >= 0.7 && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #FFCDD2" }}>
                      <a
                        href={`tel:${DOCTOR_PHONE}`}
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          color: "#C62828", textDecoration: "none",
                          fontSize: 11, fontWeight: 700,
                        }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                        </svg>
                        {DOCTOR_PHONE}
                      </a>
                    </div>
                  )}
                </div>

                <div style={{
                  position: "absolute", bottom: 70, right: 16, zIndex: 10,
                  background: "#FFFFFF", border: "1px solid #E0E0E0",
                  borderRadius: 8, padding: "6px 14px", fontSize: 11, color: "#90A4AE",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}>
                  Drag · Scroll · Click ward to select
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
