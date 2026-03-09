import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import type { AppContextType, Budget, Expense, MonthData } from "../context/AppContext";
import Navbar from "../components/Navbar";

// -------------------- InsightCard --------------------
interface InsightCardProps {
  title: string;
  text: string;
  colors: Record<string, string>;
}
const InsightCard: React.FC<InsightCardProps> = ({ title, text, colors }) => (
  <div
    style={{
      background: colors.bgCard,
      color: colors.textMain,
      borderRadius: "12px",
      padding: "1rem 1.5rem",
      width: "280px",
      boxShadow: colors.shadow,
      border: `1px solid ${
        colors.bgCard === "#ffffff" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)"
      }`,
      transition: "all 0.4s ease",
    }}
  >
    <h3 style={{ marginBottom: "0.5rem", color: colors.textMain }}>{title}</h3>
    <p style={{ opacity: 0.9, color: colors.textSub }}>{text}</p>
  </div>
);

// -------------------- Input Style Helper --------------------
const inputStyle = (c: Record<string, string>) => ({
  width: "100%",
  padding: "0.6rem",
  borderRadius: "8px",
  border: `1px solid ${c.inputBorder}`,
  background: c.inputBg,
  color: c.textMain,
  marginTop: "0.3rem",
  boxShadow: c.shadow,
  transition: "all 0.4s ease",
});

// -------------------- Profile Component --------------------
const Profile: React.FC = () => {
  const { budgets = [], expenses = [], allData = {}, currency, setCurrency } =
    useContext<AppContextType>(AppContext);

  const [name, setName] = useState<string>(localStorage.getItem("userName") || "");
  const [goal, setGoal] = useState<string>(localStorage.getItem("goal") || "");
  const [isDark, setIsDark] = useState<boolean>(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
});

  const location = useLocation();

  // Theme handling
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const storedTheme = localStorage.getItem("theme");
      let useDark = media.matches;

      if (storedTheme === "dark") useDark = true;
      else if (storedTheme === "light") useDark = false;

      requestAnimationFrame(() => setIsDark(useDark));
    };

    applyTheme();

    const handleChange = () => {
      applyTheme();
      setTimeout(applyTheme, 50);
    };

    if (media.addEventListener) media.addEventListener("change", handleChange);
    else media.addListener(handleChange);

    window.addEventListener("storage", handleChange);
    window.addEventListener("focus", handleChange);

    return () => {
      if (media.removeEventListener) media.removeEventListener("change", handleChange);
      else media.removeListener(handleChange);

      window.removeEventListener("storage", handleChange);
      window.removeEventListener("focus", handleChange);
    };
  }, [location]);

  // Persist name & goal
  useEffect(() => {
    localStorage.setItem("userName", name);
    localStorage.setItem("goal", goal);
  }, [name, goal]);

  // -------------------- Profile Overview Calculations --------------------
  const monthsTracked = Object.keys(allData || {}).length;

  const categoryTotals = budgets.map((b: Budget) => {
    const spent = expenses
      .filter((e: Expense) => e.category === b.category)
      .reduce((sum: number, e: Expense) => sum + e.amount, 0);
    return { category: b.category, spent };
  });

  const biggestCategory =
    categoryTotals.length > 0
      ? categoryTotals.reduce((a: typeof categoryTotals[0], b: typeof categoryTotals[0]) => (a.spent > b.spent ? a : b)).category
      : "N/A";

  const lastTwoMonths = Object.keys(allData || {}).slice(-2);
  const [prevKey, currentKey] = lastTwoMonths;
  const prevTotal =
    (prevKey && (allData[prevKey] as MonthData)?.expenses?.reduce((sum: number, e: Expense) => sum + e.amount, 0)) || 0;
  const currentTotal =
    (currentKey && (allData[currentKey] as MonthData)?.expenses?.reduce((sum: number, e: Expense) => sum + e.amount, 0)) || 0;

  const changePercent =
    prevTotal > 0 ? (((prevTotal - currentTotal) / prevTotal) * 100).toFixed(1) : "0";

  const topCategories = [...categoryTotals]
    .sort((a: typeof categoryTotals[0], b: typeof categoryTotals[0]) => b.spent - a.spent)
    .slice(0, 3)
    .map((c) => c.category)
    .join(", ");

  const colors = {
    bgCard: isDark ? "#1e1e1e" : "#ffffff",
    textMain: isDark ? "#ffffff" : "#000000",
    textSub: isDark ? "#b3b3b3" : "#555555",
    inputBg: isDark ? "#2a2a2a" : "#ffffff",
    inputBorder: isDark ? "#444" : "#ccc",
    avatarBg: isDark ? "#333333" : "#dddddd",
    avatarText: isDark ? "#ffffff" : "#000000",
    shadow: isDark
      ? "0 2px 10px rgba(0,0,0,0.6)"
      : "0 2px 10px rgba(0,0,0,0.08)",
  };

  return (
    <div
      className="page"
      style={{
        color: colors.textMain,
        transition: "background 0.4s ease, color 0.4s ease",
      }}
    >
      <Navbar />

      <h1 className="title" style={{ color: colors.textMain, transition: "color 0.4s ease" }}>
        Profile Overview
      </h1>

      {/* Avatar and Summary */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          justifyContent: "center",
          marginBottom: "2rem",
          transition: "color 0.4s ease, background 0.4s ease",
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: colors.avatarBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            color: colors.avatarText,
            transition: "background 0.4s ease, color 0.4s ease",
          }}
        >
          {name && name.length > 0 ? name.charAt(0).toUpperCase() : "👤"}
        </div>
        <div>
          <h2 style={{ color: colors.textMain }}>{name || "Guest"}</h2>
          <p style={{ color: colors.textSub }}>
            Tracking <strong>{monthsTracked}</strong> months • Logged <strong>{expenses.length}</strong> expenses
          </p>
          <p style={{ color: colors.textSub }}>
            Biggest spending category:{" "}
            <strong style={{ color: colors.textMain }}>{biggestCategory}</strong>
          </p>
        </div>
      </div>

      {/* Personalisation */}
      <h2 style={{ color: colors.textMain }}>Personalisation</h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: 400,
          margin: "auto",
        }}
      >
        <label style={{ color: colors.textMain }}>
          🧠 Name / Nickname
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            style={inputStyle(colors)}
          />
        </label>

        <label style={{ color: colors.textMain }}>
          💷 Preferred Currency
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            style={inputStyle(colors)}
          >
            <option value="£">£ (GBP)</option>
            <option value="$">$ (USD)</option>
            <option value="€">€ (EUR)</option>
          </select>
        </label>

        <label style={{ color: colors.textMain }}>
          🎯 Monthly Savings Goal
          <input
            type="number"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. 200"
            style={inputStyle(colors)}
          />
        </label>
      </div>

      {/* Quick Insights */}
      <h2 style={{ marginTop: "2rem", color: colors.textMain }}>Quick Insights</h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        <InsightCard
          title="Spending Trend"
          text={
            prevTotal
              ? `You’ve spent ${Math.abs(Number(changePercent))}% ${
                  Number(changePercent) > 0 ? "less" : "more"
                } than last month.`
              : "Tracking your first month!"
          }
          colors={colors}
        />
        <InsightCard
          title="Top Categories"
          text={`Your top 3 spending categories: ${topCategories || "N/A"}.`}
          colors={colors}
        />
        <InsightCard
          title="Savings Goal"
          text={goal ? `Goal: Save ${currency}${goal} this month.` : "No goal set yet."}
          colors={colors}
        />
      </div>
    </div>
  );
};

export default Profile;
