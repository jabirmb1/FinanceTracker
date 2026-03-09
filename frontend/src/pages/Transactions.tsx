import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import type { AppContextType } from "../context/AppContext";
import { Calendar } from "lucide-react";

const CHIP_COLORS: Record<string, { bg: string; color: string; dot: string }> = {
  Food:         { bg: "#fff3e0", color: "#e65100", dot: "#ff9800" },
  Subscription: { bg: "#e8f5e9", color: "#1b5e20", dot: "#4caf50" },
  Clothes:      { bg: "#fce4ec", color: "#880e4f", dot: "#e91e63" },
  Savings:      { bg: "#e3f2fd", color: "#0d47a1", dot: "#2196f3" },
  Transport:    { bg: "#f3e5f5", color: "#4a148c", dot: "#9c27b0" },
};

const CategoryChip: React.FC<{ category: string }> = ({ category }) => {
  const c = CHIP_COLORS[category] || { bg: "#f5f5f5", color: "#555", dot: "#999" };
  return (
    <span style={{ background: c.bg, color: c.color, borderRadius: 20, padding: "2px 8px", fontSize: "0.65rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {category}
    </span>
  );
};

const Transactions: React.FC = () => {
  const { expenses, monthKey, prevMonth, nextMonth, goToCurrentMonth, formatMoney } = useContext<AppContextType>(AppContext);
  const currentMonthKey = new Date().toISOString().slice(0, 7);

  const formatMonthKey = (key: string): string => {
    const [year, month] = key.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  return (
    <div className="page">
      <h1 className="title">Transactions</h1>

      {/* Month nav */}
      <div className="month-nav">
        <button onClick={prevMonth}>← Prev</button>
        <span><Calendar size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />{formatMonthKey(monthKey)}</span>
        <button onClick={nextMonth}>Next →</button>
      </div>

      {monthKey !== currentMonthKey && (
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button onClick={goToCurrentMonth} style={{ background: "#6c63ff", color: "white", border: "none", borderRadius: 99, padding: "5px 14px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>
            Jump to This Month
          </button>
        </div>
      )}

      {/* Transaction list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
        {expenses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>🧾</div>
            <p style={{ color: "#aaa", fontSize: "0.82rem", fontWeight: 600 }}>No transactions yet this month</p>
          </div>
        ) : (
          expenses.map((r) => (
            <div key={r.id} style={{ background: "#fff", borderRadius: 12, padding: "10px 12px", border: "1px solid #f0eeff", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 4px rgba(108,99,255,0.05)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1a1a2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.description}</span>
                <CategoryChip category={r.category} />
              </div>
              <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1a1a2e", marginLeft: 12, flexShrink: 0 }}>{formatMoney(r.amount)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Transactions;