import React, { useContext, useMemo } from "react";
import Navbar from "../components/Navbar";
import Chart from "../components/BarChart";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import type { AppContextType } from "../context/AppContext";
import { AnimatePresence, motion } from "framer-motion";

// Format month and year
const formatMonth = (key: string): string => {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
};

const navButtonStyle: React.CSSProperties = {
  margin: "0 0.8rem",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "1rem",
  color: "#666",
};

const Home: React.FC = () => {
  // Global state from context
  const {
    budgets,
    expenses,
    monthKey,
    prevMonth,
    nextMonth,
    goToCurrentMonth,
    currency,
    formatMoney,
  } = useContext<AppContextType>(AppContext);

  // Precompute totals to avoid recalculation
  const totalBudget = useMemo<number>(
    () => budgets.reduce((sum, b) => sum + b.budget, 0),
    [budgets]
  );

  const totalSpent = useMemo<number>(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  // Prevent negative remaining values
  const remaining = Math.max(totalBudget - totalSpent, 0);

  // Overspending 
  const overspent = totalSpent > totalBudget;

  // Used to display jump to this month button
  const currentMonthKey = new Date().toISOString().slice(0, 7);

  return (
    <div className="page">
      <Navbar />
      <h1 className="title">My finance tracker</h1>

      <AnimatePresence mode="wait">
        <motion.div
          key={monthKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="summary"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "1.5rem",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            {/* Total budget */}
            <div
              style={{
                background: "#ffffff",
                color: "#000000",
                borderRadius: "16px",
                padding: "0.8rem 1.4rem",
                fontWeight: 700,
                border: "1px solid #ddd",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              💰 <span>Total Budget: {formatMoney(totalBudget)}</span>
            </div>

            {/* Total spent */}
            <div
              style={{
                background: "#ffffff",
                color: "#000000",
                borderRadius: "16px",
                padding: "0.8rem 1.4rem",
                fontWeight: 700,
                border: "1px solid #ddd",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              💸 <span>Spent: {formatMoney(totalSpent)}</span>
            </div>

            {/* Remaining */}
            <div
              style={{
                background: "#ffffff",
                color: overspent ? "red" : "#2ea043",
                borderRadius: "16px",
                padding: "0.8rem 1.4rem",
                fontWeight: 700,
                border: "1px solid #ddd",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              🌍 <span>Remaining: {formatMoney(remaining)}</span>
            </div>
          </div>

          <Chart />
        </motion.div>
      </AnimatePresence>

      {/* Month Navigation */}
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
            📅 Viewing: {formatMonth(monthKey)}
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

      {/* Navigation buttons */}
      <div className="bottom-actions">
        <Link to="/expense" className="btn">
          Expense
        </Link>
        <Link to="/transactions" className="btn">
          Transactions
        </Link>
      </div>
    </div>
  );
};

export default Home;
