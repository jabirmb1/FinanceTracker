import React, { createContext, useState, useEffect, type ReactNode } from "react";

// -------------------- Chrome storage helpers --------------------
// All finance data goes through chrome.storage.local so content.js
// (the overlay) reads from the same store as the popup.

function chromeGet(keys: string[]): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    if (typeof chrome !== "undefined" && chrome?.storage?.local) {
      chrome.storage.local.get(keys, resolve);
    } else {
      // Dev fallback (plain browser tab outside extension context)
      const result: Record<string, any> = {};
      keys.forEach(k => {
        const v = localStorage.getItem(k);
        if (v !== null) {
          try { result[k] = JSON.parse(v); } catch { result[k] = v; }
        }
      });
      resolve(result);
    }
  });
}

function chromeSet(items: Record<string, any>): void {
  if (typeof chrome !== "undefined" && chrome?.storage?.local) {
    chrome.storage.local.set(items);
  } else {
    // Dev fallback
    Object.entries(items).forEach(([k, v]) => {
      localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
    });
  }
}

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
  deleteCategory: (name: string) => void;
  renameCategory: (oldName: string, newName: string) => void;
  addExpense: (description: string, amount: number | string, category: string) => void;
  deleteExpense: (id: number) => void;
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

// -------------------- Provider --------------------
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const currentKey = getCurrentMonthKey();

  const [allData, setAllData] = useState<Record<string, any>>({});
  const [currency, setCurrency] = useState<string>("£");
  const [monthKey, setMonthKey] = useState(currentKey);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>(DEFAULT_BUDGETS);
  const [categories, setCategories] = useState<string[]>(DEFAULT_BUDGETS.map(b => b.category));
  const [loaded, setLoaded] = useState(false);

  // -------------------- Initial load from chrome.storage --------------------
  useEffect(() => {
    chromeGet(["financeData", "currency"]).then((result) => {
      const savedCurrency = typeof result.currency === "string" ? result.currency : "£";
      setCurrency(savedCurrency);

      const raw = result.financeData;
      const data: Record<string, any> = raw && typeof raw === "object" ? raw : {};
      setAllData(data);

      const monthData: MonthData = data[currentKey] || { expenses: [], budgets: DEFAULT_BUDGETS };
      setExpenses(monthData.expenses || []);
      setBudgets(monthData.budgets || DEFAULT_BUDGETS);

      const savedCats = data["_categories"];
      setCategories(savedCats || (monthData.budgets || DEFAULT_BUDGETS).map((b: Budget) => b.category));

      setLoaded(true);
    });
  }, []);

  // -------------------- Persist currency --------------------
  useEffect(() => {
    if (!loaded) return;
    chromeSet({ currency });
  }, [currency, loaded]);

  // -------------------- Persist finance data --------------------
  useEffect(() => {
    if (!loaded) return;
    setAllData(prev => {
      const updated = { ...prev, [monthKey]: { expenses, budgets }, _categories: categories };
      chromeSet({ financeData: updated });
      return updated;
    });
  }, [monthKey, expenses, budgets, categories, loaded]);

  // -------------------- Month Navigation --------------------
  const loadMonth = (key: string) => {
    const monthData: MonthData = allData[key] || { expenses: [], budgets: DEFAULT_BUDGETS };
    setMonthKey(key);
    setExpenses(monthData.expenses || []);
    setBudgets(monthData.budgets || DEFAULT_BUDGETS);
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

  // Fix #10: deleteExpense was missing entirely
  const deleteExpense = (id: number) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
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
    setCategories(prev => [...prev, trimmed]);
    setBudgets(prev => [...prev, { category: trimmed, budget: 0 }]);
  };

  const deleteCategory = (name: string) => {
    setCategories(prev => prev.filter(c => c !== name));
    setBudgets(prev => prev.filter(b => b.category !== name));
    // Re-categorise any expenses in this category to "Other"
    setExpenses(prev => prev.map(e => e.category === name ? { ...e, category: "Other" } : e));
  };

  const renameCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return alert("Category name cannot be empty.");
    const exists = categories.some(c => c.toLowerCase() === trimmed.toLowerCase() && c !== oldName);
    if (exists) return alert("A category with that name already exists.");
    setCategories(prev => prev.map(c => c === oldName ? trimmed : c));
    setBudgets(prev => prev.map(b => b.category === oldName ? { ...b, category: trimmed } : b));
    setExpenses(prev => prev.map(e => e.category === oldName ? { ...e, category: trimmed } : e));
  };

  const formatMoney = (n: number) => `${currency}${Number(n || 0).toLocaleString()}`;

  if (!loaded) return null; // prevent rendering with empty state before storage loads

  return (
    <AppContext.Provider
      value={{
        monthKey,
        expenses,
        budgets,
        categories,
        addCategory,
        deleteCategory,
        renameCategory,
        addExpense,
        deleteExpense,
        updateBudget,
        prevMonth,
        nextMonth,
        goToCurrentMonth,
        currency,
        setCurrency,
        formatMoney,
        allData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};