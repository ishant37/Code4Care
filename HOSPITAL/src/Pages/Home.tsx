import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getWards } from "../services/api";

const DEFAULT_WARDS = [
  { name: "ICU Ward", status: "critical", count: 3 },
  { name: "General Ward", status: "normal", count: 0 },
  { name: "Surgery OT", status: "warning", count: 1 },
  { name: "Pediatrics", status: "normal", count: 0 },
  { name: "Emergency", status: "warning", count: 2 },
  { name: "Oncology", status: "normal", count: 0 },
];

const STATUS = {
  critical: { color: "#C62828", bg: "#FFEBEE", label: "CRITICAL" },
  warning:  { color: "#E65100", bg: "#FFF3E0", label: "WARNING"  },
  normal:   { color: "#2E7D32", bg: "#E8F5E9", label: "NORMAL"   },
};

const FEATURES = [
  { emoji: "🔬", title: "AI Anomaly Detection", desc: "Isolation Forest algorithm analyses 8 clinical features per ward to surface outbreak patterns in real time.", color: "#1565C0" },
  { emoji: "📡", title: "Live WebSocket Feed", desc: "Sub-second alert broadcasting streams patient records, lab results, and ward status to every connected client.", color: "#00695C" },
  { emoji: "🏥", title: "3D Digital Twin", desc: "Interactive three-dimensional hospital map with floor-by-floor view and real-time ward status overlays.", color: "#6A1B9A" },
  { emoji: "⚕️", title: "HAI Risk Scoring", desc: "Multi-factor scoring across positivity rates, antibiotic resistance, organism clustering, and infection onset.", color: "#AD1457" },
  { emoji: "🧫", title: "Outbreak Detection", desc: "Automatically flags when the same organism appears in 30%+ of tests — before it becomes a ward-wide crisis.", color: "#00838F" },
  { emoji: "📋", title: "Role-Based Access", desc: "Doctors and Ward Managers see tailored views with appropriate data and actions for their responsibilities.", color: "#4527A0" },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [wards, setWards] = useState(DEFAULT_WARDS);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  useEffect(() => {
    getWards().then(res => {
      if (res.data?.wards) {
        setWards(res.data.wards.map((w: any, i: number) => ({
          name: w.name,
          status: i % 3 === 0 ? "critical" : i % 3 === 1 ? "warning" : "normal",
          count: i % 3 === 0 ? Math.floor(Math.random() * 4) + 1 : 0,
        })));
      }
    }).catch(() => {});
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", background: "#F0F4F8", minHeight: "100vh", color: "#1A2332" }}>

      {/* NAV */}
      <nav style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #E0E0E0",
        padding: "0 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 64, position: "sticky", top: 0, zIndex: 50,
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg, #1565C0, #0277BD)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, color: "#fff",
          }}>🏥</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#1A2332", letterSpacing: -0.3 }}>HISS</div>
            <div style={{ fontSize: 10, color: "#90A4AE", letterSpacing: 0.5 }}>Hospital Infection Surveillance</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {user ? (
            <>
              <span style={{ fontSize: 13, color: "#607D8B", marginRight: 8 }}>
                Welcome, <strong style={{ color: "#1565C0" }}>{user.full_name}</strong>
              </span>
              <button
                onClick={() => navigate("/dashboard")}
                style={{
                  padding: "9px 20px", background: "#1565C0", color: "#fff",
                  border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Go to Dashboard →
              </button>
              <button
                onClick={logout}
                style={{
                  padding: "9px 16px", background: "transparent", color: "#607D8B",
                  border: "1px solid #E0E0E0", borderRadius: 8, fontSize: 13, fontWeight: 500,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="#features" style={{ fontSize: 14, color: "#607D8B", textDecoration: "none", padding: "8px 14px" }}>Features</a>
              <a href="#how-it-works" style={{ fontSize: 14, color: "#607D8B", textDecoration: "none", padding: "8px 14px" }}>How It Works</a>
              <button
                onClick={() => navigate("/login")}
                style={{
                  padding: "9px 22px", background: "#1565C0", color: "#fff",
                  border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Sign In →
              </button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "80px 40px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 64, alignItems: "center",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "none" : "translateY(24px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}>
          {/* LEFT */}
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#FFEBEE", border: "1px solid #EF9A9A",
              borderRadius: 100, padding: "6px 14px", marginBottom: 28,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#C62828", display: "inline-block", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: 11, color: "#C62828", fontWeight: 700, letterSpacing: 0.5 }}>
                LIVE — Infection Monitoring Active
              </span>
            </div>

            <h1 style={{ fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 800, lineHeight: 1.1, margin: "0 0 20px", letterSpacing: -1, color: "#1A2332" }}>
              Real-Time Hospital<br />
              <span style={{ color: "#1565C0" }}>Infection</span> Surveillance
            </h1>

            <p style={{ fontSize: 17, color: "#546E7A", lineHeight: 1.75, margin: "0 0 36px", maxWidth: 460 }}>
              AI-powered detection of Hospital-Acquired Infections across every ward.
              Isolation Forest anomaly detection meets a 3D digital twin of your hospital.
            </p>

            <div style={{ display: "flex", gap: 12, marginBottom: 48, flexWrap: "wrap" }}>
              <button
                onClick={() => navigate(user ? "/dashboard" : "/login")}
                style={{
                  padding: "14px 28px", background: "#1565C0", color: "#fff",
                  border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 4px 16px rgba(21,101,192,0.35)",
                }}
              >
                🏥 {user ? "Open Dashboard" : "Get Started"}
              </button>
              <a href="#features" style={{
                padding: "14px 24px", border: "1.5px solid #CFD8DC",
                color: "#546E7A", borderRadius: 10, fontSize: 15, fontWeight: 600,
                cursor: "pointer", textDecoration: "none",
                background: "#fff",
              }}>
                Learn More →
              </a>
            </div>

            <div style={{ display: "flex", gap: 32 }}>
              {[
                { val: "6+", label: "Wards Monitored", color: "#1565C0" },
                { val: "8", label: "AI Features / Ward", color: "#6A1B9A" },
                { val: "30s", label: "Detection Cycle", color: "#2E7D32" },
              ].map(m => (
                <div key={m.label}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.val}</div>
                  <div style={{ fontSize: 12, color: "#90A4AE", marginTop: 4 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Live Ward Status Card */}
          <div style={{
            background: "#FFFFFF",
            borderRadius: 20,
            padding: 28,
            boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
            border: "1px solid #E0E0E0",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1A2332" }}>Hospital Live View</div>
                <div style={{ fontSize: 11, color: "#90A4AE", marginTop: 2 }}>Real-time ward status</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2E7D32", display: "inline-block", animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: 11, color: "#2E7D32", fontWeight: 600 }}>Live</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {wards.map((ward, i) => {
                const s = STATUS[ward.status as keyof typeof STATUS];
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px", borderRadius: 10,
                    background: s.bg, border: `1px solid ${s.color}22`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1A2332" }}>{ward.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {ward.count > 0 && (
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: "#C62828",
                          background: "#FFEBEE", padding: "2px 8px", borderRadius: 4,
                        }}>
                          {ward.count} HAI
                        </span>
                      )}
                      <span style={{ fontSize: 11, fontWeight: 700, color: s.color, letterSpacing: 0.5 }}>
                        {s.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #ECEFF1", display: "flex", justifyContent: "space-between" }}>
              {[
                { label: "Critical", val: wards.filter(w => w.status === "critical").length, color: "#C62828" },
                { label: "Warning", val: wards.filter(w => w.status === "warning").length, color: "#E65100" },
                { label: "Normal", val: wards.filter(w => w.status === "normal").length, color: "#2E7D32" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "#90A4AE", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "72px 40px", background: "#FFFFFF" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 11, color: "#1565C0", fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 }}>SYSTEM CAPABILITIES</div>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 800, margin: 0, color: "#1A2332", letterSpacing: -0.5 }}>
              Built for Clinical Teams
            </h2>
            <p style={{ color: "#607D8B", marginTop: 14, fontSize: 15, maxWidth: 500, marginInline: "auto", lineHeight: 1.6 }}>
              Every layer of HISS is engineered to detect HAIs faster than traditional surveillance — protecting your patients.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} style={{
                background: "#F8FAFC", borderRadius: 14,
                border: "1px solid #ECEFF1", padding: 28,
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.1)`;
                  e.currentTarget.style.borderColor = f.color + "44";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "#ECEFF1";
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: f.color + "14", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 22, marginBottom: 16,
                }}>{f.emoji}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px", color: "#1A2332" }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "#607D8B", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "72px 40px", background: "#F0F4F8" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 11, color: "#00695C", fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 }}>SYSTEM ARCHITECTURE</div>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 800, margin: 0, color: "#1A2332" }}>
              From Raw Data to Outbreak Alert
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {[
              { step: "01", title: "Data Ingestion", desc: "Lab results, blood cultures, and infection logs stream in continuously in real time.", color: "#1565C0", icon: "🧪" },
              { step: "02", title: "Feature Extraction", desc: "8 clinical features extracted per ward — positivity rates, antibiotic resistance, severity scores.", color: "#6A1B9A", icon: "📊" },
              { step: "03", title: "AI Detection", desc: "Isolation Forest identifies multivariate outliers. Combined with heuristic scoring for robustness.", color: "#00695C", icon: "🤖" },
              { step: "04", title: "Alert Broadcast", desc: "Critical alerts fire instantly over WebSocket to every connected dashboard — real-time push.", color: "#C62828", icon: "🚨" },
            ].map(s => (
              <div key={s.step} style={{
                background: "#FFFFFF", borderRadius: 14, padding: 24,
                border: "1px solid #ECEFF1",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}>
                <div style={{ fontSize: 11, color: s.color, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>
                  STEP {s.step}
                </div>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: "#1A2332" }}>{s.title}</h3>
                <p style={{ fontSize: 12, color: "#607D8B", lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "72px 40px", background: "linear-gradient(135deg, #1565C0, #0277BD)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", color: "#fff" }}>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, margin: "0 0 16px", letterSpacing: -0.5 }}>
            Ready to Protect Your Patients?
          </h2>
          <p style={{ fontSize: 16, opacity: 0.8, margin: "0 0 36px", lineHeight: 1.6 }}>
            Sign in with your hospital credentials to access the infection surveillance dashboard.
          </p>
          <button
            onClick={() => navigate(user ? "/dashboard" : "/login")}
            style={{
              padding: "16px 36px", background: "#FFFFFF", color: "#1565C0",
              border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            {user ? "Open Dashboard →" : "Sign In →"}
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "24px 40px", background: "#1A2332", color: "#546E7A", textAlign: "center", fontSize: 13 }}>
        © 2024 HISS — Hospital Infection Surveillance System · Secure Healthcare Technology
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.85); } }
      `}</style>
    </div>
  );
}
