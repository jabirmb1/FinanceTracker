import React, { useContext, useMemo } from "react";
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

// Spending ring component
const SpendingRing: React.FC<{ spent: number; budget: number }> = ({ spent, budget }) => {
  const pct = budget > 0 ? Math.min(spent / budget, 1) : 0;
  const r = 52, circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const color = pct > 0.9 ? "#ef4444" : pct > 0.7 ? "#f59e0b" : "#6c63ff";
  return (
    <div style={{ position: "relative", width: 130, height: 130, margin: "0 auto 16px" }}>
      <svg width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="65" cy="65" r={r} fill="none" stroke="#f0eeff" strokeWidth="10" />
        <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "1.25rem", fontWeight: 900, color: "#1a1a2e" }}>£{spent}</span>
        <span style={{ fontSize: "0.6rem", color: "#aaa", fontWeight: 600 }}>of £{budget}</span>
        <span style={{ fontSize: "0.68rem", fontWeight: 800, color, marginTop: 2 }}>{Math.round(pct * 100)}%</span>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const { budgets, expenses, monthKey, prevMonth, nextMonth, goToCurrentMonth, formatMoney } = useContext<AppContextType>(AppContext);
  const navigate = useNavigate();

  const totalBudget = useMemo(() => budgets.reduce((s, b) => s + b.budget, 0), [budgets]);
  const totalSpent  = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const remaining = Math.max(totalBudget - totalSpent, 0);
  const overspent = totalSpent > totalBudget;
  const currentMonthKey = new Date().toISOString().slice(0, 7);

  return (
    <div className="page">
      <p style={{ textAlign: "center", fontSize: "0.68rem", color: "#aaa", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
        {formatMonth(monthKey)}
      </p>
      <h1 className="title">Overview</h1>

      <AnimatePresence mode="wait">
        <motion.div key={monthKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>

          {/* Spending ring */}
          <SpendingRing spent={totalSpent} budget={totalBudget} />

          {/* Summary cards */}
          <div className="summary">
            <div className="summary-card">
              <div className="label" style={{ color: "#6c63ff" }}>Budget</div>
              <div className="value">{formatMoney(totalBudget)}</div>
            </div>
            <div className="summary-card">
              <div className="label" style={{ color: "#f59e0b" }}>Spent</div>
              <div className="value">{formatMoney(totalSpent)}</div>
            </div>
            <div className="summary-card">
              <div className="label" style={{ color: overspent ? "#ef4444" : "#10b981" }}>Remaining</div>
              <div className="value" style={{ color: overspent ? "#ef4444" : "#10b981" }}>{formatMoney(remaining)}</div>
            </div>
            <div className="summary-card">
              <div className="label" style={{ color: "#3b82f6" }}>Categories</div>
              <div className="value">{budgets.length}</div>
            </div>
          </div>

          {/* Chart */}
          <Chart />

          {/* Add expense button */}
          <button className="btn primary wide" onClick={() => navigate("/expense")} style={{ marginTop: 16 }}>
            + Add Expense
          </button>

          {/* Month nav */}
          <div className="month-nav" style={{ marginTop: 16 }}>
            <button onClick={prevMonth}>← Prev</button>
            <span>{formatMonth(monthKey)}</span>
            <button onClick={nextMonth}>Next →</button>
          </div>

          {monthKey !== currentMonthKey && (
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <button onClick={goToCurrentMonth} style={{ background: "#6c63ff", color: "white", border: "none", borderRadius: 99, padding: "5px 14px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>
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