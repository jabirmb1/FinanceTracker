import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import type { AppContextType } from "../context/AppContext";
import { AnimatePresence, motion } from "framer-motion";
import "./Budget.css";
import { formatMonth } from "../utils";

export default function Budget() {
  const {
    budgets, updateBudget, monthKey, prevMonth, nextMonth, goToCurrentMonth,
    currency, formatMoney, categories, addCategory, deleteCategory, renameCategory,
  } = useContext<AppContextType>(AppContext);

  const [editing, setEditing]   = useState<string | null>(null);
  const [newValue, setNewValue] = useState<number | string>("");
  const [newName, setNewName]   = useState<string>("");
  const [newCat, setNewCat]     = useState<string>("");

  const ACCENT_MAP: Record<string, string> = {
    midnight: "#6c63ff", ocean: "#0369a1", forest: "#2d6a4f", navy: "#1e3a5f",
    rose: "#e11d48", orange: "#ea580c", plum: "#7c3aed", teal: "#0d9488",
  };
  const [isDark, setIsDark]     = useState(() => document.body.classList.contains("dark"));
  const [accentId, setAccentId] = useState(() => localStorage.getItem("accentColor") || "midnight");

  useEffect(() => {
    const sync = () => {
      setIsDark(document.body.classList.contains("dark"));
      setAccentId(localStorage.getItem("accentColor") || "midnight");
    };
    window.addEventListener("ft-settings-change", sync);
    return () => window.removeEventListener("ft-settings-change", sync);
  }, []);

  const accent = accentId === "custom"
    ? (localStorage.getItem("customAccent") || "#6c63ff")
    : (ACCENT_MAP[accentId] || "#6c63ff");

  const currentMonthKey = new Date().toISOString().slice(0, 7);

  const handleStartEdit = (cat: string, val: number) => {
    setEditing(cat);
    setNewValue(val);
    setNewName(cat);
  };

  const handleSave = (cat: string) => {
    const v = parseFloat(newValue.toString());
    if (isNaN(v) || v < 0) return alert("Enter a valid budget amount.");
    if (newName.trim() && newName.trim() !== cat) {
      renameCategory(cat, newName.trim());
      updateBudget(newName.trim(), v);
    } else {
      updateBudget(cat, v);
    }
    setEditing(null);
  };

  const handleDelete = (cat: string) => {
    if (!window.confirm(`Delete "${cat}"? Its expenses will be moved to "Other".`)) return;
    deleteCategory(cat);
    if (editing === cat) setEditing(null);
  };

  const handleAddCategory = () => {
    if (!newCat.trim()) return alert("Category name cannot be empty.");
    addCategory(newCat);
    setNewCat("");
  };

  const allBudgets = categories.map(cat =>
    budgets.find(b => b.category === cat) || { category: cat, budget: 0 }
  );

  const cardBg     = isDark ? "#161b22" : "#ffffff";
  const cardBorder = isDark ? "#30363d" : "#e8ecf0";
  const textMain   = isDark ? "#e6edf3" : "#0f1c2e";
  const textMuted  = isDark ? "#8b949e" : "#6b7280";
  const inputBg    = isDark ? "#0d1117"  : "#f7f8fa";
  const navBg      = isDark ? "#161b22"  : "#f7f8fa";
  const dangerBg   = isDark ? "#2a1515"  : "#fff5f5";

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
              <div key={b.category} style={{
                background: cardBg,
                border: `1px solid ${editing === b.category ? accent : cardBorder}`,
                borderRadius: 14, padding: "14px 16px",
                transition: "border-color 0.2s",
              }}>
                {editing === b.category ? (
                  /* ── Expanded edit panel ── */
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <p style={{ margin: 0, fontSize: "0.6rem", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 0.8 }}>
                      Editing
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={{ fontSize: "0.72rem", fontWeight: 600, color: textMuted }}>Category name</label>
                      <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${cardBorder}`, background: inputBg, color: textMain, fontFamily: "inherit", fontSize: "0.85rem", outline: "none" }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={{ fontSize: "0.72rem", fontWeight: 600, color: textMuted }}>Budget amount ({currency})</label>
                      <input
                        type="number"
                        value={newValue}
                        min="0"
                        onChange={e => setNewValue(e.target.value)}
                        autoFocus
                        style={{ padding: "9px 12px", borderRadius: 8, border: `1px solid ${cardBorder}`, background: inputBg, color: textMain, fontFamily: "inherit", fontSize: "0.85rem", outline: "none" }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                      <button onClick={() => handleSave(b.category)} style={{ flex: 1, background: accent, color: "#fff", border: "none", borderRadius: 8, padding: "9px 0", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        Save
                      </button>
                      <button onClick={() => setEditing(null)} style={{ flex: 1, background: inputBg, color: textMuted, border: `1px solid ${cardBorder}`, borderRadius: 8, padding: "9px 0", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        Cancel
                      </button>
                      <button onClick={() => handleDelete(b.category)} style={{ background: dangerBg, color: "#ef4444", border: "1px solid #ef444428", borderRadius: 8, padding: "9px 14px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Normal row ── */
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: textMain }}>{b.category}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontWeight: 800, fontSize: "0.95rem", color: textMain }}>{formatMoney(b.budget)}</span>
                      <button onClick={() => handleStartEdit(b.category, b.budget)} style={{ background: isDark ? "#21262d" : accent + "15", color: accent, border: `1px solid ${isDark ? "#30363d" : "#e0d9ff"}`, borderRadius: 8, padding: "6px 14px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add new category */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <input
              type="text"
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAddCategory(); }}
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
    </div>
  );
}