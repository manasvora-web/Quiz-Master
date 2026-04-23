import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import { useAlert } from "../context/AlertContext";

import "../styles/login.css";

export default function OrganizerLogin() {

  const { login } = useAuth();
  const { showAlert } = useAlert();

  const navigate = useNavigate();


  /* ================= STATE ================= */

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /* ================= CONFIRMATION POPUP ================= */
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmedUser, setConfirmedUser] = useState("");


  /* ================= CHANGE ================= */

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value
    }));

    setErrors(prev => ({
      ...prev,
      [name]: false
    }));
  };


  /* ================= VALIDATION ================= */

  const validate = () => {

    let temp = {};
    let ok = true;

    if (!form.email.trim()) {
      temp.email = true;
      ok = false;
    }

    if (!form.password.trim()) {
      temp.password = true;
      ok = false;
    }

    setErrors(temp);
    return ok;
  };


  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!validate()) {
      showAlert("Please enter email and password", "warning");
      return;
    }

    setLoading(true);

    try {

      const res = await api.post("/auth/organizer/login", {
        email: form.email.trim(),
        password: form.password
      });

      /* SAVE TOKEN */
      login(res.data.token);

      /* SHOW CONFIRMATION POPUP */
      setConfirmedUser(form.email.trim());
      setShowConfirm(true);

    } catch (err) {

      const msg =
        err.response?.data?.message ||
        "Invalid email or password";

      showAlert(msg, "error");

    } finally {
      setLoading(false);
    }
  };


  /* ================= GO TO DASHBOARD ================= */

  const goToDashboard = () => {
    setShowConfirm(false);
    navigate("/organizer/dashboard");
  };

  const goBackToLogin = () => {
    setShowConfirm(false);
  };


  /* ================= UI ================= */

  return (
    <div className="login-wrapper">

      <div className="login-card">

        <h2 className="login-title">
          Organizer Login
        </h2>

        <p className="login-sub">
          Manage quizzes and student results
        </p>

        <form onSubmit={handleSubmit} noValidate>

          {/* EMAIL */}
          <div className="login-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="admin@quiz.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              className={errors.email ? "input-error" : ""}
            />
          </div>

          {/* PASSWORD */}
          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              className={errors.password ? "input-error" : ""}
            />
          </div>

          {/* BUTTON */}
          <button
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>


      {/* ================= CONFIRMATION POPUP ================= */}
      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-box">

            <div className="confirm-icon">✅</div>

            <h3>Login Successful!</h3>

            <p>
              Welcome back!<br />
              <b>{confirmedUser}</b>
            </p>

            <div className="confirm-actions">

              <button
                className="cancel-btn"
                onClick={goBackToLogin}
              >
                ← Back
              </button>

              <button
                className="yes-btn"
                onClick={goToDashboard}
              >
                Go to Dashboard →
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}