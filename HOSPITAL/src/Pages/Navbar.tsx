import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const COLORS = {
  sidebarBg: "#1A237E",
  sidebarBorder: "rgba(255,255,255,0.08)",
  activeItem: "rgba(66,165,245,0.2)",
  activeBorder: "#42A5F5",
  hoverItem: "rgba(255,255,255,0.06)",
  textPrimary: "#E3F2FD",
  textSecondary: "#90CAF9",
  textMuted: "rgba(144,202,249,0.5)",
  accent: "#42A5F5",
};

const Icon = {
  Home: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Alert: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Ward: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><line x1="9" y1="22" x2="9" y2="12"/><line x1="15" y1="22" x2="15" y2="12"/><line x1="9" y1="12" x2="15" y2="12"/>
    </svg>
  ),
  AI: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Patient: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Collapse: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  Expand: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Logout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

interface NavItem {
  label: string;
  path: string;
  icon: () => JSX.Element;
  badge?: number | string;
  badgeColor?: string;
  roles?: ("doctor" | "wardman")[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Home", path: "/", icon: Icon.Home },
      { label: "Dashboard", path: "/dashboard", icon: Icon.Dashboard },
    ],
  },
  {
    title: "SURVEILLANCE",
    items: [
      { label: "Live Alerts", path: "/dashboard", icon: Icon.Alert, badge: "LIVE", badgeColor: "#EF5350", roles: ["doctor"] },
      { label: "Ward Monitor", path: "/dashboard", icon: Icon.Ward },
      { label: "Patients", path: "/dashboard", icon: Icon.Patient, roles: ["doctor"] },
      { label: "AI Detection", path: "/dashboard", icon: Icon.AI, badge: "AI", badgeColor: "#42A5F5", roles: ["doctor"] },
    ],
  },
];

export default function SideNavbar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;
  const W = collapsed ? 64 : 220;

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const roleColor = user?.role === "doctor" ? "#42A5F5" : "#4DB6AC";
  const roleLabel = user?.role === "doctor" ? "Doctor" : "Ward Manager";

  const filteredSections = NAV_SECTIONS.map(section => ({
    ...section,
    items: section.items.filter(item =>
      !item.roles || !user || item.roles.includes(user.role as any)
    ),
  }));

  return (
    <aside style={{
      width: W, minWidth: W,
      height: "100vh",
      background: COLORS.sidebarBg,
      borderRight: `1px solid ${COLORS.sidebarBorder}`,
      display: "flex", flexDirection: "column",
      transition: "width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)",
      position: "sticky", top: 0,
      overflow: "hidden",
      boxShadow: "4px 0 20px rgba(0,0,0,0.25)",
      zIndex: 40,
    }}>

      {/* Logo */}
      <div style={{
        padding: collapsed ? "18px 0" : "18px 16px",
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        borderBottom: `1px solid ${COLORS.sidebarBorder}`,
        minHeight: 64,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: "rgba(66,165,245,0.2)",
            border: "1px solid rgba(66,165,245,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17,
          }}>🏥</div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.textPrimary, letterSpacing: -0.3, whiteSpace: "nowrap" }}>
                HISS
              </div>
              <div style={{ fontSize: 9, color: COLORS.textMuted, letterSpacing: 0.5, marginTop: 1 }}>
                v2.0 · Infection Surveillance
              </div>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 6px", color: COLORS.textMuted, cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.2s" }}
          >
            <Icon.Collapse />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          style={{ margin: "10px auto 0", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "5px 7px", color: COLORS.textMuted, cursor: "pointer", display: "flex", alignItems: "center" }}
        >
          <Icon.Expand />
        </button>
      )}

      {/* Role badge */}
      {!collapsed && user && (
        <div style={{ margin: "10px 12px 0", padding: "8px 12px", borderRadius: 8, background: `${roleColor}18`, border: `1px solid ${roleColor}33`, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13 }}>{user.role === "doctor" ? "🩺" : "🏥"}</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: roleColor }}>{roleLabel}</div>
            <div style={{ fontSize: 9, color: COLORS.textMuted, marginTop: 1 }}>
              {user.department}
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: collapsed ? "14px 8px" : "14px 10px" }}>
        {filteredSections.map((section, si) => (
          <div key={section.title} style={{ marginBottom: 18 }}>
            {!collapsed && (
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: COLORS.textMuted, padding: "0 10px", marginBottom: 6 }}>
                {section.title}
              </div>
            )}
            {collapsed && si > 0 && <div style={{ height: 1, background: COLORS.sidebarBorder, margin: "6px 0 10px" }} />}
            {section.items.map(item => {
              const isActive = currentPath === item.path;
              return (
                <div
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: "flex", alignItems: "center",
                    gap: 10, padding: collapsed ? "10px 0" : "9px 10px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    borderRadius: 8, cursor: "pointer",
                    background: isActive ? COLORS.activeItem : "transparent",
                    border: isActive ? `1px solid ${COLORS.activeBorder}33` : "1px solid transparent",
                    marginBottom: 2,
                    transition: "all 0.15s",
                    position: "relative",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = COLORS.hoverItem; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  {isActive && (
                    <div style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3, borderRadius: "0 3px 3px 0", background: COLORS.accent }} />
                  )}
                  <div style={{ color: isActive ? COLORS.accent : COLORS.textMuted, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: 20 }}>
                    <item.icon />
                  </div>
                  {!collapsed && (
                    <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? COLORS.textPrimary : COLORS.textSecondary, flex: 1, whiteSpace: "nowrap" }}>
                      {item.label}
                    </span>
                  )}
                  {!collapsed && item.badge && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: item.badgeColor ?? COLORS.accent, background: `${item.badgeColor ?? COLORS.accent}20`, border: `1px solid ${item.badgeColor ?? COLORS.accent}44`, padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Status strip */}
      {!collapsed && (
        <div style={{ margin: "0 10px 10px", padding: "10px 12px", background: "rgba(46,125,50,0.12)", border: "1px solid rgba(46,125,50,0.25)", borderRadius: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#66BB6A", boxShadow: "0 0 6px #66BB6A", display: "inline-block" }} />
            <span style={{ fontSize: 10, color: "#66BB6A", fontWeight: 700, letterSpacing: 0.5 }}>SYSTEM ONLINE</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, color: COLORS.textMuted }}>WebSocket</span>
            <span style={{ fontSize: 10, color: "#66BB6A" }}>Connected</span>
          </div>
        </div>
      )}

      {/* User + logout */}
      <div style={{
        borderTop: `1px solid ${COLORS.sidebarBorder}`,
        padding: collapsed ? "12px 0" : "12px 12px",
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: `linear-gradient(135deg, ${roleColor}44, ${roleColor}22)`,
            border: `1.5px solid ${roleColor}88`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: roleColor,
          }}>
            {initials}
          </div>
          {!collapsed && user && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 110 }}>
                {user.full_name}
              </div>
              <div style={{ fontSize: 9, color: COLORS.textMuted }}>
                {user.employee_id}
              </div>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={logout}
            title="Logout"
            style={{ background: "transparent", border: "none", cursor: "pointer", color: COLORS.textMuted, padding: 4, borderRadius: 6, display: "flex", alignItems: "center", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "#EF5350"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = COLORS.textMuted}
          >
            <Icon.Logout />
          </button>
        )}
      </div>
    </aside>
  );
}
