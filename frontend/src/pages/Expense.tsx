 import React, { useState, useContext, useMemo, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";

// No props used for this page, hence no need for an interface
const Expense: React.FC = () => {
  const [desc, setDesc] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [cat, setCat] = useState<string>("Food");
  const [newCat, setNewCat] = useState<string>("");

  const {
    addExpense,
    expenses,
    budgets,
    currency,
    categories,
    addCategory,
  } = useContext(AppContext);

  // Total budgets and spent computation
  const totalBudget = useMemo(
    () => budgets.reduce((sum, b) => sum + b.budget, 0),
    [budgets]
  );

  const totalSpent = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const remaining = Math.max(totalBudget - totalSpent, 0);

  // Handle new expense submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!desc || !amount || !cat) {
      alert("Please fill in all fields");
      return;
    }
    addExpense(desc, parseFloat(amount), cat);
    setDesc("");
    setAmount("");
    setCat(categories[0] || "Food");
  };

  // Handle adding a new category
  const handleAddCategory = () => {
    if (!newCat.trim()) {
      return alert("Category cannot be empty");
    }
    addCategory(newCat);
    setCat(newCat);
    setNewCat("");
  };

  return (
    <div className="page">
      <Navbar />
      <div className="remaining"
      style={fontSizeStyle}>
        🪙 Remaining budget:{" "}
        <strong style={{ color: remaining < 0 ? "red" : "green" }}>
          {currency}
          {remaining.toFixed(2)}
        </strong>
      </div>

      {/* Expense form */}
      <form className="expense-form" onSubmit={handleSubmit}>
        <div className="grid">
          <label>
            <span>Expense description</span>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="e.g. Netflix subscription"
              style={inputStyle}
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
              style={inputStyle}
            />
          </label>
        </div>

        {/* Category dropdown */}
        <label className="stack">
          <span>Category</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        {/* Add new category */}
        <div style={addCategoryStyle}>
          <input
            type="text"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="Add new category..."
            style={inputStyle}
          />
          <button
            type="button"
            onClick={handleAddCategory}
            style={buttonStyle}
          >
            Add
          </button>
        </div>

        <button className="btn wide" type="submit" style={{ marginTop: "1rem" }}>
          Add Expense
        </button>
      </form>

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

// Inline reusable styles
const inputStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderRadius: "8px",
  border: "1px solid #ccc",
  width: "100%",
};

const fontSizeStyle: React.CSSProperties = {
  fontSize: "1.1rem",
};
const buttonStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  border: "none",
  background: "#88d0f1ff",
  color: "white",
  cursor: "pointer",
};

const addCategoryStyle: React.CSSProperties = {
  marginTop: "0.8rem",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

export default Expense;
