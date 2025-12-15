import React, { useContext, useMemo } from "react";
import Navbar from "../components/Navbar";
import Chart from "../components/BarChart";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import type { AppContextType } from "../context/AppContext";
import { AnimatePresence, motion } from "framer-motion";
import "./Home.css"; 
// Format month and year
const formatMonth = (key: string): string => {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
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

  const navigate = useNavigate();

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

      <AnimatePresence mode="wait">
        <motion.div
          key={monthKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          <div className="summary">
            {/* Total budget */}
            <div>
              💰 <span>Total Budget: {formatMoney(totalBudget)}</span>
            </div>

            {/* Total spent */}
            <div>
              💸 <span>Spent: {formatMoney(totalSpent)}</span>
            </div>

            {/* Remaining */}
            <div style={{ color: overspent ? "red" : "#2ea043" }}>
              🌍 <span>Remaining: {formatMoney(remaining)}</span>
            </div>
          </div>

          <Chart />
        </motion.div>
      </AnimatePresence>

      {/* Month Navigation */}
      <div className="month-nav">
        <div>
          <span>
            📅 Viewing: {formatMonth(monthKey)}
          </span>
          <button onClick={prevMonth}>
            ← Previous
          </button>
          <button onClick={nextMonth}>
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
              padding: "0.5rem 1.2rem",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Jump to This Month
          </button>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="bottom-actions">
        <button
          type="button"
          className="btn"
          onClick={() => navigate("/expense")}
        >
          Expense
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => navigate("/transactions")}
        >
          Transactions
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => navigate("/budget")}
        >
          Budget
        </button>
      </div>
    </div>
  );
};

export default Home;