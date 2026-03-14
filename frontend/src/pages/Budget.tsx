<<<<<<< HEAD
import React, { useContext, useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
=======
import React, { useContext, useState, useEffect } from "react";
>>>>>>> istiaq-code
import { AppContext } from "../context/AppContext";
import type { AppContextType } from "../context/AppContext";
import { AnimatePresence, motion } from "framer-motion";
import "./Budget.css";

<<<<<<< HEAD
// Converts month key "YYYY-MM" to e.g. "January 2025"
=======
>>>>>>> istiaq-code
const formatMonth = (key: string): string => {
  const [year, month] = key.split("-") as [string, string];
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
};

export default function Budget() {
<<<<<<< HEAD
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
=======
  const { budgets, updateBudget, monthKey, prevMonth, nextMonth, goToCurrentMonth, currency, formatMoney, categories, addCategory } =
    useContext<AppContextType>(AppContext);

  const [editing, setEditing]   = useState<string | null>(null);
  const [newValue, setNewValue] = useState<number | string>("");
  const [newCat, setNewCat]     = useState<string>("");

  const ACCENT_MAP: Record<string, string> = {
    midnight: "#6c63ff", ocean: "#0369a1", forest: "#2d6a4f", navy: "#1e3a5f",
    rose: "#e11d48", orange: "#ea580c", plum: "#7c3aed", teal: "#0d9488",
  };
  const [isDark, setIsDark] = useState(() => document.body.classList.contains("dark"));
  const [accentId, setAccentId] = useState(() => localStorage.getItem("accentColor") || "midnight");
  useEffect(() => {
    const sync = () => {
      setIsDark(document.body.classList.contains("dark"));
      setAccentId(localStorage.getItem("accentColor") || "midnight");
    };
    const t = setInterval(sync, 150);
    window.addEventListener("ft-settings-change", sync);
    return () => { clearInterval(t); window.removeEventListener("ft-settings-change", sync); };
  }, []);
  const accent = ACCENT_MAP[accentId] || localStorage.getItem("customAccent") || "#6c63ff";

  const currentMonthKey = new Date().toISOString().slice(0, 7);

  const handleEdit = (cat: string, val: number) => { setEditing(cat); setNewValue(val); };
  const handleSave = (cat: string) => {
    const v = parseFloat(newValue.toString());
    if (isNaN(v)) return alert("Invalid budget value.");
    updateBudget(cat, v); setEditing(null);
  };
  const handleAddCategory = () => {
    if (!newCat.trim()) return alert("Category name cannot be empty.");
    addCategory(newCat); setNewCat("");
  };

  const allBudgets = categories.map(cat => budgets.find(b => b.category === cat) || { category: cat, budget: 0 });

  const cardBg     = isDark ? "#161b22" : "#ffffff";
  const cardBorder = isDark ? "#30363d" : "#e8ecf0";
  const textMain   = isDark ? "#e6edf3" : "#0f1c2e";
  const textMuted  = isDark ? "#8b949e" : "#6b7280";
  const inputBg    = isDark ? "#0d1117"  : "#f7f8fa";
  const navBg      = isDark ? "#161b22"  : "#f7f8fa";

  return (
    <div className="page">
      <p style={{ textAlign: "center", fontSize: "0.65rem", color: textMuted, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
        {formatMonth(monthKey)}
      </p>
      <h1 className="title" style={{ color: textMain }}>Budget</h1>

      <AnimatePresence mode="wait">
        <motion.div key={monthKey} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {allBudgets.map((b) => (
              <div key={b.category} className="budget-card" style={{
                background: cardBg, border: `1px solid ${cardBorder}`,
                borderRadius: 14, padding: "14px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
              }}>
                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: textMain }}>{b.category}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {editing === b.category ? (
                    <>
                      <input
                        type="number"
                        value={newValue}
                        onChange={e => setNewValue(e.target.value)}
                        placeholder={`${currency}...`}
                        style={{ width: 80, padding: "6px 10px", borderRadius: 8, border: `1px solid ${cardBorder}`, background: inputBg, color: textMain, fontFamily: "inherit", fontSize: "0.82rem" }}
                        autoFocus
                      />
                      <button onClick={() => handleSave(b.category)} style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={{ fontWeight: 800, fontSize: "0.95rem", color: textMain }}>{formatMoney(b.budget)}</span>
                      <button className="edit-btn" onClick={() => handleEdit(b.category, b.budget)} style={{ background: isDark ? "#21262d" : accent + "15", color: accent, border: `1px solid ${isDark ? "#30363d" : "#e0d9ff"}`, borderRadius: 8, padding: "6px 14px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add new category */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <input
              type="text"
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              placeholder="Add new category..."
              style={{ flex: 1, padding: "11px 14px", borderRadius: 12, border: `1px solid ${cardBorder}`, background: inputBg, color: textMain, fontFamily: "inherit", fontSize: "0.82rem" }}
            />
            <button onClick={handleAddCategory} style={{ background: accent, color: "#fff", border: "none", borderRadius: 12, padding: "11px 18px", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              + Add
            </button>
          </div>

          {/* Month nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <button onClick={prevMonth} style={{ background: navBg, border: `1px solid ${cardBorder}`, borderRadius: 99, padding: "7px 14px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", color: textMuted, fontFamily: "inherit" }}>← Prev</button>
            <span style={{ fontSize: "0.72rem", color: textMuted, fontWeight: 600 }}>{formatMonth(monthKey)}</span>
            <button onClick={nextMonth} style={{ background: navBg, border: `1px solid ${cardBorder}`, borderRadius: 99, padding: "7px 14px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", color: textMuted, fontFamily: "inherit" }}>Next →</button>
          </div>

          {monthKey !== currentMonthKey && (
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <button onClick={goToCurrentMonth} style={{ background: accent, color: "#fff", border: "none", borderRadius: 99, padding: "6px 16px", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>
                Jump to This Month
              </button>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
>>>>>>> istiaq-code
    </div>
  );
}