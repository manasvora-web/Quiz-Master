import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhoneAlt, FaLock, FaPlay } from "react-icons/fa";

import api from "../api/axios";
import { useAlert } from "../context/AlertContext";

import "../styles/join.css";

export default function JoinQuiz() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [form, setForm] = useState({
    quiz_code: "",
    full_name: "",
    mobile: "",
    email: ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: false }));
  };

  const validate = () => {
    let temp = {};
    let ok = true;

    if (!form.quiz_code.trim()) { temp.quiz_code = true; ok = false; }
    if (!form.full_name.trim()) { temp.full_name = true; ok = false; }
    if (!/^[0-9]{10}$/.test(form.mobile)) { temp.mobile = true; ok = false; }
    if (!form.email.includes("@")) { temp.email = true; ok = false; }

    setErrors(temp);
    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showAlert("Please check the highlighted fields", "warning");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const res = await api.post("/student/join", {
        ...form,
        quiz_code: form.quiz_code.trim().toUpperCase()
      });

      const attemptId = res.data?.attempt_id;
      if (!attemptId) {
        showAlert("Failed to start quiz. Please try again.", "error");
        setLoading(false);
        return;
      }

      showAlert("Access granted! Starting quiz...", "success", 1500);
      localStorage.setItem("quiz_attempt", attemptId);

      setTimeout(() => {
        navigate(`/quiz/${attemptId}`, { replace: true });
      }, 1000);

    } catch (err) {
      const message = err.response?.data?.message || "Invalid quiz code or registration error";
      showAlert(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-wrapper">
      <div className="join-card">
        <h2 className="join-title">Join a Quiz</h2>
        <p className="join-subtitle">
          Enter your details and the unique quiz code to begin your examination.
        </p>

        <form className="join-form" onSubmit={handleSubmit} noValidate>
          <div className="join-field">
            <label><FaLock style={{marginRight: '6px'}}/> Quiz Access Code</label>
            <input
              name="quiz_code"
              placeholder="e.g. AB12CD"
              value={form.quiz_code}
              onChange={handleChange}
              className={errors.quiz_code ? "input-error" : ""}
              autoComplete="off"
            />
          </div>

          <div className="join-field">
            <label><FaUser style={{marginRight: '6px'}}/> Full Name</label>
            <input
              name="full_name"
              placeholder="Enter your legal name"
              value={form.full_name}
              onChange={handleChange}
              className={errors.full_name ? "input-error" : ""}
            />
          </div>

          <div className="join-field">
            <label><FaPhoneAlt style={{marginRight: '6px'}}/> Mobile Number</label>
            <input
              name="mobile"
              placeholder="10-digit number"
              value={form.mobile}
              onChange={handleChange}
              className={errors.mobile ? "input-error" : ""}
            />
          </div>

          <div className="join-field">
            <label><FaEnvelope style={{marginRight: '6px'}}/> Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
            />
          </div>

          <button className="join-btn" disabled={loading}>
            {loading ? "Verifying..." : <><FaPlay /> Start Examination</>}
          </button>
        </form>

        <p className="join-footer">
          By starting, you agree to the examination terms and anti-cheat policies.
        </p>
      </div>
    </div>
  );
}