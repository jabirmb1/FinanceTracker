import React, { useContext } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";
import type { AppContextType } from "../context/AppContext";
import { Calendar } from "lucide-react";

const navButtonStyle: React.CSSProperties = {
  margin: "0 0.8rem",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "1rem",
  color: "#666",
};

const Transactions: React.FC = () => {
  // Global states from context
  const {
    expenses,
    monthKey,
    prevMonth,
    nextMonth,
    goToCurrentMonth,
    formatMoney,
  } = useContext<AppContextType>(AppContext);

  const currentMonthKey = new Date().toISOString().slice(0, 7);

  // Convert key to month and year string
  const formatMonthKey = (key: string): string => {
    const [year, month] = key.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  return (
    <div className="page">
      <Navbar />
      <h1 className="title">Transactions</h1>

      {/* Transactions table */}
      <div className="table-wrap" style={{ padding: "0 10px" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={3} className="muted">
                  No transactions yet for this month.
                </td>
              </tr>
            ) : (
              expenses.map((r) => (
                <tr key={r.id}>
                  <td>{r.description}</td>
                  <td>{formatMoney(r.amount)}</td>
                  <td>{r.category}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Month navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1rem 0" }}>
        <button onClick={prevMonth} style={{ border: "none", background: "#000", color: "white", borderRadius: "20px", padding: "0.5rem 1rem", cursor: "pointer", fontWeight: 600 }}>
          ← Prev
        </button>
        <span style={{ fontSize: "0.85rem", fontWeight: 500, opacity: 0.7 }}>
          <Calendar size={14} style={{ verticalAlign: "middle" }} /> {formatMonthKey(monthKey)}
        </span>
        <button onClick={nextMonth} style={{ border: "none", background: "#000", color: "white", borderRadius: "20px", padding: "0.5rem 1rem", cursor: "pointer", fontWeight: 600 }}>
          Next →
        </button>
      </div>

      {monthKey !== currentMonthKey && (
        <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
          <button onClick={goToCurrentMonth} style={{ background: "#000", color: "white", border: "none", borderRadius: "20px", padding: "0.4rem 1rem", cursor: "pointer", fontSize: "0.85rem" }}>
            Jump to This Month
          </button>
        </div>
      )}

      {/* Bottom navigation buttons */}
      <div className="bottom-actions">
        <Link to="/expense" className="btn no-hover">
          Expense
        </Link>
        <Link to="/transactions" className="btn no-hover">
          Transactions
        </Link>
      </div>
    </div>
  );
};

export default Transactions;
