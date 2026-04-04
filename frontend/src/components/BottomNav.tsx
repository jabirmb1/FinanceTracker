import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const TABS = [
  {
    path: "/",
    label: "Home",
    icon: (active: boolean, accent: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? accent : "none"} stroke={active ? accent : "#8b949e"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    path: "/budget",
    label: "Budget",
    icon: (active: boolean, accent: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? accent : "#8b949e"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
  {
    path: "/expense",
    label: "Add",
    icon: (_active: boolean, accent: string) => (
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        background: accent,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 4px 14px ${accent}55`,
        transition: "transform 0.2s ease",
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
    ),
  },
  {
    path: "/transactions",
    label: "History",
    icon: (active: boolean, accent: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? accent : "#8b949e"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/>
        <line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/>
        <line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
  },
  {
    path: "/profile",
    label: "Profile",
    icon: (active: boolean, accent: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? accent : "#8b949e"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

const ACCENT_MAP: Record<string, string> = {
  midnight: "#6c63ff", ocean: "#0369a1", forest: "#2d6a4f", navy: "#1e3a5f",
  rose: "#e11d48", orange: "#ea580c", plum: "#7c3aed", teal: "#0d9488",
};

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [accentId, setAccentId] = useState(() => localStorage.getItem("accentColor") || "midnight");

  // Fix #6: remove setInterval, use event listener only
  useEffect(() => {
    const sync = () => {
      setIsDark(document.body.classList.contains("dark"));
      setAccentId(localStorage.getItem("accentColor") || "midnight");
    };
    window.addEventListener("ft-settings-change", sync);
    return () => window.removeEventListener("ft-settings-change", sync);
  }, []);

  const accent = accentId === "custom"
    ? (localStorage.getItem("customAccent") || "#6c63ff")
    : (ACCENT_MAP[accentId] || "#6c63ff");

  const bg     = isDark ? "#0d1117"              : "rgba(255,255,255,0.97)";
  const border = isDark ? "#30363d"              : "#f0eeff";

  return (
    <div style={{
      position: "fixed",
      bottom: 0, left: 0, right: 0,
      height: 58,
      background: bg,
      backdropFilter: "blur(12px)",
      borderTop: `1px solid ${border}`,
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      alignItems: "center",
      zIndex: 200,
      boxShadow: isDark ? "0 -4px 20px rgba(0,0,0,0.4)" : "0 -4px 20px rgba(108,99,255,0.08)",
      transition: "background 0.3s, border-color 0.3s",
    }}>
      {TABS.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 2, padding: "4px 0", height: "100%",
            }}
          >
            {tab.icon(active, accent)}
            {tab.path !== "/expense" && (
              <span style={{
                fontSize: "0.55rem",
                fontWeight: active ? 800 : 500,
                color: active ? accent : (isDark ? "#484f58" : "#bbb"),
                transition: "color 0.2s",
                fontFamily: "inherit",
              }}>
                {tab.label}
              </span>
            )}
            {active && tab.path !== "/expense" && (
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: accent }} />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;