import React from "react";
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Home from "./pages/Home";
import Expense from "./pages/Expense";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import { AppProvider } from "./context/AppContext";
import Profile from "./components/Profile";
import BottomNav from "./components/BottomNav";
import "./App.css";
import Contact from "./pages/Contact";

const App: React.FC = () => {
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