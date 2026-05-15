import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaSearch, 
  FaClock, 
  FaHashtag,
  FaShieldAlt
} from "react-icons/fa";

import api from "../api/axios";
import { useAlert } from "../context/AlertContext";

import "../styles/manage.css";

export default function ManageQuizzes() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  /* ================= LOAD QUIZZES ================= */
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const res = await api.get("/quiz/my-quizzes");
        setQuizzes(res.data);
        setFilteredQuizzes(res.data);
      } catch (err) {
        showAlert(err.response?.data?.message || "Failed to load quizzes", "error");
      } finally {
        setLoading(false);
      }
    };
    loadQuizzes();
  }, [showAlert]);

  /* ================= SEARCH ================= */
  useEffect(() => {
    const results = quizzes.filter(q => 
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.quiz_code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredQuizzes(results);
  }, [searchTerm, quizzes]);

  const handleDeleteClick = (quiz) => {
    setQuizToDelete(quiz);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;
    try {
      // Ensure we use the correct ID field from backend (MySQL 'id')
      await api.delete(`/quiz/${quizToDelete.id}`);
      setQuizzes(prev => prev.filter(q => q.id !== quizToDelete.id));
      showAlert("Quiz deleted successfully", "success");
    } catch (err) {
      console.error("Delete error:", err);
      showAlert("Failed to delete quiz", "error");
    } finally {
      setShowDeleteConfirm(false);
      setQuizToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="dash-loader">
        <div className="spinner"></div>
        <p>Loading management interface...</p>
      </div>
    );
  }

  return (
    <div className="manage-pro-container">
      
      {/* HEADER SECTION */}
      <header className="manage-pro-header">
        <div className="header-left">
          <div className="title-stack">
            <h1>Manage Quizzes</h1>
            <p>View, edit, and manage your created assessments</p>
          </div>
          <div className="count-pill">{quizzes.length} Total</div>
        </div>

        <div className="header-right">
          <div className="search-bar-pro">
            <FaSearch />
            <input 
              type="text" 
              placeholder="Search by title or code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-create-pro" onClick={() => navigate("/organizer/create")}>
            <FaPlus /> <span>New Quiz</span>
          </button>
        </div>
      </header>

      {/* TABLE SECTION */}
      <div className="manage-table-wrapper">
        <table className="manage-table">
          <thead>
            <tr>
              <th className="th-title">Quiz Details</th>
              <th>Quiz Code</th>
              <th>Time Limit</th>
              <th>Status</th>
              <th className="th-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuizzes.length === 0 ? (
              <tr>
                <td colSpan="5" className="td-empty">
                  <div className="empty-state">
                    <FaHashtag />
                    <p>{searchTerm ? "No results found" : "No quizzes created yet"}</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredQuizzes.map((q) => (
                <tr key={q.id}>
                  <td className="td-title">
                    <div className="quiz-title-cell">
                      <div className="status-dot active"></div>
                      <div className="title-info">
                        <span className="q-name" title={q.title}>{q.title}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code className="code-badge">{q.quiz_code}</code>
                  </td>
                  <td>
                    <div className="time-cell">
                      <FaClock /> {q.time_limit} mins
                    </div>
                  </td>
                  <td>
                    <span className="status-badge-pro">Active</span>
                  </td>
                  <td className="td-actions">
                    <div className="action-btns">
                      <button 
                        className="act-btn edit" 
                        onClick={() => navigate(`/organizer/add-questions/${q.id}`)}
                      >
                        <FaEdit /> <span>Edit</span>
                      </button>
                      <button 
                        className="act-btn delete" 
                        onClick={() => handleDeleteClick(q)}
                      >
                        <FaTrash /> <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DELETE DIALOG */}
      {showDeleteConfirm && createPortal(
        <div className="confirm-overlay">
          <div className="confirm-box">
            <div className="confirm-header">
              <FaShieldAlt className="warn-icon" />
              <h3>Delete Quiz?</h3>
            </div>
            <p className="confirm-p">
              Are you sure you want to delete <b>{quizToDelete?.title}</b>?<br/>
              This action is permanent and cannot be undone.
            </p>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="btn-confirm-delete" onClick={confirmDelete}>
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
