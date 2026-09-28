import {
  ArrowLeftRight,
  BarChart3,
  Bot,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../CSS/sidebar.css";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setShowLogoutConfirm(false);
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <div className="dashboard-logo">
        <div className="dashboard-logo-icon">
          <TrendingUp size={17} />
        </div>
        <span>
          Expense<span>Pilot</span>
        </span>
      </div>
      <button
        className="mobile-menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      {/* Navigation */}
      <div className={`sidebar-nav ${menuOpen ? "mobile-menu-open" : ""}`}>
        <div
          className={`nav-item ${location.pathname === "/" || location.pathname === "/dashboard" ? "active" : ""}`}
          onClick={() => navigate("/dashboard")}
        >
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </div>
        <div
          className={`nav-item ${location.pathname === "/transactions" ? "active" : ""}`}
          onClick={() => navigate("/transactions")}
        >
          <ArrowLeftRight size={16} />
          <span>Transactions</span>
        </div>
        <div
          className={`nav-item ${location.pathname === "/budget" ? "active" : ""}`}
          onClick={() => navigate("/budget")}
        >
          <WalletCards size={16} />
          <span>Budget</span>
        </div>
        <div
          className={`nav-item ${location.pathname === "/analytics" ? "active" : ""}`}
          onClick={() => navigate("/analytics")}
        >
          <BarChart3 size={16} />
          <span>Analytics</span>
        </div>
        <div
          className={`nav-item ${location.pathname === "/goals" ? "active" : ""}`}
          onClick={() => navigate("/goals")}
        >
          <Bot size={16} />
          <span>Goals</span>
        </div>
        <div
          className={`nav-item ${location.pathname === "/report" ? "active" : ""}`}
          onClick={() => navigate("/report")}
        >
          <FileText size={16} />
          <span>Reports</span>
        </div>
        <div
          className={`nav-item ${location.pathname === "/settings" ? "active" : ""}`}
          onClick={() => navigate("/settings")}
        >
          <Settings size={16} />
          <span>Settings</span>
        </div>
      </div>

      {/* user at bottom */}
      <div className={`sidebar-user ${menuOpen ? "mobile-user-open" : ""}`}>
        <div className="user-avatar">
          {JSON.parse(localStorage.getItem("user"))
            ?.name?.charAt(0)
            .toUpperCase() || "U"}
        </div>
        <div className="user-info">
          <strong>
            {JSON.parse(localStorage.getItem("user"))?.name || "User"}
          </strong>
        </div>
        <button
          className="logout-button"
          onClick={() => setShowLogoutConfirm(true)}
        >
          <LogOut size={20} />
        </button>
      </div>
      {showLogoutConfirm && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <div className="logout-modal-icon">
              <LogOut size={22} />
            </div>

            <h3>Logout?</h3>

            <p>Are you sure you want to logout from ExpensePilot?</p>

            <div className="logout-modal-actions">
              <button
                type="button"
                className="logout-cancel-btn"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="logout-confirm-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
