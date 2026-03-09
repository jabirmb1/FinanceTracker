import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const TABS = [
  {
    path: "/",
    label: "Home",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#6c63ff" : "none"} stroke={active ? "#6c63ff" : "#aaa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    path: "/budget",
    label: "Budget",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#6c63ff" : "#aaa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
  {
    path: "/expense",
    label: "Add",
    icon: (active: boolean) => (
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        background: "linear-gradient(135deg, #6c63ff, #a78bfa)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 14px rgba(108,99,255,0.45)",
        marginBottom: 2,
        transform: active ? "scale(1.08)" : "scale(1)",
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
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#6c63ff" : "#aaa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#6c63ff" : "#aaa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{
      position: "fixed",
      bottom: 0, left: 0, right: 0,
      height: 58,
      background: "rgba(255,255,255,0.97)",
      backdropFilter: "blur(12px)",
      borderTop: "1px solid #f0eeff",
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      alignItems: "center",
      zIndex: 200,
      boxShadow: "0 -4px 20px rgba(108,99,255,0.08)",
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
            {tab.icon(active)}
            {tab.path !== "/expense" && (
              <span style={{
                fontSize: "0.55rem",
                fontWeight: active ? 800 : 500,
                color: active ? "#6c63ff" : "#bbb",
                transition: "color 0.2s",
                fontFamily: "inherit",
              }}>
                {tab.label}
              </span>
            )}
            {active && tab.path !== "/expense" && (
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#6c63ff" }} />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;