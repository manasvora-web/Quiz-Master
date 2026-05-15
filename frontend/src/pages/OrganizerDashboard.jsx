import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAlert } from "../context/AlertContext";

/* ICONS */
import {
  FaPlusCircle,
  FaUsers,
  FaCheckCircle,
  FaQuestionCircle,
  FaTrophy,
  FaArrowRight
} from "react-icons/fa";

import "../styles/dashboard.css";

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(true);
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
        const quizRes = await api.get("/quiz/my-quizzes");
        const analyticsRes = await api.get("/analytics");
        const data = analyticsRes.data || {};

        setStats({
          totalQuizzes: quizRes.data.length,
          totalAttempts: data.total_attempts || 0,
          totalStudents: data.students_active || 0,
          passRate: data.pass_percentage || 0
        });

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

  if (loading) {
    return (
      <div className="dash-loader">
        <div className="spinner"></div>
        <p>Preparing your dashboard...</p>
      </div>
    );
  }

  const quickLinks = [
    { label: 'Create Quiz', path: '/organizer/create', color: '#6366f1', desc: 'Build a new assessment' },
    { label: 'Manage Quizzes', path: '/organizer/quizzes', color: '#f59e0b', desc: 'Edit and monitor existing ones' },
    { label: 'View Results', path: '/organizer/results', color: '#10b981', desc: 'Analyze student performance' },
    { label: 'Profile Settings', path: '/organizer/profile', color: '#64748b', desc: 'Update your admin profile' },
  ];

  return (
    <div className="dash-content-area">
      {/* TOP BAR */}
      <header className="dash-top-bar">
        <div className="welcome-text">
          <h1>Dashboard Overview</h1>
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
        {quickLinks.map((item, index) => (
          <div 
            key={index} 
            className="action-card" 
            style={{"--accent": item.color, animationDelay: `${index * 0.1}s`}}
            onClick={() => navigate(item.path)}
          >
            <div className="action-icon-wrap">
              <FaArrowRight />
            </div>
            <div className="action-content">
              <h3>{item.label}</h3>
              <p>{item.desc}</p>
            </div>
            <div className="action-arrow">→</div>
          </div>
        ))}
      </section>
    </div>
  );
}