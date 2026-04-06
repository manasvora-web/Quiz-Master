import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAlert } from "../context/AlertContext";

import "../styles/manage.css";

export default function ManageQuizzes() {

  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);



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

              <button
                onClick={() =>
                  navigate(
                    `/organizer/add-questions/${q.id}`
                  )
                }
              >
                Edit Questions
              </button>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}
