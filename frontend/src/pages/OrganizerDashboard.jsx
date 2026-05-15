import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import { useAlert } from "../context/AlertContext";

/* ICONS */
import {
  FaPlusCircle,
  FaListAlt,
  FaChartBar,
  FaUserCog,
  FaSignOutAlt,
  FaTrophy,
  FaUsers,
  FaCheckCircle,
  FaQuestionCircle,
  FaThLarge
} from "react-icons/fa";

import "../styles/dashboard.css";

export default function OrganizerDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalAttempts: 0,
    totalStudents: 0,
    passRate: 0
  });

  /* ================= LOAD DASHBOARD DATA ================= */
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch quizzes to check if any exist
        const quizRes = await api.get("/quiz/my-quizzes");
        
        // Fetch analytics for stats
        const analyticsRes = await api.get("/analytics");
        const data = analyticsRes.data || {};

        setStats({
          totalQuizzes: quizRes.data.length,
          totalAttempts: data.total_attempts || 0,
          totalStudents: data.students_active || 0,
          passRate: data.pass_percentage || 0
        });

        /* NO QUIZZES → CREATE */
        if (quizRes.data.length === 0) {
          showAlert("No quizzes found. Create your first quiz!", "info", 2000);
          navigate("/organizer/create");
        }
      } catch (err) {
        console.error("Dashboard load error", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate, showAlert]);

  /* ================= LOGOUT ================= */
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

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="dash-loader">
        <div className="spinner"></div>
        <p>Preparing your dashboard...</p>
      </div>
    );
  }

  const menuItems = [
    { id: 'create', label: 'Create Quiz', icon: <FaPlusCircle />, path: '/organizer/create', color: '#6366f1' },
    { id: 'manage', label: 'Manage Quizzes', icon: <FaListAlt />, path: '/organizer/quizzes', color: '#f59e0b' },
    { id: 'results', label: 'View Results', icon: <FaChartBar />, path: '/organizer/results', color: '#10b981' },
    { id: 'profile', label: 'Profile Settings', icon: <FaUserCog />, path: '/organizer/profile', color: '#64748b' },
  ];

  return (
    <div className="new-dash-layout">
      
      {/* SIDEBAR */}
      <aside className="dash-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">QM</div>
          <h2>QuizMaster</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">
            <label>Menu</label>
            <button className="nav-item active">
              <FaThLarge /> Dashboard
            </button>
            {menuItems.map(item => (
              <button 
                key={item.id} 
                className="nav-item"
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
        
        {/* TOP BAR */}
        <header className="dash-top-bar">
          <div className="welcome-text">
            <h1>Organizer Dashboard</h1>
            <p>Welcome back! Here's what's happening with your quizzes.</p>
          </div>
          <button className="create-quick-btn" onClick={() => navigate("/organizer/create")}>
            <FaPlusCircle /> New Quiz
          </button>
        </header>

        {/* STATS GRID */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon q-icon"><FaQuestionCircle /></div>
            <div className="stat-info">
              <label>Total Quizzes</label>
              <h3>{stats.totalQuizzes}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon a-icon"><FaUsers /></div>
            <div className="stat-info">
              <label>Total Attempts</label>
              <h3>{stats.totalAttempts}</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon s-icon"><FaCheckCircle /></div>
            <div className="stat-info">
              <label>Pass Rate</label>
              <h3>{stats.passRate}%</h3>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon t-icon"><FaTrophy /></div>
            <div className="stat-info">
              <label>Active Students</label>
              <h3>{stats.totalStudents}</h3>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <h2 className="section-title">Quick Actions</h2>
        <section className="action-grid">
          {menuItems.map((item, index) => (
            <div 
              key={item.id} 
              className="action-card" 
              style={{"--accent": item.color, animationDelay: `${index * 0.1}s`}}
              onClick={() => navigate(item.path)}
            >
              <div className="action-icon-wrap">
                {item.icon}
              </div>
              <div className="action-content">
                <h3>{item.label}</h3>
                <p>Click here to {item.label.toLowerCase()}</p>
              </div>
              <div className="action-arrow">→</div>
            </div>
          ))}
        </section>
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