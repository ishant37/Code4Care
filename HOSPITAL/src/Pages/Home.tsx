import { useEffect, useState } from "react";
import { getWards } from "../services/api";

const DEFAULT_WARDS = [
  { name: "ICU Ward", color: "#00d4ff", status: "critical", count: 5 },
  { name: "General Ward", color: "#00ff41", status: "normal", count: 1 },
  { name: "Surgery", color: "#8800ff", status: "warning", count: 3 },
  { name: "Pediatrics", color: "#ff00ff", status: "normal", count: 0 },
  { name: "Emergency", color: "#ffaa00", status: "warning", count: 2 },
  { name: "Ambulatory", color: "#00ffff", status: "normal", count: 1 },
];

const STATUS_COLOR: Record<string, string> = {
  critical: "#ff0040",
  warning: "#ffaa00",
  normal: "#00ff41",
};

const FEATURES = [
  {
    icon: "⬡",
    title: "3D Digital Twin",
    desc: "Interactive three-dimensional hospital map with real-time ward overlays and bloom-rendered threat zones.",
    color: "#00d4ff",
  },
  {
    icon: "◈",
    title: "AI Anomaly Detection",
    desc: "Isolation Forest algorithm analyses 8 clinical features per ward to surface outbreak patterns before they spread.",
    color: "#8800ff",
  },
  {
    icon: "⚡",
    title: "Live WebSocket Feed",
    desc: "Sub-second alert broadcasting streams patient records, lab results, and ward status to every connected client.",
    color: "#00ff41",
  },
  {
    icon: "◉",
    title: "HAI Risk Scoring",
    desc: "Multi-factor scoring across positivity rates, antibiotic resistance, organism clustering, and infection onset.",
    color: "#ff00ff",
  },
  {
    icon: "▣",
    title: "SCADA Dashboard",
    desc: "Industrial-grade surveillance UI with neon glow alerts, chromatic aberration, and post-processing effects.",
    color: "#ffaa00",
  },
  {
    icon: "◆",
    title: "Outbreak Clusters",
    desc: "Automatic detection when the same organism appears in 30%+ of tests — flagged before it becomes a crisis.",
    color: "#00ffff",
  },
];

function GridBackground() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.07 }}>
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#00d4ff" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
        width: 700, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)",
      }} />
      <div style={{
        position: "absolute", top: 0, left: 0, width: 200, height: 200,
        borderTop: "1px solid rgba(0,212,255,0.2)", borderLeft: "1px solid rgba(0,212,255,0.2)",
      }} />
      <div style={{
        position: "absolute", bottom: 0, right: 0, width: 200, height: 200,
        borderBottom: "1px solid rgba(136,0,255,0.2)", borderRight: "1px solid rgba(136,0,255,0.2)",
      }} />
      <div style={{
        position: "absolute", left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)",
        animation: "scanline 6s linear infinite",
      }} />
      <style>{`
        @keyframes scanline { 0% { top: -2px; } 100% { top: 100%; } }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
      `}</style>
    </div>
  );
}

