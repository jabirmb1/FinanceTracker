import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import type { AppContextType } from "../context/AppContext";
import { formatMonth } from "../utils";

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#f97316", Clothes: "#ec4899", Subscription: "#10b981",
  Savings: "#3b82f6", Transport: "#8b5cf6", Entertainment: "#f59e0b",
};
const defaultColor = "#6b7280";


const Transactions: React.FC = () => {
  const { expenses, monthKey, prevMonth, nextMonth, goToCurrentMonth, formatMoney, deleteExpense } =
    useContext<AppContextType>(AppContext);

  const [isDark, setIsDark] = useState(() => document.body.classList.contains("dark"));

  // Fix #6: replaced setInterval polling with event listener only
  useEffect(() => {
    const sync = () => setIsDark(document.body.classList.contains("dark"));
    window.addEventListener("ft-settings-change", sync);
    return () => window.removeEventListener("ft-settings-change", sync);
  }, []);

  const currentMonthKey = new Date().toISOString().slice(0, 7);

  const cardBg     = isDark ? "#161b22" : "#ffffff";
  const cardBorder = isDark ? "#30363d" : "#e8ecf0";
  const textMain   = isDark ? "#e6edf3" : "#0f1c2e";
  const textMuted  = isDark ? "#8b949e" : "#6b7280";
  const navBg      = isDark ? "#161b22" : "#f7f8fa";

  return (
    <div className="page">
      <h1 className="title" style={{ color: textMain }}>Transactions</h1>

      {expenses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: textMuted }}>
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>🧾</div>
          <p style={{ fontWeight: 600, fontSize: "0.82rem" }}>No transactions this month</p>
          <p style={{ fontSize: "0.72rem", opacity: 0.6, marginTop: 4 }}>Add an expense to get started</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {expenses.map(e => {
            const color = CATEGORY_COLORS[e.category] || defaultColor;
            return (
              <div key={e.id} className="tx-card" style={{
                background: cardBg, border: `1px solid ${cardBorder}`,
                borderRadius: 14, padding: "14px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 8,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="tx-desc" style={{ margin: "0 0 6px", fontWeight: 700, fontSize: "0.9rem", color: textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.description}
                  </p>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: color + "18", borderRadius: 99,
                    padding: "3px 10px", fontSize: "0.65rem", fontWeight: 700, color,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
                    {e.category}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <span className="tx-amount" style={{ fontWeight: 900, fontSize: "1rem", color: textMain }}>
                    {formatMoney(e.amount)}
                  </span>
                  {/* Fix #10: delete button wired to deleteExpense */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${e.description}"?`)) deleteExpense(e.id);
                    }}
                    title="Delete transaction"
                    style={{
                      background: "none", border: `1px solid ${cardBorder}`,
                      borderRadius: 8, padding: "4px 8px",
                      cursor: "pointer", fontSize: "0.75rem", color: "#ef4444",
                      fontFamily: "inherit", lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 8 }}>
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
    </div>
  );
};

export default Transactions;