import React, { useContext, useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import type { AppContextType } from "../context/AppContext";
import { AnimatePresence, motion } from "framer-motion";
import "./Budget.css";

// Converts month key "YYYY-MM" to e.g. "January 2025"
const formatMonth = (key: string): string => {
  const [year, month] = key.split("-") as [string, string];
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
};

export default function Budget() {
  const {
    budgets,
    updateBudget,
    monthKey,
    prevMonth,
    nextMonth,
    goToCurrentMonth,
    currency,
    formatMoney,
    categories,
    addCategory,
  } = useContext<AppContextType>(AppContext);

  // Tracks which category is being edited
  const [editing, setEditing] = useState<string | null>(null);
  // Holds temporary budget value while editing
  const [newValue, setNewValue] = useState<number | string>("");
  // Input for a new category name
  const [newCat, setNewCat] = useState<string>("");

  const currentMonthKey = new Date().toISOString().slice(0, 7);

  // Start editing specific category
  const handleEdit = (category: string, currentValue: number) => {
    setEditing(category);
    setNewValue(currentValue);
  };

  // Save edited budget
  const handleSave = (category: string) => {
    const parsedValue = parseFloat(newValue.toString());
    if (isNaN(parsedValue)) return alert("Invalid budget value.");
    updateBudget(category, parsedValue);
    setEditing(null);
  };

  // Add a brand new category
  const handleAddCategory = () => {
    if (!newCat.trim()) return alert("Category name cannot be empty.");
    addCategory(newCat);
    setNewCat("");
  };

  // Merge budgets with categories so that new ones always show up
  const allBudgets = categories.map((cat) => {
    const existing = budgets.find((b) => b.category === cat);
    return existing || { category: cat, budget: 0 };
  });

  return (
    <div className="page">
      <Navbar />
      <h1 className="title">Budget</h1>

      {/* Smooth month transitions using Framer Motion */}
      <AnimatePresence mode="wait">
        <motion.div
          key={monthKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          <div className="budget-table">
            <h3>🧾 This month</h3>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Budget ({currency})</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allBudgets.map((b) => (
                  <tr key={b.category}>
                    <td>{b.category}</td>
                    <td>
                      {editing === b.category ? (
                        <input
                          type="number"
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                          placeholder={`${currency}...`}
                        />
                      ) : (
                        formatMoney(b.budget)
                      )}
                    </td>

                    <td>
                      {editing === b.category ? (
                        <button
                          onClick={() => handleSave(b.category)}
                          className="btn"
                          style={{
                            background: "#4caf50",
                            color: "white",
                            borderRadius: "20px",
                            padding: "0.4rem 1rem",
                          }}
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(b.category, b.budget)}
                          className="btn"
                          style={{
                            background: "#f3f3f3",
                            borderRadius: "20px",
                            padding: "0.4rem 1rem",
                            color: "black",
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Add new category section */}
            <div>
              <input
                type="text"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="Add new category..."
              />
              <button onClick={handleAddCategory}>
                Add
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Month Navigation */}
      <div className="month-nav">
        <div>
          <button onClick={prevMonth}>
            ← Previous
          </button>
          <span>
            📅 Viewing: {formatMonth(monthKey)}
          </span>
          <button onClick={nextMonth}>
            Next →
          </button>
        </div>

        {/* Shortcut to return to current month */}
        {monthKey !== currentMonthKey && (
          <button
            onClick={goToCurrentMonth}
            style={{
              background: "#000",
              color: "white",
              border: "none",
              borderRadius: "20px",
              padding: "0.7rem 1.5rem",
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            Jump to This Month
          </button>
        )}
      </div>

      {/* Bottom Navigation */}
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
}