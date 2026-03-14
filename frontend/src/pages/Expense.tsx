<<<<<<< HEAD
 import React, { useState, useContext, useMemo, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";

// No props used for this page, hence no need for an interface
=======
import React, { useState, useContext, useMemo, type FormEvent } from "react";
import { AppContext } from "../context/AppContext";

>>>>>>> istiaq-code
const Expense: React.FC = () => {
  const [desc, setDesc] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [cat, setCat] = useState<string>("Food");
  const [newCat, setNewCat] = useState<string>("");

<<<<<<< HEAD
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
=======
  const { addExpense, expenses, budgets, currency, categories, addCategory } = useContext(AppContext);

  const totalBudget = useMemo(() => budgets.reduce((sum, b) => sum + b.budget, 0), [budgets]);
  const totalSpent  = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const remaining   = Math.max(totalBudget - totalSpent, 0);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!desc || !amount || !cat) return alert("Please fill in all fields");
>>>>>>> istiaq-code
    addExpense(desc, parseFloat(amount), cat);
    setDesc("");
    setAmount("");
    setCat(categories[0] || "Food");
  };

<<<<<<< HEAD
  // Handle adding a new category
  const handleAddCategory = () => {
    if (!newCat.trim()) {
      return alert("Category cannot be empty");
    }
=======
  const handleAddCategory = () => {
    if (!newCat.trim()) return alert("Category cannot be empty");
>>>>>>> istiaq-code
    addCategory(newCat);
    setCat(newCat);
    setNewCat("");
  };

  return (
    <div className="page">
<<<<<<< HEAD
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
=======
      <h1 className="title">Add Expense</h1>

      {/* Remaining budget pill */}
      <div className="remaining">
        🪙 Remaining: <strong style={{ color: remaining <= 0 ? "#ef4444" : "#10b981" }}>{currency}{remaining.toFixed(2)}</strong>
      </div>

      {/* Form */}
      <form className="expense-form" onSubmit={handleSubmit}>
        <div className="grid">
          <label>
            <span>Description</span>
>>>>>>> istiaq-code
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
<<<<<<< HEAD
              placeholder="e.g. Netflix subscription"
              style={inputStyle}
            />
          </label>

=======
              placeholder="e.g. Netflix"
            />
          </label>
>>>>>>> istiaq-code
          <label>
            <span>Amount</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`${currency}...`}
<<<<<<< HEAD
              style={inputStyle}
=======
>>>>>>> istiaq-code
            />
          </label>
        </div>

<<<<<<< HEAD
        {/* Category dropdown */}
        <label className="stack">
          <span>Category</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
=======
        <label className="stack">
          <span>Category</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            {categories.map((c) => <option key={c}>{c}</option>)}
>>>>>>> istiaq-code
          </select>
        </label>

        {/* Add new category */}
<<<<<<< HEAD
        <div style={addCategoryStyle}>
=======
        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
>>>>>>> istiaq-code
          <input
            type="text"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="Add new category..."
<<<<<<< HEAD
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
=======
            style={{ flex: 1 }}
          />
          <button type="button" onClick={handleAddCategory} className="btn primary" style={{ whiteSpace: "nowrap" }}>
            + Add
          </button>
        </div>

        <button className="btn primary wide" type="submit" style={{ marginTop: "16px" }}>
          Add Expense
        </button>
      </form>
>>>>>>> istiaq-code
    </div>
  );
};

<<<<<<< HEAD
// Inline reusable styles
const inputStyle: React.CSSProperties = {
  padding: "0.5rem",
  borderRadius: "8px",
  border: "1px solid #ccc",
  width: "100%",
  display: "block",      /* make it a block-level element */
  margin: "1rem auto"
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
  display: "block",      /* make it a block-level element */
  margin: "1rem auto"
};

const addCategoryStyle: React.CSSProperties = {
  marginTop: "0.8rem",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

export default Expense;
=======
export default Expense;
>>>>>>> istiaq-code
