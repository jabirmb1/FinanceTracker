import React, { useState, useContext, useMemo, useEffect, type FormEvent } from "react";
import { AppContext } from "../context/AppContext";

const ACCENT_MAP: Record<string, string> = {
  midnight: "#6c63ff", ocean: "#0369a1", forest: "#2d6a4f", navy: "#1e3a5f",
  rose: "#e11d48", orange: "#ea580c", plum: "#7c3aed", teal: "#0d9488",
};

function getAccent(): string {
  const id = localStorage.getItem("accentColor") || "midnight";
  if (id === "custom") return localStorage.getItem("customAccent") || "#6c63ff";
  return ACCENT_MAP[id] || "#6c63ff";
}

const Expense: React.FC = () => {
  const [desc,   setDesc]   = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [cat,    setCat]    = useState<string>("Food");
  const [newCat, setNewCat] = useState<string>("");
  const [accent, setAccent] = useState<string>(getAccent);

  const { addExpense, expenses, budgets, currency, categories, addCategory } = useContext(AppContext);

  // Stay in sync when accent changes (from Profile page)
  useEffect(() => {
    const sync = () => setAccent(getAccent());
    window.addEventListener("ft-settings-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ft-settings-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const totalBudget = useMemo(() => budgets.reduce((sum, b) => sum + b.budget, 0), [budgets]);
  const totalSpent  = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const remaining   = Math.max(totalBudget - totalSpent, 0);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!desc || !amount || !cat) return alert("Please fill in all fields");
    addExpense(desc, parseFloat(amount), cat);
    setDesc("");
    setAmount("");
    setCat(categories[0] || "Food");
  };

  const handleAddCategory = () => {
    if (!newCat.trim()) return alert("Category cannot be empty");
    addCategory(newCat);
    setCat(newCat);
    setNewCat("");
  };

  return (
    <div className="page">
      <h1 className="title">Add Expense</h1>

      {/* Remaining budget pill */}
      <div className="remaining">
        🪙 Remaining:{" "}
        <strong style={{ color: remaining <= 0 ? "#ef4444" : "#10b981" }}>
          {currency}{remaining.toFixed(2)}
        </strong>
      </div>

      {/* Form */}
      <form className="expense-form" onSubmit={handleSubmit}>
        <div className="grid">
          <label>
            <span>Description</span>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="e.g. Netflix"
            />
          </label>
          <label>
            <span>Amount</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`${currency}...`}
            />
          </label>
        </div>

        <label className="stack">
          <span>Category</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>

        {/* Add new category */}
        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
          <input
            type="text"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="Add new category..."
            style={{ flex: 1 }}
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="btn primary"
            style={{ whiteSpace: "nowrap", background: accent, borderColor: accent }}
          >
            + Add
          </button>
        </div>

        <button
          className="btn primary wide"
          type="submit"
          style={{ marginTop: "16px", background: accent, borderColor: accent }}
        >
          Add Expense
        </button>
      </form>
    </div>
  );
};

export default Expense;