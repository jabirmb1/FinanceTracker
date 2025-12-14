import React from "react";
import { useNavigate } from "react-router-dom";

interface NavMenuProps {
  open: boolean;
  onClose: () => void;
  theme: string;
  onToggleTheme: () => void;
  onReset: () => void;
}

const NavMenu: React.FC<NavMenuProps> = ({
  open,
  onClose,
  theme,
  onToggleTheme,
  onReset,
}) => {
  const navigate = useNavigate();

  if (!open) return null;

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="profile-menu">
      <button
        type="button"
        className="profile-item"
        onClick={() => handleNav("/profile")}
      >
        Profile
      </button>
      <button
        type="button"
        className="profile-item"
        onClick={() => handleNav("/transactions")}
      >
        Transactions
      </button>
      <button
        type="button"
        className="profile-item"
        onClick={() => handleNav("/budget")}
      >
        Budget
      </button>

      <hr />

      <button
        type="button"
        className="profile-item"
        onClick={onToggleTheme}
      >
        {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
      </button>

      <button
        type="button"
        className="profile-item danger"
        onClick={onReset}
      >
        🗑️ Reset All Data
      </button>

      <p className="version">v1.0.0</p>
    </div>
  );
};

export default NavMenu;
