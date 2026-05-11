import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAlert } from "../context/AlertContext";
import "../styles/QuizResult.css";

export default function QuizResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const data = location.state;

  useEffect(() => {
    if (!data) {
      showAlert("Result not found. Redirecting to home...", "warning", 2000);
      setTimeout(() => navigate("/", { replace: true }), 1000);
    }
  }, [data, navigate, showAlert]);

  if (!data) return null;

  /* ================= CALCULATIONS ================= */
  const correct = Math.max(0, Number(data.score) || 0);
  const totalQ = Math.max(1, Number(data.total) || 1);
  let percentage = Number(data.percentage);
  
  if (isNaN(percentage)) {
    percentage = Math.round((correct / totalQ) * 100);
  }
  percentage = Math.min(100, Math.max(0, percentage));

  const grade = data.grade || "F";
  const status = data.status || data.result_status || "Fail";
  const isPass = status === "Pass";

  const goHome = () => {
    navigate("/", { replace: true });
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <div className="result-wrapper">
      <div className="result-card">
        <div className="result-header">
          <h2>Quiz Completed</h2>
        </div>

        <div className="percentage-badge" style={{ color: isPass ? "var(--success)" : "var(--error)" }}>
          {percentage}%
        </div>

        <div className={`status-badge ${isPass ? "status-pass" : "status-fail"}`}>
          {isPass ? "🎉 Passed" : "❌ Failed"}
        </div>

        <div className="score-details">
          <div className="score-item">
            <div className="score-label">Score</div>
            <div className="score-value">{correct} / {totalQ}</div>
          </div>
          <div className="score-item">
            <div className="score-label">Grade</div>
            <div className="score-value">{grade}</div>
          </div>
        </div>

        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ 
              width: `${percentage}%`,
              background: isPass ? "var(--success)" : "var(--error)"
            }}
          ></div>
        </div>

        <button className="home-btn-result" onClick={goHome}>
          Return to Home
        </button>
      </div>
    </div>
  );
}