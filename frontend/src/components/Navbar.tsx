import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import "./Navbar.css";

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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.nav-right')) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [open]);

  return (
    <div className="navbar">
      {/* Left Side - Home */}
      <Link to="/" className="nav-home">
        🏠 Home
      </Link>

      {/* Right Side - Menu + Profile */}
      <div className="nav-right">
        {/* Desktop Menu Links */}
        <div className="nav-menu">
          <Link to="/budget">Budget</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/contact">Contact</Link>
        </div>

        {/* Divider */}
        <div className="nav-divider"></div>

        {/* Theme Toggle */}
        <button className="theme-toggle" onClick={handleThemeToggle}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        {/* Profile Dropdown */}
        <div className="profile-icon" onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}>
          <User />
        </div>

        {/* Dropdown Menu */}
        {open && (
          <div className="profile-menu">
            {/* Mobile-only links */}
            <Link to="/budget" onClick={() => setOpen(false)} className="mobile-only">
              Budget
            </Link>
            <Link to="/profile" onClick={() => setOpen(false)} className="mobile-only">
              Profile
            </Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="mobile-only">
              Contact
            </Link>

            <hr className="mobile-only" />

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