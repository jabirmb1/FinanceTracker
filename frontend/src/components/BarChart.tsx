import React, { useContext } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { AppContext } from "../context/AppContext";
import type { AppContextType, Budget, Expense } from "../context/AppContext";

// Define the shape of data for the chart
interface ChartData {
  category: string;
  budget: number;
  spent: number;
  overspent: boolean;
}

const Chart: React.FC = () => {
  const { expenses, budgets, currency } = useContext<AppContextType>(AppContext);

  const spentPerCategory: ChartData[] = budgets.map((b: Budget) => {
    const totalSpent = expenses
      .filter((e: Expense) => e.category === b.category)
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      category: b.category,
      budget: b.budget,
      spent: totalSpent,
      overspent: totalSpent > b.budget,
    };
  });
   return (
    <div style={{ outline: 'none' }}>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={spentPerCategory}>
          <XAxis dataKey="category" />
          <YAxis />

          <Tooltip
            formatter={(value: number | string, name: string) => {
              const numValue = typeof value === "string" ? parseFloat(value) : value;
              if (name === "budget") return [`${currency}${numValue}`, "Budget"];
              if (name === "spent") return [`${currency}${numValue}`, "Spent"];
              return [`${currency}${numValue}`, name];
            }}
          />

          <Legend
            payload={[
              { value: "Budget", type: "square", color: "#4A90E2" },
              { value: "Spent (within budget)", type: "square", color: "#50E3C2" },
              { value: "Overspent", type: "square", color: "#ff4d4d" },
            ]}
          />

          <Bar dataKey="budget" name="Budget" fill="#4A90E2" />
          <Bar dataKey="spent" name="Spent">
            {spentPerCategory.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.overspent ? "#ff4d4d" : "#50E3C2"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default Chart;
