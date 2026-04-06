import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

export default function Home() {

  const navigate = useNavigate();

  /* ================= SAFE NAVIGATION ================= */

  const goOrganizerLogin = () => {
    navigate("/organizer/login", { replace: true });
  };

  const goJoinQuiz = () => {
    navigate("/join", { replace: true });
  };



  /* ================= UI ================= */

  return (
    <div className="home-wrapper">

      <div className="home-card">


        {/* LOGO / TITLE */}
        <h1 className="home-title">QuizMaster</h1>

        <p className="home-subtitle">
          Secure Online Examination Platform
        </p>


        {/* DIVIDER */}
        <div className="home-divider"></div>


        {/* ACTION BUTTONS */}
        <div className="home-actions">

          <button
            className="home-btn primary"
            onClick={goOrganizerLogin}
          >
            Organizer Login
          </button>

          <button
            className="home-btn secondary"
            onClick={goJoinQuiz}
          >
            Join Quiz
          </button>

        </div>


        {/* FOOTER */}
        <p className="home-footer">
          © {new Date().getFullYear()} QuizMaster • All Rights Reserved
        </p>

      </div>

    </div>
  );
}