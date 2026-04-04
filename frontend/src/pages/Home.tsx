import React, { useContext, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import type { AppContextType } from "../context/AppContext";
import { AnimatePresence, motion } from "framer-motion";
import Chart from "../components/BarChart";

const formatMonth = (key: string): string => {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
};

const ACCENT_MAP: Record<string, string> = {
  midnight: "#6c63ff", ocean: "#0369a1", forest: "#2d6a4f", navy: "#1e3a5f",
  rose: "#e11d48", orange: "#ea580c", plum: "#7c3aed", teal: "#0d9488",
};

const SpendingRing: React.FC<{ spent: number; budget: number; currency: string }> = ({ spent, budget, currency }) => {
  const [isDark, setIsDark] = useState(() => document.body.classList.contains("dark"));
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

  const pct   = budget > 0 ? Math.min(spent / budget, 1) : 0;
  const r     = 52, circ = 2 * Math.PI * r;
  const dash  = pct * circ;

  // Fix #13: proper custom accent handling
  const accentColor = accentId === "custom"
    ? (localStorage.getItem("customAccent") || "#6c63ff")
    : (ACCENT_MAP[accentId] || "#6c63ff");

  const color = pct > 0.9 ? "#ef4444" : pct > 0.7 ? "#f59e0b" : accentColor;

  const spentColor  = isDark ? "#e6edf3" : "#0f1c2e";
  const ofColor     = isDark ? "#8b949e" : "#6b7280";
  const trackColor  = isDark ? "#21262d" : "#f0eeff";

  return (
    <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 20px" }}>
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke={trackColor} strokeWidth="12" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "1.3rem", fontWeight: 900, color: spentColor, lineHeight: 1 }}>
          {currency}{spent.toLocaleString()}
        </span>
        <span style={{ fontSize: "0.6rem", color: ofColor, fontWeight: 600, marginTop: 3 }}>
          of {currency}{budget.toLocaleString()}
        </span>
        <span style={{ fontSize: "0.7rem", fontWeight: 800, color, marginTop: 3 }}>
          {Math.round(pct * 100)}%
        </span>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const { budgets, expenses, monthKey, prevMonth, nextMonth, goToCurrentMonth, currency, formatMoney } =
    useContext<AppContextType>(AppContext);
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => document.body.classList.contains("dark"));

  // Fix #6: remove setInterval, use event listener only
  useEffect(() => {
    const sync = () => setIsDark(document.body.classList.contains("dark"));
    window.addEventListener("ft-settings-change", sync);
    return () => window.removeEventListener("ft-settings-change", sync);
  }, []);

  const totalBudget = useMemo(() => budgets.reduce((s, b) => s + b.budget, 0), [budgets]);
  const totalSpent  = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const remaining   = Math.max(totalBudget - totalSpent, 0);
  const overspent   = totalSpent > totalBudget;
  const currentMonthKey = new Date().toISOString().slice(0, 7);

  const cardBg     = isDark ? "#161b22" : "#ffffff";
  const cardBorder = isDark ? "#30363d" : "#f0eeff";
  const textMuted  = isDark ? "#8b949e" : "#6b7280";
  const textMain   = isDark ? "#e6edf3" : "#0f1c2e";
  const navBg      = isDark ? "#161b22" : "#f7f8fa";

  return (
    <div className="page">
      <p style={{ textAlign: "center", fontSize: "0.65rem", color: textMuted, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
        {formatMonth(monthKey)}
      </p>
      <h1 className="title" style={{ color: textMain }}>Overview</h1>

      <AnimatePresence mode="wait">
        <motion.div key={monthKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>

          <SpendingRing spent={totalSpent} budget={totalBudget} currency={currency} />

          {/* Summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Budget",     value: formatMoney(totalBudget), color: "#6c63ff" },
              { label: "Spent",      value: formatMoney(totalSpent),  color: "#f59e0b" },
              { label: "Remaining",  value: formatMoney(remaining),   color: overspent ? "#ef4444" : "#10b981" },
              { label: "Categories", value: String(budgets.length),   color: "#3b82f6" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, padding: "12px 14px" }}>
                <div style={{ fontSize: "0.6rem", fontWeight: 800, color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: "1.05rem", fontWeight: 900, color: textMain }}>{value}</div>
              </div>
            ))}
          </div>

          <Chart />

          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 16 }}>
            <button onClick={prevMonth} style={{ background: navBg, border: `1px solid ${cardBorder}`, borderRadius: 99, padding: "7px 14px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", color: textMuted, fontFamily: "inherit" }}>← Prev</button>
            <span style={{ fontSize: "0.72rem", color: textMuted, fontWeight: 600 }}>{formatMonth(monthKey)}</span>
            <button onClick={nextMonth} style={{ background: navBg, border: `1px solid ${cardBorder}`, borderRadius: 99, padding: "7px 14px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", color: textMuted, fontFamily: "inherit" }}>Next →</button>
          </div>

          {monthKey !== currentMonthKey && (
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <button onClick={goToCurrentMonth} style={{ background: "#6c63ff", color: "#fff", border: "none", borderRadius: 99, padding: "6px 16px", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>
                Jump to This Month
              </button>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Home;