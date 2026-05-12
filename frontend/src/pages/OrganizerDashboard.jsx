import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import { useAlert } from "../context/AlertContext";

/* ICONS */
import {
  FaPlusCircle,
  FaListAlt,
  FaChartBar,
  FaUserCog,
  FaSignOutAlt
} from "react-icons/fa";

import "../styles/dashboard.css";


export default function OrganizerDashboard() {

  const { logout } = useAuth();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);



  /* ================= LOAD QUIZZES ================= */

  useEffect(() => {

    const checkQuizzes = async () => {

      try {

        const res = await api.get("/quiz/my-quizzes");

        /* NO QUIZZES → CREATE */
        if (res.data.length === 0) {

          showAlert(
            "No quizzes found. Create your first quiz!",
            "info",
            2000
          );

          navigate("/organizer/create");
        }

      } catch (err) {

        const message =
          err.response?.data?.message ||
          "Failed to load quizzes";

        showAlert(message, "error");

      } finally {

        setLoading(false);
      }
    };

    checkQuizzes();

  }, [navigate, showAlert]);



  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    showAlert("Logged out successfully", "success");
    navigate("/", { replace: true });
  };



  /* ================= UI ================= */

  if (loading) {
    return (
      <p className="loading-text">
        Loading...
      </p>
    );
  }



  return (
    <div className="dashboard-container">


      {/* HEADER */}
      <div className="dashboard-header">

        <h2>QuizMaster Admin</h2>

        <p>Manage your quizzes easily</p>

      </div>



      {/* CARDS */}
      <div className="dashboard-cards">


        {/* CREATE QUIZ */}
        <div
          className="dashboard-card"
          onClick={() =>
            navigate("/organizer/create")
          }
        >
          <FaPlusCircle className="dash-icon" />

          <h3>Create New Quiz</h3>

          <p>Create and publish new quizzes</p>
        </div>



        {/* MANAGE QUIZZES */}
        <div
          className="dashboard-card"
          onClick={() =>
            navigate("/organizer/quizzes")
          }
        >
          <FaListAlt className="dash-icon" />

          <h3>Manage Quizzes</h3>

          <p>View, edit and monitor quizzes</p>
        </div>



        {/* VIEW RESULTS */}
        <div
          className="dashboard-card"
          onClick={() =>
            navigate("/organizer/results")
          }
        >
          <FaChartBar className="dash-icon" />

          <h3>View Results</h3>

          <p>Analyze student performance</p>
        </div>



        {/* PROFILE */}
        <div
          className="dashboard-card"
          onClick={() =>
            navigate("/organizer/profile")
          }
        >
          <FaUserCog className="dash-icon" />

          <h3>Profile Settings</h3>

          <p>Update account information</p>
        </div>

      </div>



      {/* FOOTER */}
      <div className="dashboard-footer">

        <button
          className="dashboard-logout"
          onClick={handleLogout}
        >
          <FaSignOutAlt /> Logout
        </button>

      </div>
 
 
       {/* ================= LOGOUT CONFIRMATION ================= */}
       {showLogoutConfirm && createPortal(
         <div className="confirm-overlay">
           <div className="confirm-box">
             
             <h3>Confirm Logout</h3>
             
             <p className="text-center" style={{ color: "#64748b", margin: "10px 0 20px" }}>
               Are you sure you want to log out of your admin dashboard?
             </p>
 
             <div className="confirm-actions">
               <button 
                 className="modal-cancel" 
                 onClick={() => setShowLogoutConfirm(false)}
               >
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