import React, { useState, useEffect } from "react";
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import Expense from "./pages/Expense";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import { AppProvider } from "./context/AppContext";
import Profile from "./components/Profile";
import BottomNav from "./components/BottomNav";
import Onboarding from "./components/Onboarding";
import "./App.css";
import Contact from "./pages/Contact";

const App: React.FC = () => {
  const [onboarded, setOnboarded] = useState<boolean>(
    () => localStorage.getItem("onboardingDone") === "true"
  );

  // Apply saved theme and accent on every load
  useEffect(() => {
    const theme = localStorage.getItem("theme") || "light";
    document.body.classList.toggle("dark", theme === "dark");

    const accent = localStorage.getItem("accentColor");
    const accentMap: Record<string, string> = {
      navy:       "#1e3a5f",
      forest:     "#2d6a4f",
      slate:      "#334155",
      terracotta: "#b5451b",
      midnight:   "#0d1117",
      ocean:      "#0369a1",
      plum:       "#6b21a8",
      rose:       "#9f1239",
    };
    if (accent && accentMap[accent]) {
      document.documentElement.style.setProperty("--accent", accentMap[accent]);
    }

    const chart = localStorage.getItem("chartColor");
    const chartMap: Record<string, string> = {
      blue:   "#3b82f6",
      green:  "#10b981",
      purple: "#8b5cf6",
      orange: "#f59e0b",
      pink:   "#ec4899",
      teal:   "#14b8a6",
    };
    if (chart && chartMap[chart]) {
      document.documentElement.style.setProperty("--chart-color", chartMap[chart]);
    }
  }, [onboarded]);

  if (!onboarded) {
    return <Onboarding onComplete={() => setOnboarded(true)} />;
  }

  return (
    <AppProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/expense" element={<Expense />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <BottomNav />
      </MemoryRouter>
    </AppProvider>
  );
};

export default App;