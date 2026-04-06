import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAlert } from "../context/AlertContext";

import "../styles/join.css";

export default function JoinQuiz() {

  const navigate = useNavigate();
  const { showAlert } = useAlert();


  /* ================= STATE ================= */

  const [form, setForm] = useState({
    quiz_code: "",
    full_name: "",
    mobile: "",
    email: ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});



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


    if (!form.quiz_code.trim()) {
      temp.quiz_code = true;
      ok = false;
    }

    if (!form.full_name.trim()) {
      temp.full_name = true;
      ok = false;
    }

    if (!/^[0-9]{10}$/.test(form.mobile)) {
      temp.mobile = true;
      ok = false;
    }

    if (!form.email.includes("@")) {
      temp.email = true;
      ok = false;
    }


    setErrors(temp);

    return ok;
  };



  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {

    e.preventDefault();


    if (!validate()) {

      showAlert("Please fill all fields correctly", "warning");
      return;
    }


    if (loading) return; // prevent double click


    setLoading(true);

    try {

      const res = await api.post("/student/join", {

        ...form,

        quiz_code: form.quiz_code
          .trim()
          .toUpperCase()
      });


      /* ================= SAFETY CHECK ================= */

      const attemptId = res.data?.attempt_id;


      if (!attemptId) {

        showAlert(
          "Failed to start quiz. Try again.",
          "error"
        );

        setLoading(false);
        return;
      }


      /* ================= SUCCESS ================= */

      showAlert(
        "Quiz started successfully!",
        "success",
        1000
      );


      // Clear old data
      localStorage.removeItem("quiz_attempt");
      localStorage.setItem("quiz_attempt", attemptId);


      /* ================= REDIRECT ================= */

      navigate(`/quiz/${attemptId}`, {
        replace: true
      });


    } catch (err) {

      const message =
        err.response?.data?.message ||
        "Failed to join quiz";

      showAlert(message, "error");


    } finally {

      setLoading(false);
    }
  };



  /* ================= UI ================= */

  return (
    <div className="join-wrapper">

      <div className="join-card">

        <h2 className="join-title">
          Join Quiz
        </h2>

        <p className="join-subtitle">
          Enter the quiz code provided by your organizer
        </p>



        <form
          onSubmit={handleSubmit}
          noValidate
        >


          {/* QUIZ CODE */}
          <div className="join-field">

            <label>Quiz Code</label>

            <input
              name="quiz_code"
              placeholder="e.g. AB12CD"
              value={form.quiz_code}
              onChange={handleChange}
              className={errors.quiz_code ? "input-error" : ""}
            />

          </div>



          {/* FULL NAME */}
          <div className="join-field">

            <label>Full Name</label>

            <input
              name="full_name"
              placeholder="Your full name"
              value={form.full_name}
              onChange={handleChange}
              className={errors.full_name ? "input-error" : ""}
            />

          </div>



          {/* MOBILE */}
          <div className="join-field">

            <label>Mobile Number</label>

            <input
              name="mobile"
              placeholder="10-digit number"
              value={form.mobile}
              onChange={handleChange}
              className={errors.mobile ? "input-error" : ""}
            />

          </div>



          {/* EMAIL */}
          <div className="join-field">

            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
            />

          </div>



          {/* BUTTON */}
          <button
            className="join-btn"
            disabled={loading}
          >

            {loading ? "Starting..." : "Start Quiz"}

          </button>


        </form>



        <p className="join-footer">
          Make sure your details are correct before starting
        </p>

      </div>

    </div>
  );
}