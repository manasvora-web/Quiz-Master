import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useAlert } from "../context/AlertContext";
import {
  FaPlusCircle,
  FaListAlt,
  FaChartBar,
  FaUserCog,
  FaSignOutAlt,
  FaThLarge,
  FaLayout
} from "react-icons/fa";

import "../styles/dashboard.css";

export default function DashboardLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert } = useAlert();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    navigate("/", { replace: true });
    
    setTimeout(() => {
      logout();
      showAlert("Logged out successfully", "success");
    }, 10);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaThLarge />, path: '/organizer/dashboard' },
    { id: 'create', label: 'Create Quiz', icon: <FaPlusCircle />, path: '/organizer/create' },
    { id: 'manage', label: 'Manage Quizzes', icon: <FaListAlt />, path: '/organizer/quizzes' },
    { id: 'results', label: 'View Results', icon: <FaChartBar />, path: '/organizer/results' },
    { id: 'profile', label: 'Profile Settings', icon: <FaUserCog />, path: '/organizer/profile' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="new-dash-layout">
      
      {/* SIDEBAR */}
      <aside className="dash-sidebar">
        <div className="sidebar-brand" onClick={() => navigate("/organizer/dashboard")} style={{cursor: 'pointer'}}>
          <div className="brand-logo">QM</div>
          <h2>QuizMaster</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">
            <label>Menu</label>
            {menuItems.map(item => (
              <button 
                key={item.id} 
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <FaSignOutAlt /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dash-main">
        {children}
      </main>

      {/* LOGOUT CONFIRMATION */}
      {showLogoutConfirm && createPortal(
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>Confirm Logout</h3>
            <p className="text-center" style={{ color: "#64748b", margin: "10px 0 20px" }}>
              Are you sure you want to log out of your admin dashboard?
            </p>
            <div className="confirm-actions">
              <button className="modal-cancel" onClick={() => setShowLogoutConfirm(false)}>
                Stay Here
              </button>
              <button 
                className="modal-confirm" 
                style={{ background: "#ef4444", color: "white" }}
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
