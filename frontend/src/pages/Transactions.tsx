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
      <div className="table-wrap">
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
      <div
        className="month-nav"
        style={{
          marginTop: "1.5rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <div>
          <button onClick={prevMonth} style={navButtonStyle}>
            ← Previous
          </button>
          <span style={{ fontWeight: 500, opacity: 0.7 }}>
            <Calendar size={16} style={{ verticalAlign: "middle" }} /> Viewing:{" "}
            {formatMonthKey(monthKey)}
          </span>
          <button onClick={nextMonth} style={navButtonStyle}>
            Next →
          </button>
        </div>

        {monthKey !== currentMonthKey && (
          <button
            onClick={goToCurrentMonth}
            style={{
              background: "#000",
              color: "white",
              border: "none",
              borderRadius: "20px",
              padding: "0.4rem 1rem",
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            Jump to This Month
          </button>
        )}
      </div>

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
