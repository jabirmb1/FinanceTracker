import React, { useContext, useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { AppContext } from "../context/AppContext";
import type { AppContextType, Budget, Expense } from "../context/AppContext";

const CHART_COLOR_MAP: Record<string, string> = {
  blue:   "#3b82f6",
  green:  "#10b981",
  purple: "#8b5cf6",
  orange: "#f59e0b",
  pink:   "#ec4899",
  teal:   "#14b8a6",
  red:    "#ef4444",
  lime:   "#84cc16",
};

const Chart: React.FC = () => {
  const { expenses, budgets, currency } = useContext<AppContextType>(AppContext);
  const [isDark, setIsDark] = useState(() => document.body.classList.contains("dark"));

  const [chartColorId, setChartColorId] = useState(() => localStorage.getItem("chartColor") || "blue");
  const [spentColorId, setSpentColorId] = useState(() => localStorage.getItem("spentColor") || "green");

  useEffect(() => {
    const sync = () => {
      setChartColorId(localStorage.getItem("chartColor") || "blue");
      setSpentColorId(localStorage.getItem("spentColor") || "green");
      setIsDark(document.body.classList.contains("dark"));
    };
    const t = setInterval(sync, 150);
    window.addEventListener("ft-settings-change", sync);
    return () => { clearInterval(t); window.removeEventListener("ft-settings-change", sync); };
  }, []);

  const budgetColor = chartColorId === "custom"
    ? (localStorage.getItem("customChart") || "#3b82f6")
    : (CHART_COLOR_MAP[chartColorId] || "#3b82f6");

  const SPENT_COLOR_MAP: Record<string, string> = {
    green: "#10b981", cyan: "#06b6d4", yellow: "#eab308", pink: "#ec4899",
    violet: "#8b5cf6", white: "#e6edf3", lime: "#84cc16", sky: "#38bdf8",
  };
  const spentColor = spentColorId === "custom"
    ? (localStorage.getItem("customSpent") || "#10b981")
    : (SPENT_COLOR_MAP[spentColorId] || "#10b981");

  const data = budgets.map((b: Budget) => {
    const spent = expenses
      .filter((e: Expense) => e.category === b.category)
      .reduce((sum, e) => sum + e.amount, 0);
    return { category: b.category, budget: b.budget, spent, overspent: spent > b.budget };
  });

  const tooltipStyle = {
    background: isDark ? "rgba(13,17,23,0.6)" : "rgba(255,255,255,0.6)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
    borderRadius: 12,
    color: isDark ? "#e6edf3" : "#0f1c2e",
    fontSize: "0.75rem",
    boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.08)",
  };

  return (
    <div style={{ outline: "none", marginTop: 16 }}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barGap={4}>
          <XAxis
            dataKey="category"
            tick={{ fill: isDark ? "#8b949e" : "#6b7280", fontSize: 11 }}
            axisLine={false} tickLine={false}
          />
          <YAxis
            tick={{ fill: isDark ? "#8b949e" : "#6b7280", fontSize: 11 }}
            axisLine={false} tickLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={{ fontWeight: 700, marginBottom: 6, color: isDark ? "#e6edf3" : "#0f1c2e", fontSize: "0.8rem" }}
            itemStyle={{ color: isDark ? "#8b949e" : "#6b7280", fontSize: "0.72rem" }}
            cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", borderRadius: 6 }}
            formatter={(value: number | string, name: string) => {
              const n = typeof value === "string" ? parseFloat(value) : value;
              return [`${currency}${n}`, name === "budget" ? "Budget" : "Spent"];
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "0.72rem", color: isDark ? "#8b949e" : "#6b7280" }}
            formatter={(value) => (
              <span style={{ color: isDark ? "#8b949e" : "#6b7280" }}>{value}</span>
            )}
          />
          <Bar dataKey="budget" name="Budget" fill={budgetColor} radius={[4, 4, 0, 0]} />
          <Bar dataKey="spent" name="Spent" fill={spentColor} radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.overspent ? "#ef4444" : spentColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
