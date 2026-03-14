import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Expense from "./pages/Expense";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import { AppProvider } from "./context/AppContext";
import Profile from "./components/Profile";
import "./App.css";

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/expense" element={<Expense />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;
