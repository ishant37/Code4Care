import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import React from "react";

// ── Icons (inline SVG to avoid extra deps) ─────────────────────────────────
const Icon = {
  Home: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Alert: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Ward: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><line x1="9" y1="22" x2="9" y2="12"/><line x1="15" y1="22" x2="15" y2="12"/><line x1="9" y1="12" x2="15" y2="12"/>
    </svg>
  ),
  Patient: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Lab: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v11l-5 5h20l-5-5V3"/><line x1="3" y1="9" x2="21" y2="9"/>
    </svg>
  ),
  AI: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M2 12h2M20 12h2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41"/>
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

// ── Nav item type ──────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  path: string;
  icon: () => JSX.Element;
  color: string;
  badge?: number | string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

// ── Nav config ─────────────────────────────────────────────────────────────
const NAV_SECTIONS: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Home", path: "/", icon: Icon.Home, color: "#00d4ff" },
      { label: "Dashboard", path: "/dashboard", icon: Icon.Dashboard, color: "#8800ff" },
    ],
  },
  {
    title: "SURVEILLANCE",
    items: [
      {
        label: "Live Alerts",
        path: "/alerts",
        icon: Icon.Alert,
        color: "#ff0040",
        badge: 3,
        badgeColor: "#ff0040",
      },
      { label: "Ward Monitor", path: "/wards", icon: Icon.Ward, color: "#00ff41" },
      { label: "Patient Records", path: "/patients", icon: Icon.Patient, color: "#ff00ff" },
      { label: "Lab Reports", path: "/lab", icon: Icon.Lab, color: "#ffaa00" },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      {
        label: "AI Detection",
        path: "/ai",
        icon: Icon.AI,
        color: "#00ffff",
        badge: "NEW",
        badgeColor: "#00ff41",
      },
      {
        label: "EHR Sync",
        path: "/ehr-sync",
        icon: Icon.Lab,
        color: "#ff6b9d",
        badge: "FHIR",
        badgeColor: "#ff6b9d",
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Settings", path: "/settings", icon: Icon.Settings, color: "#778899" },
    ],
  },
];

// ── Single nav item component ──────────────────────────────────────────────
interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

function NavItemRow({ item, isActive, isCollapsed, onClick }: NavItemProps) {
  const [hovered, setHovered] = useState(false);
  const highlight = isActive || hovered;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={isCollapsed ? item.label : undefined}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: isCollapsed ? "10px 0" : "10px 12px",
        justifyContent: isCollapsed ? "center" : "flex-start",
        borderRadius: 10,
        cursor: "pointer",
        transition: "all 0.2s ease",
        background: isActive
          ? `${item.color}18`
          : hovered
          ? `${item.color}0d`
          : "transparent",
        border: isActive
          ? `1px solid ${item.color}33`
          : "1px solid transparent",
        marginBottom: 2,
        overflow: "hidden",
      }}
    >
      {/* Active left bar */}
      <div style={{
        position: "absolute",
        left: 0, top: "20%", bottom: "20%",
        width: 3,
        borderRadius: "0 3px 3px 0",
        background: item.color,
        opacity: isActive ? 1 : 0,
        transition: "opacity 0.2s",
        boxShadow: `0 0 8px ${item.color}`,
      }} />

      {/* Hover glow sweep */}
      {hovered && !isActive && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `linear-gradient(90deg, ${item.color}08, transparent)`,
          borderRadius: 10,
        }} />
      )}

      {/* Icon */}
      <div style={{
        color: highlight ? item.color : "#445566",
        transition: "color 0.2s, filter 0.2s",
        filter: highlight ? `drop-shadow(0 0 6px ${item.color}88)` : "none",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
      }}>
        <item.icon />
      </div>

      {/* Label */}
      {!isCollapsed && (
        <span style={{
          fontSize: 13,
          fontWeight: isActive ? 700 : 500,
          color: highlight ? "#e0eeff" : "#667788",
          transition: "color 0.2s",
          flex: 1,
          letterSpacing: 0.3,
          fontFamily: "monospace",
          whiteSpace: "nowrap",
        }}>
          {item.label}
        </span>
      )}

      {/* Badge */}
      {!isCollapsed && item.badge !== undefined && (
        <span style={{
          fontSize: 9,
          fontWeight: 700,
          fontFamily: "monospace",
          letterSpacing: 0.5,
          color: item.badgeColor ?? "#00d4ff",
          background: `${item.badgeColor ?? "#00d4ff"}18`,
          border: `1px solid ${item.badgeColor ?? "#00d4ff"}44`,
          padding: "2px 6px",
          borderRadius: 4,
          flexShrink: 0,
        }}>
          {item.badge}
        </span>
      )}

      {/* Collapsed badge dot */}
      {isCollapsed && item.badge !== undefined && (
        <div style={{
          position: "absolute",
          top: 6, right: 6,
          width: 6, height: 6,
          borderRadius: "50%",
          background: item.badgeColor ?? "#ff0040",
          boxShadow: `0 0 6px ${item.badgeColor ?? "#ff0040"}`,
        }} />
      )}
    </div>
  );
}

// ── Main SideNavbar ────────────────────────────────────────────────────────
interface SideNavbarProps {
  /** Optional: override active path (defaults to useLocation) */
  activePath?: string;
}

