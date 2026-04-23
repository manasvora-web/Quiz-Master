import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAlert } from "../context/AlertContext";

import "../styles/createQuiz.css";

/* ================= AUTO CODE GENERATOR ================= */
const generateCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default function CreateQuiz() {

  const navigate = useNavigate();
  const { showAlert } = useAlert();


  /* ================= STATE ================= */

  const [form, setForm] = useState({
    title: "",
    description: "",
    time_limit: "",
    show_result: true,
    custom_code: generateCode() // ← auto filled on load
  });

  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  /* ================= CONFIRM POPUP ================= */
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState(null);


  /* ================= CHANGE ================= */

  const handleChange = (e) => {

    let { name, value, type, checked } = e.target;

    /* FORCE UPPERCASE FOR CODE */
    if (name === "custom_code") {
      value = value.toUpperCase().replace(/\s/g, "");
    }

    /* TIME LIMIT — no negative */
    if (name === "time_limit") {
      if (Number(value) < 0) value = "";
    }

    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    setErrors(prev => ({ ...prev, [name]: false }));
  };


  /* ================= REGENERATE CODE ================= */

  const regenerateCode = () => {
    setForm(prev => ({ ...prev, custom_code: generateCode() }));
  };


  /* ================= VALIDATION ================= */

  const validate = () => {

    let temp = {};
    let ok = true;

    /* TITLE */
    if (!form.title.trim()) {
      temp.title = true;
      ok = false;
    }

    /* TIME — must be >= 2 */
    const time = Number(form.time_limit);

    if (!form.time_limit || time < 2) {
      temp.time_limit = true;
      ok = false;
      showAlert("Time must be at least 2 minutes", "warning", 2000);
    }

    /* CUSTOM CODE (4–10 chars, A-Z 0-9 only) */
    if (form.custom_code) {
      const code = form.custom_code.trim();
      const pattern = /^[A-Z0-9]{4,10}$/;
      if (!pattern.test(code)) {
        temp.custom_code = true;
        ok = false;
        showAlert(
          "Quiz code must be 4–10 characters (A-Z, 0-9 only)",
          "warning",
          2000
        );
      }
    }

    setErrors(temp);
    return ok;
  };


  /* ================= SUBMIT — show confirm first ================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (loading) return;

    if (!validate()) {
      showAlert("Please fill all required fields correctly", "warning", 2000);
      return;
    }

    const cleanCode = form.custom_code.trim().toUpperCase();

    /* Save data and show confirmation popup */
    setPendingData({
      title:       form.title.trim(),
      description: form.description.trim(),
      time_limit:  Number(form.time_limit),
      show_result: form.show_result,
      custom_code: cleanCode || null
    });

    setShowConfirm(true);
  };


  /* ================= CONFIRM CREATE ================= */

  const confirmCreate = async () => {

    setShowConfirm(false);
    setLoading(true);

    try {

      const res = await api.post("/quiz/create", pendingData);

      const quizCode = res.data.quiz.quiz_code;
      const quizId   = res.data.quiz.id;

      showAlert(`Quiz created! Code: ${quizCode}`, "success", 2500);

      setTimeout(() => {
        navigate(`/organizer/add-questions/${quizId}`);
      }, 2000);

    } catch (err) {

      const message = err.response?.data?.message || "Failed to create quiz";
      showAlert(message, "error");

    } finally {
      setLoading(false);
    }
  };


  /* ================= UI ================= */

  return (
    <div className="create-wrapper">

      <div className="create-card">

        <h2 className="create-title">Create New Quiz</h2>

        <p className="create-sub">
          Fill the details to create a secure quiz
        </p>

        <form onSubmit={handleSubmit} noValidate>

          {/* TITLE */}
          <div className="create-field">
            <label>Quiz Title</label>
            <input
              name="title"
              placeholder="e.g. Java Basics Test"
              value={form.title}
              onChange={handleChange}
              className={errors.title ? "input-error" : ""}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="create-field">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Short description..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          {/* TIME */}
          <div className="create-field">
            <label>Time (Minutes)</label>
            <input
              type="number"
              name="time_limit"
              placeholder="Min 2 minutes"
              min="2"
              value={form.time_limit}
              onChange={handleChange}
              className={errors.time_limit ? "input-error" : ""}
            />
            <small>Minimum 2 minutes required</small>
          </div>

          {/* CUSTOM CODE — auto filled + regenerate button */}
          <div className="create-field">
            <label>Personal Quiz Code</label>
            <div className="code-input-row">
              <input
                name="custom_code"
                placeholder="4–10 letters/numbers"
                value={form.custom_code}
                onChange={handleChange}
                maxLength={10}
                className={errors.custom_code ? "input-error" : ""}
              />
              <button
                type="button"
                className="regen-btn"
                onClick={regenerateCode}
                title="Generate new code"
              >
                🔄
              </button>
            </div>
            <small>Only A–Z and 0–9 • Length: 4 to 10 characters</small>
          </div>

          {/* RESULT SWITCH */}
          <div className="create-field result-toggle">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="show_result"
                checked={form.show_result}
                onChange={handleChange}
              />
              <span>Show Result After Submit</span>
            </label>
            <small>
              {form.show_result
                ? "Students will see result after quiz ✅"
                : "Students will see Good Luck only ⚠️"}
            </small>
          </div>

          {/* BUTTON */}
          <button className="create-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Quiz"}
          </button>

        </form>

      </div>


      {/* ================= CONFIRMATION POPUP ================= */}
      {showConfirm && pendingData && (
        <div className="confirm-overlay">
          <div className="confirm-box">

            <h3>Confirm Quiz Creation</h3>

            <div className="confirm-details">
              <p><b>Title:</b> {pendingData.title}</p>
              <p><b>Time:</b> {pendingData.time_limit} minutes</p>
              <p><b>Code:</b> {pendingData.custom_code}</p>
              <p><b>Show Result:</b> {pendingData.show_result ? "Yes ✅" : "No ⚠️"}</p>
            </div>

            <p className="confirm-note">
              Are you sure you want to create this quiz?
            </p>

            <div className="confirm-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowConfirm(false)}
              >
                ← Cancel
              </button>
              <button
                className="yes-btn"
                onClick={confirmCreate}
              >
                ✅ Yes, Create
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}