import React, {
  createContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

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
  addExpense: (e: Expense) => void;
  addCategory: (c: string) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  goToCurrentMonth: () => void;
  currency: string;
  setCurrency: React.Dispatch<React.SetStateAction<string>>;
  formatMoney: (n: number) => string;
}

// -------------------- helpers --------------------
const getMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const shiftMonth = (key: string, delta: number) => {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

// -------------------- storage helpers --------------------
const readStorage = (): Promise<any> =>
  new Promise((resolve) => {
    chrome.storage.local.get(["financeData"], (res) => {
      try {
        resolve(res.financeData ? JSON.parse(res.financeData) : {});
      } catch {
        resolve({});
      }
    });
  });

const writeStorage = (data: any) => {
  chrome.storage.local.set({
    financeData: JSON.stringify(data),
  });
};

// -------------------- context --------------------
export const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [monthKey, setMonthKey] = useState(getMonthKey());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [currency, setCurrency] = useState("£");

  // 🔥 LOAD + SYNC FROM EXTENSION
  const load = async (key = monthKey) => {
    const all = await readStorage();

    const month = all[key] || { expenses: [], budgets: [] };

    setExpenses(month.expenses);
    setBudgets(month.budgets);

    setCategories(all["_categories"] || []);
  };

  useEffect(() => {
    load();
  }, [monthKey]);

  // 🔥 LIVE SYNC FROM CONTENT SCRIPT
  useEffect(() => {
    const listener = (changes: any, area: string) => {
      if (area !== "local") return;
      if (!changes.financeData) return;

      load(monthKey);
    };

    chrome.storage.local.onChanged.addListener(listener);
    return () =>
      chrome.storage.local.onChanged.removeListener(listener);
  }, [monthKey]);

  // -------------------- ADD EXPENSE (FIXED) --------------------
  const addExpense = async (expense: Expense) => {
    const all = await readStorage();

    const month = all[monthKey] || { expenses: [], budgets: [] };

    const updated = {
      ...all,
      [monthKey]: {
        ...month,
        expenses: [...month.expenses, expense],
      },
    };

    writeStorage(updated);
  };

  // -------------------- CATEGORY --------------------
  const addCategory = async (c: string) => {
    const all = await readStorage();

    const cats = all["_categories"] || [];

    if (cats.includes(c)) return;

    const updated = {
      ...all,
      _categories: [...cats, c],
    };

    writeStorage(updated);
  };

  // -------------------- MONTH NAV --------------------
  const prevMonth = () => setMonthKey(shiftMonth(monthKey, -1));
  const nextMonth = () => setMonthKey(shiftMonth(monthKey, 1));
  const goToCurrentMonth = () => setMonthKey(getMonthKey());

  const formatMoney = (n: number) =>
    `${currency}${Number(n || 0).toLocaleString()}`;

  return (
    <AppContext.Provider
      value={{
        monthKey,
        expenses,
        budgets,
        categories,
        addExpense,
        addCategory,
        prevMonth,
        nextMonth,
        goToCurrentMonth,
        currency,
        setCurrency,
        formatMoney,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};