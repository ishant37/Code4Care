import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const THEME = {
  primary: "#1565C0",
  primaryLight: "#42A5F5",
  primaryBg: "#E3F2FD",
  success: "#2E7D32",
  danger: "#C62828",
  bg: "#F0F4F8",
  surface: "#FFFFFF",
  textPrimary: "#1A2332",
  textSecondary: "#607D8B",
  border: "#CFD8DC",
};

const roles = [
  {
    key: "doctor",
    label: "Doctor",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
        <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
        <circle cx="20" cy="10" r="2" />
      </svg>
    ),
    hint: "Full clinical dashboard access, AI alerts, patient data",
    color: "#1565C0",
    bgColor: "#E3F2FD",
  },
  {
    key: "wardman",
    label: "Ward Manager",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    hint: "Ward status overview, cleaning tasks, basic alerts",
    color: "#00695C",
    bgColor: "#E0F2F1",
  },
];

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<"doctor" | "wardman">("doctor");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleRoleSwitch = (role: "doctor" | "wardman") => {
    setSelectedRole(role);
    setUsername(role === "doctor" ? "doctor" : "wardman");
    setPassword("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError("Please enter your credentials."); return; }
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeRole = roles.find(r => r.key === selectedRole)!;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #E3F2FD 0%, #F0F4F8 50%, #E8F5E9 100%)",
      display: "flex",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Left Panel */}
      <div style={{
        flex: 1,
        background: "linear-gradient(160deg, #0D47A1 0%, #1565C0 40%, #0277BD 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px 56px",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "40%", right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 56 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(255,255,255,0.9)",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>HISS</div>
            <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: 1 }}>Hospital Infection Surveillance</div>
          </div>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15, margin: "0 0 20px", letterSpacing: -0.5 }}>
          Protecting Patients,<br />
          <span style={{ color: "#90CAF9" }}>One Ward at a Time.</span>
        </h1>

        <p style={{ fontSize: 16, lineHeight: 1.7, opacity: 0.75, maxWidth: 380, margin: "0 0 48px" }}>
          AI-powered real-time surveillance of Hospital-Acquired Infections across every ward.
          Isolation Forest anomaly detection meets a 3D digital twin.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            {
              label: "AI Anomaly Detection", desc: "Isolation Forest algorithm, 30s cycles",
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
            },
            {
              label: "Live WebSocket Feed", desc: "Real-time alerts across all wards",
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01"/></svg>,
            },
            {
              label: "3D Digital Twin", desc: "Interactive hospital floor map",
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
            },
          ].map(f => (
            <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgba(255,255,255,0.85)", flexShrink: 0,
              }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: 12, opacity: 0.55 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 56, padding: "14px 0", borderTop: "1px solid rgba(255,255,255,0.12)", fontSize: 11, opacity: 0.45, letterSpacing: 0.5 }}>
          HISS v2.0 · Hospital Infection Surveillance System · Secure Access
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div style={{
        width: 480,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 48px",
        background: "#FFFFFF",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.08)",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "none" : "translateX(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: THEME.textPrimary, margin: "0 0 8px", letterSpacing: -0.5 }}>
              Sign in to HISS
            </h2>
            <p style={{ fontSize: 14, color: THEME.textSecondary, margin: 0, lineHeight: 1.5 }}>
              Use your hospital credentials to access the system.
            </p>
          </div>

          {/* Role Selector */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: THEME.textSecondary, letterSpacing: 0.5, display: "block", marginBottom: 10 }}>
              SELECT YOUR ROLE
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {roles.map(role => (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => handleRoleSwitch(role.key as any)}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 10,
                    border: `2px solid ${selectedRole === role.key ? role.color : THEME.border}`,
                    background: selectedRole === role.key ? role.bgColor : "#FAFAFA",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 6,
                    transition: "all 0.2s ease",
                    textAlign: "left",
                  }}
                >
                  <div style={{ color: selectedRole === role.key ? role.color : THEME.textSecondary, display: "flex", alignItems: "center", gap: 8 }}>
                    {role.icon}
                    <span style={{ fontSize: 14, fontWeight: 700, color: selectedRole === role.key ? role.color : THEME.textPrimary }}>
                      {role.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: THEME.textSecondary, lineHeight: 1.4 }}>
                    {role.hint}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: THEME.textSecondary, letterSpacing: 0.5, display: "block", marginBottom: 7 }}>
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(""); }}
                placeholder={selectedRole === "doctor" ? "doctor" : "wardman"}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: `1.5px solid ${error ? THEME.danger : username ? activeRole.color : THEME.border}`,
                  fontSize: 14,
                  color: THEME.textPrimary,
                  background: "#FAFAFA",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: THEME.textSecondary, letterSpacing: 0.5, display: "block", marginBottom: 7 }}>
                PASSWORD
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter your password"
                  style={{
                    width: "100%",
                    padding: "12px 44px 12px 14px",
                    borderRadius: 8,
                    border: `1.5px solid ${error ? THEME.danger : password ? activeRole.color : THEME.border}`,
                    fontSize: 14,
                    color: THEME.textPrimary,
                    background: "#FAFAFA",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: THEME.textSecondary, padding: 4, display: "flex",
                  }}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: "10px 14px", borderRadius: 8,
                background: "#FFEBEE", border: "1px solid #EF9A9A",
                fontSize: 13, color: THEME.danger, display: "flex", alignItems: "center", gap: 8,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px",
                borderRadius: 10,
                border: "none",
                background: loading ? "#90CAF9" : activeRole.color,
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "background 0.2s, transform 0.1s",
                fontFamily: "inherit",
                letterSpacing: 0.3,
                marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.1)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = "none"; }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in as {activeRole.label}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Credentials hint */}
          <div style={{
            marginTop: 28,
            padding: "16px",
            borderRadius: 10,
            background: "#F8F9FA",
            border: "1px solid #E0E0E0",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: THEME.textSecondary, letterSpacing: 0.5, marginBottom: 10 }}>
              DEMO CREDENTIALS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: THEME.textPrimary, fontWeight: 600 }}>🩺 Doctor</span>
                <code style={{ fontSize: 11, background: "#E3F2FD", color: "#1565C0", padding: "2px 8px", borderRadius: 4 }}>
                  doctor / Doctor@2024
                </code>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: THEME.textPrimary, fontWeight: 600 }}>🏥 Ward Man</span>
                <code style={{ fontSize: 11, background: "#E0F2F1", color: "#00695C", padding: "2px 8px", borderRadius: 4 }}>
                  wardman / Ward@2024
                </code>
              </div>
            </div>
          </div>

          <p style={{ marginTop: 20, fontSize: 11, color: THEME.textSecondary, textAlign: "center", lineHeight: 1.5 }}>
            This is a secure healthcare system. Unauthorized access is prohibited.<br />
            All activity is monitored and logged.
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #B0BEC5; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
