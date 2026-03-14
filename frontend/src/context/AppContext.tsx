import React, { createContext, useState, useEffect, type ReactNode } from "react";

// -------------------- Types --------------------
export interface Budget {
  category: string;
  budget: number;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
}

export interface MonthData {
  expenses: Expense[];
  budgets: Budget[];
}

export interface AppContextType {
  monthKey: string;
  expenses: Expense[];
  budgets: Budget[];
  categories: string[];
  addCategory: (name: string) => void;
  addExpense: (description: string, amount: number | string, category: string) => void;
  updateBudget: (category: string, newAmount: number | string) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  goToCurrentMonth: () => void;
  currency: string;
  setCurrency: React.Dispatch<React.SetStateAction<string>>;
  formatMoney: (n: number) => string;
  allData: Record<string, MonthData | Expense[] | Budget[]>;
}

// -------------------- Context --------------------
export const AppContext = createContext<AppContextType>({} as AppContextType);

// -------------------- Defaults --------------------
const DEFAULT_BUDGETS: Budget[] = [
  { category: "Food", budget: 50 },
  { category: "Subscription", budget: 80 },
  { category: "Clothes", budget: 100 },
  { category: "Savings", budget: 200 },
];

// -------------------- Helpers --------------------
const getCurrentMonthKey = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const shiftMonth = (monthKey: string, delta: number): string => {
  const [y, m] = monthKey.split("-").map(Number);
  const d = new Date(y, m - 1 + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const readAll = (): Record<string, any> => {
  try {
    const raw = localStorage.getItem("financeData");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeAll = (data: Record<string, any>) => {
  localStorage.setItem("financeData", JSON.stringify(data));
};

// -------------------- Provider --------------------
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const currentKey = getCurrentMonthKey();
  const allData = readAll();

  const [currency, setCurrency] = useState(localStorage.getItem("currency") || "£");

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  const initialData: MonthData = allData[currentKey] || { expenses: [], budgets: DEFAULT_BUDGETS };

  const [monthKey, setMonthKey] = useState(currentKey);
  const [expenses, setExpenses] = useState<Expense[]>(initialData.expenses);
  const [budgets, setBudgets] = useState<Budget[]>(initialData.budgets);

  const savedCategories = allData["_categories"];
  const [categories, setCategories] = useState<string[]>(
    savedCategories || initialData.budgets.map((b) => b.category)
  );

  useEffect(() => {
    const all = readAll();
    all[monthKey] = { expenses, budgets };
    all["_categories"] = categories;
    writeAll(all);
  }, [monthKey, expenses, budgets, categories]);

  // -------------------- Month Navigation --------------------
  const loadMonth = (key: string) => {
    const all = readAll();
    const monthData: MonthData = all[key] || { expenses: [], budgets: DEFAULT_BUDGETS };
    setMonthKey(key);
    setExpenses(monthData.expenses);
    setBudgets(monthData.budgets);
  };

  const prevMonth = () => loadMonth(shiftMonth(monthKey, -1));
  const nextMonth = () => loadMonth(shiftMonth(monthKey, 1));
  const goToCurrentMonth = () => loadMonth(getCurrentMonthKey());

  // -------------------- Expense & Budget Management --------------------
  const addExpense = (description: string, amount: number | string, category: string) => {
    if (!description || !amount) return;
    const newExpense: Expense = {
      id: Date.now(),
      description,
      amount: Number(amount),
      category,
    };
    setExpenses((prev) => [...prev, newExpense]);
  };

  const updateBudget = (category: string, newAmount: number | string) => {
    setBudgets((prev) =>
      prev.map((b) => (b.category === category ? { ...b, budget: Number(newAmount) } : b))
    );
  };

  const addCategory = (newCat: string) => {
    const trimmed = newCat.trim();
    if (!trimmed) return alert("Category name cannot be empty.");

    const exists = categories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (exists) return alert("This category already exists.");

    const updatedCategories = [...categories, trimmed];
    setCategories(updatedCategories);

    const updatedBudgets = [...budgets, { category: trimmed, budget: 0 }];
    setBudgets(updatedBudgets);

    const all = readAll();
    all[monthKey] = { expenses, budgets: updatedBudgets };
    all["_categories"] = updatedCategories;
    writeAll(all);
  };

  const formatMoney = (n: number) => `${currency}${Number(n || 0).toLocaleString()}`;

  return (
    <AppContext.Provider
      value={{
        monthKey,
        expenses,
        budgets,
        categories,
        addCategory,
        addExpense,
        updateBudget,
        prevMonth,
        nextMonth,
        goToCurrentMonth,
        currency,
        setCurrency,
        formatMoney,
        allData: readAll(),
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
