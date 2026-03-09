import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import type { AppContextType } from "../context/AppContext";
import { AnimatePresence, motion } from "framer-motion";
import "./Budget.css";

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

  const [editing, setEditing] = useState<string | null>(null);
  const [newValue, setNewValue] = useState<number | string>("");
  const [newCat, setNewCat] = useState<string>("");

  const currentMonthKey = new Date().toISOString().slice(0, 7);

  const handleEdit = (category: string, currentValue: number) => {
    setEditing(category);
    setNewValue(currentValue);
  };

  const handleSave = (category: string) => {
    const parsedValue = parseFloat(newValue.toString());
    if (isNaN(parsedValue)) return alert("Invalid budget value.");
    updateBudget(category, parsedValue);
    setEditing(null);
  };

  const handleAddCategory = () => {
    if (!newCat.trim()) return alert("Category name cannot be empty.");
    addCategory(newCat);
    setNewCat("");
  };

  const allBudgets = categories.map((cat) => {
    const existing = budgets.find((b) => b.category === cat);
    return existing || { category: cat, budget: 0 };
  });

  return (
    <div className="page">
      <p style={{ textAlign: "center", fontSize: "0.68rem", color: "#aaa", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
        {formatMonth(monthKey)}
      </p>
      <h1 className="title">Budget</h1>

      <AnimatePresence mode="wait">
        <motion.div
          key={monthKey}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          {/* Budget rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {allBudgets.map((b) => (
              <div key={b.category} style={{ background: "#fff", borderRadius: 12, padding: "10px 12px", border: "1px solid #f0eeff", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 4px rgba(108,99,255,0.05)" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a1a2e" }}>{b.category}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {editing === b.category ? (
                    <>
                      <input
                        type="number"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder={`${currency}...`}
                        style={{ width: 80, padding: "5px 8px", borderRadius: 8, border: "1.5px solid #6c63ff", fontSize: "0.82rem", fontFamily: "inherit", outline: "none" }}
                      />
                      <button onClick={() => handleSave(b.category)} style={{ background: "#10b981", color: "white", border: "none", borderRadius: 99, padding: "5px 12px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#1a1a2e" }}>{formatMoney(b.budget)}</span>
                      <button onClick={() => handleEdit(b.category, b.budget)} style={{ background: "#f8f7ff", color: "#6c63ff", border: "1.5px solid #ede9fe", borderRadius: 99, padding: "4px 12px", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}>
                        Edit
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add new category */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input
              type="text"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="Add new category..."
              style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: "1.5px solid #ede9fe", fontSize: "0.85rem", fontFamily: "inherit", outline: "none", background: "#faf9ff", color: "#1a1a2e" }}
            />
            <button onClick={handleAddCategory} className="btn primary" style={{ whiteSpace: "nowrap" }}>
              + Add
            </button>
          </div>

        </motion.div>
      </AnimatePresence>

      {/* Month nav */}
      <div className="month-nav">
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
    </div>
  );
}