import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAlert } from "../context/AlertContext";

import "../styles/manage.css";

export default function ManageQuizzes() {

  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);



  /* ================= LOAD QUIZZES ================= */

  useEffect(() => {

    const loadQuizzes = async () => {

      try {

        const res = await api.get("/quiz/my-quizzes");

        setQuizzes(res.data);

        if (res.data.length === 0) {
          showAlert(
            "No quizzes created yet",
            "info",
            2000
          );
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

    loadQuizzes();

  }, [showAlert]);

  /* ================= DELETE QUIZ ================= */
 
   const handleDeleteClick = (quiz) => {
     setQuizToDelete(quiz);
     setShowDeleteConfirm(true);
   };
 
   const confirmDelete = async () => {
     if (!quizToDelete) return;
 
     try {
       await api.delete(`/quiz/${quizToDelete.id}`);
       setQuizzes(quizzes.filter(q => q.id !== quizToDelete.id));
       showAlert("Quiz deleted successfully", "success");
     } catch (err) {
       showAlert("Failed to delete quiz", "error");
     } finally {
       setShowDeleteConfirm(false);
       setQuizToDelete(null);
     }
   };
 
 
 
   /* ================= UI ================= */

  return (
    <div className="manage-container">

      <h2>Manage Quizzes</h2>


      {/* LOADING */}
      {loading && (
        <p className="empty-text">
          Loading quizzes...
        </p>
      )}


      {/* EMPTY */}
      {!loading && quizzes.length === 0 && (
        <p className="empty-text">
          No quizzes created yet.
        </p>
      )}


      {/* GRID */}
      {!loading && quizzes.length > 0 && (

        <div className="manage-grid">

          {quizzes.map((q) => (

            <div key={q.id} className="manage-card">

              <h3>{q.title}</h3>

              <p>
                Code: <b>{q.quiz_code}</b>
              </p>

              <div className="card-actions">
                <button
                  className="edit-btn"
                  onClick={() =>
                    navigate(
                      `/organizer/add-questions/${q.id}`
                    )
                  }
                >
                  Edit Questions
                </button>
 
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteClick(q)}
                >
                  Delete
                </button>
              </div>

            </div>
          ))}

        </div>
      )}

      {/* ================= DELETE CONFIRMATION ================= */}
      {showDeleteConfirm && createPortal(
         <div className="confirm-overlay">
           <div className="confirm-box">
             
             <h3 style={{ color: "#ef4444" }}>Delete Quiz?</h3>
             
             <p className="text-center" style={{ color: "#64748b", margin: "10px 0 20px", wordBreak: "break-word" }}>
               Are you sure you want to delete <b>{quizToDelete?.title}</b>?<br/>
               This action cannot be undone and will remove all questions and results.
             </p>
 
             <div className="confirm-actions">
               <button 
                 className="modal-cancel" 
                 onClick={() => setShowDeleteConfirm(false)}
               >
                 Keep Quiz
               </button>
               <button 
                 className="modal-confirm" 
                 style={{ background: "#ef4444", color: "white" }}
                 onClick={confirmDelete}
               >
                 Delete Forever
               </button>
             </div>
 
           </div>
         </div>,
         document.body
       )}
 
     </div>
  );
}