export default function SideNavbar({ activePath }: SideNavbarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = activePath ?? location.pathname;

  const W = collapsed ? 64 : 220;

  return (
    <aside style={{
      width: W,
      minWidth: W,
      height: "100vh",
      background: "rgba(2,8,18,0.97)",
      borderRight: "1px solid rgba(0,212,255,0.1)",
      display: "flex",
      flexDirection: "column",
      transition: "width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)",
      position: "sticky",
      top: 0,
      overflow: "hidden",
      boxShadow: "4px 0 32px rgba(0,0,0,0.5)",
      zIndex: 40,
    }}>

      {/* ── Logo ────────────────────────────────────────────── */}
      <div style={{
        padding: collapsed ? "20px 0" : "20px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        borderBottom: "1px solid rgba(0,212,255,0.08)",
        minHeight: 64,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Hex logo mark */}
          <div style={{
            width: 32, height: 32, flexShrink: 0,
            borderRadius: 8,
            background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(136,0,255,0.2))",
            border: "1px solid rgba(0,212,255,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, color: "#00d4ff",
            boxShadow: "0 0 16px rgba(0,212,255,0.2)",
          }}>⬡</div>

          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <div style={{
                fontSize: 14, fontWeight: 700, color: "#e0eeff",
                letterSpacing: 0.5, lineHeight: 1, whiteSpace: "nowrap",
                fontFamily: "monospace",
              }}>
                Code<span style={{ color: "#00d4ff" }}>4</span>Care
              </div>
              <div style={{
                fontSize: 9, color: "#334455", letterSpacing: 2,
                marginTop: 3, fontFamily: "monospace",
              }}>HISS · v2.0</div>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            style={{
              background: "rgba(0,212,255,0.05)",
              border: "1px solid rgba(0,212,255,0.15)",
              borderRadius: 6, padding: "4px 6px",
              color: "#445566", cursor: "pointer",
              display: "flex", alignItems: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = "#00d4ff";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,212,255,0.4)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = "#445566";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,212,255,0.15)";
            }}
          >
            <Icon.Collapse />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          style={{
            margin: "12px auto 0",
            background: "rgba(0,212,255,0.05)",
            border: "1px solid rgba(0,212,255,0.15)",
            borderRadius: 6, padding: "5px 7px",
            color: "#445566", cursor: "pointer",
            display: "flex", alignItems: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = "#00d4ff";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,212,255,0.4)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = "#445566";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,212,255,0.15)";
          }}
        >
          <Icon.Expand />
        </button>
      )}

      {/* ── Nav sections ────────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: collapsed ? "16px 8px" : "16px 12px" }}>
        {NAV_SECTIONS.map((section, si) => (
          <div key={section.title} style={{ marginBottom: 20 }}>
            {/* Section label */}
            {!collapsed && (
              <div style={{
                fontSize: 9, fontWeight: 700, letterSpacing: 2,
                color: "#2a3a4a", fontFamily: "monospace",
                padding: "0 12px", marginBottom: 6,
              }}>
                {section.title}
              </div>
            )}
            {collapsed && si > 0 && (
              <div style={{
                height: 1, background: "rgba(0,212,255,0.07)",
                margin: "8px 0 12px",
              }} />
            )}

            {section.items.map(item => (
              <NavItemRow
                key={item.path}
                item={item}
                isActive={currentPath === item.path}
                isCollapsed={collapsed}
                onClick={() => navigate(item.path)}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* ── System status strip ──────────────────────────────── */}
      {!collapsed && (
        <div style={{
          margin: "0 12px 12px",
          padding: "10px 12px",
          background: "rgba(0,255,65,0.04)",
          border: "1px solid rgba(0,255,65,0.12)",
          borderRadius: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#00ff41",
              boxShadow: "0 0 8px #00ff41",
              display: "inline-block",
              animation: "pulse-dot 2s infinite",
            }} />
            <span style={{ fontSize: 10, color: "#00ff41", fontFamily: "monospace", letterSpacing: 1 }}>
              SYSTEM ONLINE
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 9, color: "#334455", fontFamily: "monospace" }}>WebSocket</span>
            <span style={{ fontSize: 9, color: "#00ff41", fontFamily: "monospace" }}>Connected</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
            <span style={{ fontSize: 9, color: "#334455", fontFamily: "monospace" }}>AI Model</span>
            <span style={{ fontSize: 9, color: "#00d4ff", fontFamily: "monospace" }}>Active</span>
          </div>
        </div>
      )}

      {/* Collapsed status dot */}
      {collapsed && (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#00ff41",
            boxShadow: "0 0 10px #00ff41",
            display: "inline-block",
          }} />
        </div>
      )}

      {/* ── User + logout ────────────────────────────────────── */}
      <div style={{
        borderTop: "1px solid rgba(0,212,255,0.08)",
        padding: collapsed ? "12px 0" : "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          {/* Avatar */}
          <div style={{
            width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #00d4ff44, #8800ff44)",
            border: "1px solid rgba(0,212,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "#00d4ff",
            fontFamily: "monospace",
          }}>IC</div>

          {!collapsed && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#c0d0e0", fontFamily: "monospace" }}>
                IC Admin
              </div>
              <div style={{ fontSize: 9, color: "#334455", letterSpacing: 0.5 }}>
                Infection Control
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "#334455", padding: 4, borderRadius: 6,
              display: "flex", alignItems: "center",
              transition: "color 0.2s",
            }}
            title="Logout"
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "#ff0040"}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "#334455"}
          >
            <Icon.Logout />
          </button>
        )}
      </div>

      {/* Global keyframes */}
      <style>{`
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.5; transform:scale(0.85); }
        }
      `}</style>
    </aside>
  );
}