function WardTicker() {
  const [wards, setWards] = useState(DEFAULT_WARDS);

  useEffect(() => {
    const fetchWards = async () => {
      try {
        const res = await getWards();
        if (res.data?.wards) {
          const mappedWards = res.data.wards.map((w: any) => ({
            name: w.name,
            color: "#00d4ff",
            status: Math.random() > 0.5 ? "normal" : "warning",
            count: Math.floor(Math.random() * 5),
          }));
          setWards(mappedWards);
        }
      } catch (error) {
        console.error("Failed to fetch wards:", error);
      }
    };

    fetchWards();
  }, []);

  const items = [...wards, ...wards];
  return (
    <div style={{
      overflow: "hidden",
      borderTop: "1px solid rgba(0,212,255,0.15)",
      borderBottom: "1px solid rgba(0,212,255,0.15)",
      background: "rgba(0,212,255,0.03)", padding: "10px 0",
    }}>
      <div style={{ display: "flex", gap: 48, width: "max-content", animation: "ticker 22s linear infinite" }}>
        {items.map((w, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: STATUS_COLOR[w.status],
              boxShadow: `0 0 8px ${STATUS_COLOR[w.status]}`,
              display: "inline-block",
              animation: w.status === "critical" ? "pulse-dot 1s infinite" : "none",
            }} />
            <span style={{ fontFamily: "monospace", fontSize: 12, color: "#8899aa", letterSpacing: 1 }}>
              {w.name.toUpperCase()}
            </span>
            <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: STATUS_COLOR[w.status as keyof typeof STATUS_COLOR], letterSpacing: 1 }}>
              {w.status.toUpperCase()}
            </span>
            {w.count > 0 && (
              <span style={{
                fontSize: 10, color: "#ff0040", fontFamily: "monospace",
                background: "rgba(255,0,64,0.1)", padding: "1px 6px", borderRadius: 3,
                border: "1px solid rgba(255,0,64,0.3)",
              }}>{w.count} INFECTIONS</span>
            )}
            <span style={{ color: "rgba(0,212,255,0.2)", fontSize: 14 }}>◈</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WardMiniMap({ wards }: { wards: typeof DEFAULT_WARDS }) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div style={{
      background: "rgba(0,8,20,0.9)", border: "1px solid rgba(0,212,255,0.2)",
      borderRadius: 16, padding: 20, fontFamily: "monospace",
      boxShadow: "0 0 40px rgba(0,212,255,0.08), inset 0 0 40px rgba(0,0,0,0.5)",
      animation: "float 6s ease-in-out infinite",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 10, color: "#00d4ff", letterSpacing: 2 }}>HOSPITAL · LIVE VIEW</span>
        <span style={{ fontSize: 10, color: "#ff0040", animation: "blink 1.2s infinite" }}>● REC</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {wards.map((ward, i) => (
          <div
            key={ward.name}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              border: `1px solid ${hovered === i ? ward.color : "rgba(255,255,255,0.08)"}`,
              borderRadius: 8, padding: "10px 8px", cursor: "pointer",
              background: hovered === i ? `${ward.color}12` : "rgba(255,255,255,0.02)",
              transition: "all 0.2s",
              boxShadow: hovered === i ? `0 0 16px ${ward.color}44` : "none",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: STATUS_COLOR[ward.status as keyof typeof STATUS_COLOR],
                boxShadow: `0 0 6px ${STATUS_COLOR[ward.status as keyof typeof STATUS_COLOR]}`,
                display: "inline-block",
                animation: ward.status === "critical" ? "pulse-dot 1s infinite" : "none",
              }} />
              {ward.count > 0 && <span style={{ fontSize: 9, color: "#ff0040", fontWeight: 700 }}>{ward.count}</span>}
            </div>
            <div style={{ fontSize: 9, color: ward.color, fontWeight: 700, letterSpacing: 0.5, lineHeight: 1.3 }}>
              {ward.name.toUpperCase()}
            </div>
            <div style={{ fontSize: 8, color: STATUS_COLOR[ward.status as keyof typeof STATUS_COLOR], marginTop: 2, letterSpacing: 1 }}>
              {ward.status.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(0,212,255,0.1)",
        display: "flex", justifyContent: "space-between",
      }}>
        {[{ label: "CRITICAL", val: "1", color: "#ff0040" }, { label: "WARNING", val: "2", color: "#ffaa00" }, { label: "NORMAL", val: "3", color: "#00ff41" }].map(s => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 8, color: "#556677", marginTop: 3, letterSpacing: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertFeed() {
  const alerts = [
    { ward: "ICU Ward", msg: "Outbreak detected — MRSA cluster", sev: "critical", time: "0:12s" },
    { ward: "Surgery", msg: "Antibiotic resistance flagged", sev: "warning", time: "1:45s" },
    { ward: "Emergency", msg: "Positivity rate > 20%", sev: "warning", time: "3:20s" },
    { ward: "General", msg: "All metrics within normal range", sev: "normal", time: "5:01s" },
  ];
  return (
    <div style={{
      background: "rgba(0,8,20,0.9)", border: "1px solid rgba(255,0,64,0.2)",
      borderRadius: 16, padding: 20, fontFamily: "monospace",
      boxShadow: "0 0 30px rgba(255,0,64,0.06)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 10, color: "#ff0040", letterSpacing: 2 }}>LIVE ALERTS</span>
        <span style={{ fontSize: 9, color: "#556677" }}>WebSocket · Connected</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {alerts.map((a, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "8px 10px", borderRadius: 8,
            background: `rgba(${a.sev === "critical" ? "255,0,64" : a.sev === "warning" ? "255,170,0" : "0,255,65"},0.05)`,
            border: `1px solid rgba(${a.sev === "critical" ? "255,0,64" : a.sev === "warning" ? "255,170,0" : "0,255,65"},0.15)`,
          }}>
            <span style={{ fontSize: 8, marginTop: 1, fontWeight: 700, letterSpacing: 1, color: STATUS_COLOR[a.sev as keyof typeof STATUS_COLOR], minWidth: 52 }}>
              {a.sev.toUpperCase()}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "#aabbcc", marginBottom: 2 }}>{a.ward}</div>
              <div style={{ fontSize: 9, color: "#667788" }}>{a.msg}</div>
            </div>
            <span style={{ fontSize: 9, color: "#445566" }}>{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [loaded, setLoaded] = useState(false);
  const [wards, setWards] = useState(DEFAULT_WARDS);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Fetch wards from backend
  useEffect(() => {
    const fetchWards = async () => {
      try {
        const res = await getWards();
        if (res.data?.wards) {
          const mappedWards = res.data.wards.map((w: any) => ({
            name: w.name,
            color: ["#00d4ff", "#00ff41", "#8800ff", "#ff00ff", "#ffaa00", "#00ffff"][Math.floor(Math.random() * 6)],
            status: Math.random() > 0.4 ? "normal" : (Math.random() > 0.5 ? "warning" : "critical"),
            count: Math.floor(Math.random() * 5),
          }));
          setWards(mappedWards);
        }
      } catch (error) {
        console.error("Failed to fetch wards:", error);
      }
    };

    fetchWards();
  }, []);

  return (
    <div style={{
      background: "#020a14", minHeight: "100vh", color: "#e0eeff",
      fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: "hidden",
    }}>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(2,10,20,0.85)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(0,212,255,0.1)",
        padding: "0 32px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 60,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(136,0,255,0.15))",
            border: "1px solid rgba(0,212,255,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>⬡</div>
          <div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#e0eeff", letterSpacing: 0.5 }}>
              Code<span style={{ color: "#00d4ff" }}>4</span>Care
            </span>
            <span style={{
              fontSize: 9, letterSpacing: 2, color: "#445566",
              display: "block", lineHeight: 1, fontFamily: "monospace",
            }}>HISS · v2.0</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {["Features", "System", "Alerts"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{
              fontSize: 13, color: "#778899", textDecoration: "none",
              letterSpacing: 0.5, transition: "color 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#00d4ff"}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#778899"}
            >{item}</a>
          ))}
          <a href="/dashboard" style={{
            background: "linear-gradient(135deg, #00d4ff, #0088bb)",
            color: "#000814", fontWeight: 700, fontSize: 12,
            padding: "8px 18px", borderRadius: 8, textDecoration: "none",
            letterSpacing: 1,
          }}>LAUNCH DASHBOARD →</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "92vh", display: "flex", alignItems: "center" }}>
        <GridBackground />
        <div style={{
          position: "relative", zIndex: 10, maxWidth: 1200,
          margin: "0 auto", padding: "80px 32px",
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 64, alignItems: "center",
        }}>
          {/* LEFT */}
          <div style={{
            opacity: loaded ? 1 : 0,
            transform: loaded ? "none" : "translateY(30px)",
            transition: "all 0.8s ease",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,0,64,0.08)", border: "1px solid rgba(255,0,64,0.25)",
              borderRadius: 100, padding: "6px 14px", marginBottom: 28,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%", background: "#ff0040",
                display: "inline-block", animation: "pulse-dot 1s infinite",
                boxShadow: "0 0 8px #ff0040",
              }} />
              <span style={{ fontSize: 11, color: "#ff6080", letterSpacing: 2, fontFamily: "monospace", fontWeight: 700 }}>
                1 CRITICAL WARD · LIVE MONITORING
              </span>
            </div>

            <h1 style={{
              fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800,
              lineHeight: 1.08, margin: "0 0 20px", letterSpacing: -1,
            }}>
              <span style={{ color: "#e0eeff" }}>Hospital Infection</span><br />
              <span style={{
                background: "linear-gradient(90deg, #00d4ff, #8800ff)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>Surveillance</span><br />
              <span style={{ color: "#e0eeff" }}>Intelligence.</span>
            </h1>

            <p style={{ fontSize: 16, color: "#8899aa", lineHeight: 1.75, margin: "0 0 36px", maxWidth: 460 }}>
              AI-powered detection of Hospital-Acquired Infections across every ward — in real time. Isolation Forest anomaly detection meets a 3D digital twin of your entire hospital.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 48 }}>
              <a href="/dashboard" style={{
                background: "linear-gradient(135deg, #00d4ff, #0066aa)",
                color: "#000814", fontWeight: 700, fontSize: 14,
                padding: "14px 28px", borderRadius: 10, textDecoration: "none",
                letterSpacing: 0.5, display: "inline-flex", alignItems: "center", gap: 8,
                boxShadow: "0 0 30px rgba(0,212,255,0.3)",
              }}>⬡ Open 3D Dashboard</a>
              <a href="#features" style={{
                border: "1px solid rgba(0,212,255,0.25)", color: "#00d4ff",
                fontWeight: 600, fontSize: 14, padding: "14px 24px",
                borderRadius: 10, textDecoration: "none",
                background: "rgba(0,212,255,0.04)",
              }}>Explore Features →</a>
            </div>

            <div style={{ display: "flex", gap: 28 }}>
              {[
                { val: "6", label: "Wards Monitored", color: "#00d4ff" },
                { val: "8", label: "AI Features / Ward", color: "#8800ff" },
                { val: "30s", label: "Detection Cycle", color: "#00ff41" },
              ].map(m => (
                <div key={m.label}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: m.color, lineHeight: 1, fontFamily: "monospace" }}>{m.val}</div>
                  <div style={{ fontSize: 11, color: "#556677", marginTop: 4, letterSpacing: 0.5 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div style={{
            display: "flex", flexDirection: "column", gap: 16,
            opacity: loaded ? 1 : 0,
            transform: loaded ? "none" : "translateY(30px)",
            transition: "all 0.8s ease 0.2s",
          }}>
            <WardMiniMap wards={wards} />
            <AlertFeed />
          </div>
        </div>
      </section>

      {/* TICKER */}
      <WardTicker />

      {/* FEATURES */}
      <section id="features" style={{ padding: "96px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 10, color: "#00d4ff", letterSpacing: 3, fontFamily: "monospace", marginBottom: 12 }}>
            SYSTEM CAPABILITIES
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, margin: 0, letterSpacing: -0.5, color: "#e0eeff" }}>
            Built for Infection Control Teams
          </h2>
          <p style={{ color: "#556677", marginTop: 14, fontSize: 15, maxWidth: 500, marginInline: "auto" }}>
            Every layer of HISS is engineered around one goal — detecting HAIs faster than traditional surveillance.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={f.title}
              style={{
                background: "rgba(0,8,20,0.8)", borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "24px", cursor: "default",
                transition: "border-color 0.3s, transform 0.3s, box-shadow 0.3s",
                animation: `fadeUp 0.5s ease ${i * 0.07}s both`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = f.color + "44";
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 8px 32px ${f.color}18`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: 24, color: f.color, marginBottom: 14, textShadow: `0 0 12px ${f.color}88` }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px", color: "#d0e4f0" }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#556677", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="system" style={{
        padding: "80px 32px",
        background: "rgba(0,212,255,0.02)",
        borderTop: "1px solid rgba(0,212,255,0.08)",
        borderBottom: "1px solid rgba(0,212,255,0.08)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 10, color: "#8800ff", letterSpacing: 3, fontFamily: "monospace", marginBottom: 12 }}>
              SYSTEM ARCHITECTURE
            </div>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, margin: 0, color: "#e0eeff" }}>
              From Raw Data to Outbreak Alert
            </h2>
          </div>
          <div style={{ display: "flex", gap: 0, alignItems: "stretch", flexWrap: "wrap" }}>
            {[
              { step: "01", title: "Clinical Data Ingestion", desc: "Lab results, blood cultures, and infection logs are continuously streamed into the system in real time.", color: "#00d4ff" },
              { step: "02", title: "Feature Extraction", desc: "8 clinical features extracted per ward — positivity rates, antibiotic resistance, organism clustering, severity scores.", color: "#8800ff" },
              { step: "03", title: "Isolation Forest AI", desc: "The ML model identifies multivariate outliers. Combined with heuristic scoring for robustness across all ward types.", color: "#ff00ff" },
              { step: "04", title: "Alert Broadcast", desc: "Critical alerts fire instantly over WebSocket to every connected dashboard — zero polling delay, real-time push.", color: "#ff0040" },
            ].map((s, i) => (
              <div key={s.step} style={{
                flex: "1 1 200px", padding: "28px 24px",
                borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
                position: "relative",
              }}>
                <div style={{ fontSize: 11, fontFamily: "monospace", color: s.color, letterSpacing: 2, marginBottom: 12, opacity: 0.7 }}>
                  STEP {s.step}
                </div>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${s.color}18`, border: `1px solid ${s.color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, color: s.color, marginBottom: 14,
                  boxShadow: `0 0 16px ${s.color}22`,
                }}>◈</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px", color: "#c0d8ee" }}>{s.title}</h3>
                <p style={{ fontSize: 12, color: "#445566", lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                {i < 3 && (
                  <div style={{
                    position: "absolute", right: -12, top: "50%", transform: "translateY(-50%)",
                    color: "#223344", fontSize: 20, zIndex: 1,
                  }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "96px 32px", textAlign: "center" }}>
        <div style={{
          maxWidth: 640, margin: "0 auto",
          background: "rgba(0,8,20,0.9)", borderRadius: 20,
          border: "1px solid rgba(0,212,255,0.15)", padding: "56px 40px",
          boxShadow: "0 0 80px rgba(0,212,255,0.06), 0 0 40px rgba(136,0,255,0.06)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
            width: 300, height: 120, borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,212,255,0.12), transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 10, color: "#00d4ff", letterSpacing: 3, fontFamily: "monospace", marginBottom: 16 }}>
              READY TO DEPLOY?
            </div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, margin: "0 0 14px", letterSpacing: -0.5, color: "#e0eeff" }}>
              Stop HAIs before they<br />become outbreaks.
            </h2>
            <p style={{ color: "#556677", fontSize: 14, lineHeight: 1.75, margin: "0 0 32px" }}>
              HISS gives your infection control team real-time visibility across every ward — powered by AI that never sleeps.
            </p>
            <a href="/dashboard" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "linear-gradient(135deg, #00d4ff, #0066aa)",
              color: "#000814", fontWeight: 800, fontSize: 14,
              padding: "16px 36px", borderRadius: 12, textDecoration: "none",
              letterSpacing: 0.5, boxShadow: "0 0 40px rgba(0,212,255,0.35)",
            }}>⬡ Launch HISS Dashboard →</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: "1px solid rgba(0,212,255,0.08)",
        padding: "24px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16, color: "#00d4ff" }}>⬡</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#e0eeff" }}>
            Code<span style={{ color: "#00d4ff" }}>4</span>Care · HISS
          </span>
          <span style={{ fontSize: 10, color: "#334455", fontFamily: "monospace", letterSpacing: 1 }}>
            Hospital Infection Surveillance System
          </span>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#334455", fontFamily: "monospace" }}>
            FastAPI · React Three Fiber · Isolation Forest
          </span>
          <span style={{
            fontSize: 10, color: "#00ff41", fontFamily: "monospace",
            background: "rgba(0,255,65,0.08)", padding: "3px 10px",
            borderRadius: 4, border: "1px solid rgba(0,255,65,0.2)",
          }}>● SYSTEM ONLINE</span>
        </div>
      </footer>
    </div>
  );
}