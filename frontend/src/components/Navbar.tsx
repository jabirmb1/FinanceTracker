import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import "../App.css";

const Navbar: React.FC = () => {
  // Controls if profile menu is visible
  const [open, setOpen] = useState<boolean>(false);

  // Theme state, defaults to light if nothing in localStorage
  const [theme, setTheme] = useState<string>(
    localStorage.getItem("theme") || "light"
  );

  // Toggle between light and dark mode
  const handleThemeToggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    setOpen(false);

    localStorage.setItem("theme", next);
    window.dispatchEvent(new Event("storage"));
  };

  // Apply theme to body when it changes
  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Reset all stored data
  const handleReset = () => {
    if (window.confirm("⚠️ Are you sure you want to delete all data?")) {
      localStorage.removeItem("financeData");
      window.location.reload();
    }
  };

  return (
    <div className="navbar">
      {/* Home Icon */}
      <Link to="/" className="nav-home">
        🏠
      </Link>

      {/* Profile Section */}
      <div className="nav-right">
        <div className="profile-icon" onClick={() => setOpen(!open)}>
          <User size={30} />
        </div>

        {open && (
          <div className="profile-menu">
            <Link to="/profile" onClick={() => setOpen(false)}>
              Profile
            </Link>
            <Link to="/budget" onClick={() => setOpen(false)}>
              Budget
            </Link>
            <Link to="/contact" onClick={() => setOpen(false)}>
              Contact
            </Link>

            <hr />

            <button onClick={handleThemeToggle}>
              {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </button>

            <button onClick={handleReset} className="danger">
              🗑️ Reset All Data
            </button>

            <p className="version">v1.0.0</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
