import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useAlert } from "../context/AlertContext";

import "../styles/createQuiz.css";

export default function CreateQuiz() {

  const navigate = useNavigate();
  const { showAlert } = useAlert();


  /* ================= STATE ================= */

  const [form, setForm] = useState({
    title: "",
    description: "",
    time_limit: "",
    show_result: true,
    custom_code: ""
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});



  /* ================= CHANGE ================= */

  const handleChange = (e) => {

    let { name, value, type, checked } = e.target;


    /* FORCE UPPERCASE FOR CODE */
    if (name === "custom_code") {

      value = value
        .toUpperCase()
        .replace(/\s/g, ""); // remove spaces
    }


    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox"
        ? checked
        : value
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


    /* TITLE */
    if (!form.title.trim()) {
      temp.title = true;
      ok = false;
    }


    /* TIME */
    if (!form.time_limit || Number(form.time_limit) <= 0) {
      temp.time_limit = true;
      ok = false;
    }


    /* CUSTOM CODE (4–10 chars) */
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



  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (loading) return;


    if (!validate()) {

      showAlert(
        "Please fill all required fields correctly",
        "warning",
        2000
      );

      return;
    }


    setLoading(true);


    const cleanCode = form.custom_code
      .trim()
      .toUpperCase();


    try {

      const res = await api.post("/quiz/create", {

        title: form.title.trim(),

        description: form.description.trim(),

        time_limit: Number(form.time_limit),

        show_result: form.show_result,

        custom_code: cleanCode || null
      });


      const quizCode = res.data.quiz.quiz_code;
      const quizId = res.data.quiz.id;


      showAlert(
        `Quiz created! Code: ${quizCode}`,
        "success",
        2500
      );


      setTimeout(() => {

        navigate(`/organizer/add-questions/${quizId}`);

      }, 2000);


    } catch (err) {

      const message =
        err.response?.data?.message ||
        "Failed to create quiz";

      showAlert(message, "error");


    } finally {

      setLoading(false);
    }
  };



  /* ================= UI ================= */

  return (
    <div className="create-wrapper">

      <div className="create-card">

        <h2 className="create-title">
          Create New Quiz
        </h2>

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
              placeholder="e.g. 30"
              value={form.time_limit}
              onChange={handleChange}
              className={errors.time_limit ? "input-error" : ""}
            />

          </div>



          {/* CUSTOM CODE */}
          <div className="create-field">

            <label>Personal Quiz Code (Optional)</label>

            <input
              name="custom_code"
              placeholder="4–10 letters/numbers (Ex: JAVA24)"
              value={form.custom_code}
              onChange={handleChange}
              maxLength={10}
              className={errors.custom_code ? "input-error" : ""}
            />

            <small>
              Only A–Z and 0–9 • Length: 4 to 10 characters
            </small>

          </div>



          {/* RESULT SWITCH */}
          <div className="create-field result-toggle">

            <label>

              <input
                type="checkbox"
                name="show_result"
                checked={form.show_result}
                onChange={handleChange}
              />

              Show Result After Submit

            </label>


            <small>

              {form.show_result
                ? "Students will see result after quiz ✅"
                : "Students will see Good Luck only ⚠️"}

            </small>

          </div>



          {/* BUTTON */}
          <button
            className="create-btn"
            disabled={loading}
          >

            {loading ? "Creating..." : "Create Quiz"}

          </button>


        </form>

      </div>

    </div>
  );
}