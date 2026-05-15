import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import api from "../api/axios";
import Button from "../components/Button";
import { useAlert } from "../context/AlertContext";

/* ICONS */
import {
  FaCopy,
  FaEdit,
  FaTrash,
  FaList,
  FaPlus,
  FaSave,
  FaImage,
  FaExclamationTriangle
} from "react-icons/fa";

import "../styles/AddQuestions.css";

/* ================= BASE URL FOR IMAGES ================= */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function AddQuestions() {

  const { quizId } = useParams();
  const navigate = useNavigate();

  const { showAlert } = useAlert();


  /* ================= QUIZ INFO ================= */

  const [quizCode, setQuizCode] = useState(null);
  const [quizTitle, setQuizTitle] = useState("");

  const [isTrueFalse, setIsTrueFalse] = useState(false);
  const [editId, setEditId] = useState(null);


  /* ================= FORM ================= */

  const [form, setForm] = useState({
    question_text: "",
    options: ["", ""],
    correct_option: 1,
    marks: 1,
    negative_on: false,
    negative_marks: "0"
  });

  /* ================= IMAGE STATE ================= */
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);



  /* ================= FETCH QUIZ INFO ================= */

  const fetchQuizInfo = useCallback(async () => {

    try {

      const res = await api.get(`/quiz/details/${quizId}`);

      if (res.data) {
        setQuizCode(res.data.quiz_code || "");
        setQuizTitle(res.data.title || "");
      }

    } catch {

      showAlert("Quiz info not found", "error");
    }

  }, [quizId, showAlert]);



  /* ================= FETCH QUESTIONS ================= */

  const fetchQuestions = useCallback(async () => {

    try {

      const res = await api.get(`/question/${quizId}`);

      setQuestions(res.data || []);

    } catch {

      showAlert("No questions yet", "info");
    }

  }, [quizId, showAlert]);



  useEffect(() => {

    fetchQuizInfo();
    fetchQuestions();

  }, [fetchQuizInfo, fetchQuestions]);



  /* ================= RESET ================= */

  const resetForm = () => {

    setForm({
      question_text: "",
      options: ["", ""],
      correct_option: 1,
      marks: 1,
      negative_on: false,
      negative_marks: "0"
    });

    setErrors({});
    setIsTrueFalse(false);
    setEditId(null);

    /* reset image */
    setImageFile(null);
    setImagePreview(null);
    setExistingImage(null);
  };



  /* ================= HANDLERS ================= */

  const handleQuestionChange = (e) => {

    setForm(prev => ({
      ...prev,
      question_text: e.target.value
    }));

    setErrors(prev => ({ ...prev, question_text: false }));
  };



  const handleOptionChange = (i, val) => {

    setForm(prev => {

      const updated = [...prev.options];
      updated[i] = val;

      return {
        ...prev,
        options: updated
      };
    });

    setErrors(prev => ({
      ...prev,
      [`opt${i}`]: false
    }));
  };



  /* ================= IMAGE HANDLER ================= */

  const handleImageChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    /* validate type */
    const allowed = ["image/jpeg", "image/png"];

    if (!allowed.includes(file.type)) {
      showAlert("Only JPG, PNG");
      return;
    }

    /* validate size — max 2MB */
    if (file.size > 6 * 1024 * 1024) {
      showAlert("Image must be under 6MB", "warning");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setExistingImage(null);
  };



  const handleRemoveImage = (e) => {
    if (e) e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    setExistingImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };



  /* OPTION COUNT */

  const handleOptionCount = (count) => {

    if (count < 2 || count > 6) return;

    setForm(prev => {

      const arr = Array.from(
        { length: count },
        (_, i) => prev.options[i] || ""
      );

      return {
        ...prev,
        options: arr,
        correct_option: 1
      };
    });
  };



  /* TRUE / FALSE */

  const enableTrueFalse = () => {

    setIsTrueFalse(true);

    setForm(prev => ({
      ...prev,
      options: ["True", "False"],
      correct_option: 1
    }));

    setErrors({});
  };



  /* MCQ */

  const enableMCQ = () => {

    setIsTrueFalse(false);
    
    setForm(prev => ({
      ...prev,
      options: ["", ""],
      correct_option: 1
    }));

    setErrors({});
  };



  /* ================= VALIDATION ================= */

  const validate = () => {

    let temp = {};
    let ok = true;


    if (!form.question_text.trim()) {
      temp.question_text = true;
      ok = false;
    }


    form.options.forEach((o, i) => {

      if (!o.trim()) {
        temp[`opt${i}`] = true;
        ok = false;
      }
    });


    if (!form.marks || Number(form.marks) <= 0) {
      temp.marks = true;
      ok = false;
    }


    setErrors(temp);

    return ok;
  };



  /* ================= SUBMIT / SAVE QUESTION ================= */

  const saveQuestion = async () => {

    if (!validate()) {
      showAlert("Please fill all required fields", "warning");
      return false;
    }

    let negativeValue = 0;

    if (form.negative_on) {
      if (form.negative_marks === "same") {
        negativeValue = Number(form.marks);
      } else {
        negativeValue = parseFloat(form.negative_marks) || 0;
      }
    }

    /* ================= BUILD FORM DATA (supports image) ================= */

    const formData = new FormData();

    formData.append("quiz_id", Number(quizId));
    formData.append("question_text", form.question_text.trim());
    formData.append("correct_option", Number(form.correct_option));
    formData.append("marks", Number(form.marks));
    formData.append("negative_on", form.negative_on);
    formData.append("negative_marks", negativeValue);

    form.options.forEach((opt, i) => {
      formData.append(`option${i + 1}`, opt);
    });

    if (imageFile) {
      formData.append("question_image", imageFile);
    }

    try {
      if (editId) {
        await api.put(`/question/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        showAlert("Question updated", "success");
      } else {
        await api.post("/question/add", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        showAlert("Question added", "success");
      }

      fetchQuestions();
      resetForm();
      return true;

    } catch {
      showAlert("Server error", "error");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveQuestion();
  };

  const handleCompleteQuiz = async () => {
    if (form.question_text.trim()) {
      const confirmSave = window.confirm("You have an unsaved question. Do you want to save it before submitting the quiz?");
      if (confirmSave) {
        const success = await saveQuestion();
        if (!success) return; // Stop if validation failed
      }
    }
    navigate("/organizer/dashboard");
  };



  /* ================= DELETE ================= */

  const handleDelete = async (id) => {

    if (!window.confirm("Delete this question?")) return;

    try {

      await api.delete(`/question/${id}`);

      fetchQuestions();
      showAlert("Deleted", "success");

    } catch {

      showAlert("Delete failed", "error");
    }
  };



  /* ================= EDIT ================= */

  const handleEdit = (q) => {

    const opts = [
      q.option1,
      q.option2,
      q.option3,
      q.option4,
      q.option5,
      q.option6
    ].filter(o => o);


    setForm({

      question_text: q.question_text,
      options: opts,
      correct_option: q.correct_option,
      marks: q.marks,
      negative_on: q.negative_on,
      negative_marks: String(q.negative_marks || "0")
    });


    setEditId(q.id);
    setIsTrueFalse(opts.length === 2);

    /* load existing image if any */
    setImageFile(null);
    setImagePreview(null);
    setExistingImage(q.question_image || null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };



  /* ================= COPY CODE ================= */

  const copyCode = async () => {

    if (!quizCode) {
      showAlert("Quiz code not loaded yet", "warning");
      return;
    }

    try {

      await navigator.clipboard.writeText(quizCode);

      showAlert("Quiz code copied!", "success", 1500);

    } catch {

      showAlert("Copy failed", "error");
    }
  };



  /* ================= UI ================= */

  return (
    <div className="addq-container">


      {/* QUIZ BAR */}
      <div className="quiz-info-bar">

        <div className="quiz-title-text" title={quizTitle || "Loading..."}>
          <b>Quiz:</b> {quizTitle || "Loading..."}
        </div>

        <div className="quiz-code-box">

          <div className="quiz-code-text">
            <b>Code:</b>{" "}
            {quizCode ? quizCode : "Loading..."}
          </div>

          <button
            onClick={copyCode}
            disabled={!quizCode}
          >
            <FaCopy /> Copy
          </button>

        </div>

      </div>



      {/* LEFT */}
      <div className="addq-card">

        <h2>
          <FaPlus /> Add Question
        </h2>


        {/* MODE */}
        <div className="type-switch">

          <button
            type="button"
            className={!isTrueFalse ? "active" : ""}
            onClick={enableMCQ}
          >
            MCQ
          </button>

          <button
            type="button"
            className={isTrueFalse ? "active" : ""}
            onClick={enableTrueFalse}
          >
            True/False
          </button>

        </div>



        <form
          onSubmit={handleSubmit}
          className="addq-form"
          noValidate
        >


          {/* QUESTION */}
          <label>Question</label>

          <input
            className={errors.question_text ? "input-error" : ""}
            value={form.question_text}
            onChange={handleQuestionChange}
          />


          {/* ================= IMAGE UPLOAD ================= */}
          <label>
            <FaImage /> Question Image{" "}
            <span style={{ fontWeight: 400, fontSize: "0.85rem", color: "var(--subtext)" }}>
              (optional — JPG/PNG)
            </span>
          </label>

          <div 
            className={`image-upload-area ${imagePreview || existingImage ? 'has-image' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />

            {!imagePreview && !existingImage ? (
              <div className="upload-placeholder">
                <FaImage className="upload-icon" />
                <span>Click to upload image</span>
              </div>
            ) : (
              <div className="preview-container">
                <img 
                  src={imagePreview || `${BASE_URL}${existingImage}`} 
                  alt="Question" 
                />
                <button
                  type="button"
                  className="remove-image-overlay"
                  onClick={handleRemoveImage}
                  title="Remove Image"
                >
                  ✕
                </button>
              </div>
            )}
          </div>


          {/* OPTION COUNT */}
          {!isTrueFalse && (

            <div className="option-count">

              <label>Total Options</label>

              <select
                value={form.options.length}
                onChange={(e) =>
                  handleOptionCount(Number(e.target.value))
                }
              >

                {[2,3,4,5,6].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}

              </select>

            </div>
          )}



          {/* OPTIONS */}
          {form.options.map((opt, i) => (

            <div key={i} className="option-row">

              <label>{String.fromCharCode(65 + i)}</label>

              <input
                className={errors[`opt${i}`] ? "input-error" : ""}
                value={opt}
                onChange={(e) =>
                  handleOptionChange(i, e.target.value)
                }
              />

            </div>
          ))}



          {/* CORRECT */}
          <label>Correct Answer</label>

          <select
            value={form.correct_option}
            onChange={(e) =>
              setForm(prev => ({
                ...prev,
                correct_option: Number(e.target.value)
              }))
            }
          >

            {form.options.map((_, i) => (

              <option key={i} value={i + 1}>
                {String.fromCharCode(65 + i)}
              </option>

            ))}

          </select>



          {/* MARKS */}
          <label>Question Marks</label>

          <input
            type="number"
            min="1"
            className={errors.marks ? "input-error" : ""}
            value={form.marks}
            onChange={(e) =>
              setForm(prev => ({
                ...prev,
                marks: e.target.value
              }))
            }
          />



          {/* ================= EVALUATION SECTION ================= */}
          <div className="evaluation-section">
            <div className="section-header">
              <FaExclamationTriangle className="warn-icon" />
              <span>Scoring Rules</span>
            </div>

            <div className={`neg-config-box ${form.negative_on ? 'active' : ''}`}>
              <div className="neg-toggle-row">
                <div className="neg-text">
                  <strong>Negative Marking</strong>
                  <p>Deduct marks for incorrect answers</p>
                </div>
                <label className="pro-switch">
                  <input
                    type="checkbox"
                    checked={form.negative_on}
                    onChange={(e) =>
                      setForm(prev => ({
                        ...prev,
                        negative_on: e.target.checked
                      }))
                    }
                  />
                  <span className="pro-slider"></span>
                </label>
              </div>

              {form.negative_on && (
                <div className="neg-penalty-selection">
                  <div className="penalty-input">
                    <label>Penalty Amount</label>
                    <select
                      value={form.negative_marks}
                      onChange={(e) =>
                        setForm(prev => ({
                          ...prev,
                          negative_marks: e.target.value
                        }))
                      }
                    >
                      <option value="0">0 (No Penalty)</option>
                      <option value="0.25">0.25 Marks</option>
                      <option value="0.5">0.5 Marks</option>
                      <option value="1">1.0 Mark</option>
                      <option value="same">= Full Marks (100% Penalty)</option>
                    </select>
                  </div>
                  <div className="penalty-info">
                    Students will lose <b>{form.negative_marks === 'same' ? form.marks : form.negative_marks}</b> marks if they select a wrong option.
                  </div>
                </div>
              )}
            </div>
          </div>



          {/* SUBMIT */}
          <Button className="addq-btn">

            {editId
              ? <><FaSave /> Update</>
              : <><FaPlus /> Add</>
            }

          </Button>

        </form>

      </div>



      {/* RIGHT */}
      <div className="addq-card">

        <h2>
          <FaList /> Preview
        </h2>


        {questions.length === 0 && (
          <p className="addq-empty">No questions yet</p>
        )}



        {questions.map((q, i) => (

          <div key={q.id} className="addq-preview">

            <div className="addq-q">
              Q{i + 1}. {q.question_text}
            </div>

            {/* PREVIEW IMAGE */}
            {q.question_image && (
              <div className="preview-image-box">
                <img
                  src={`${BASE_URL}${q.question_image}`}
                  alt={`Q${i + 1}`}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}

            <ul>

              {[1,2,3,4,5,6].map(n =>

                q[`option${n}`] && (

                  <li
                    key={n}
                    className={
                      q.correct_option === n
                        ? "correct"
                        : ""
                    }
                  >
                    {String.fromCharCode(64 + n)}.{" "}
                    {q[`option${n}`]}
                  </li>
                )
              )}

            </ul>


            {/* MARK INFO */}
            <p className="mark-info">

              Marks: <b>{Number(q.marks)}</b>
              {" | "}
              Negative: <b>
                {q.negative_on ? Number(q.negative_marks) : 0}
              </b>

            </p>



            <div className="preview-actions">

              <button onClick={() => handleEdit(q)}>
                <FaEdit /> Edit
              </button>

              <button onClick={() => handleDelete(q.id)}>
                <FaTrash /> Delete
              </button>

            </div>

          </div>
        ))}



        {(questions.length > 0 || form.question_text.trim()) && (

          <Button
            onClick={handleCompleteQuiz}
            className="addq-submit"
          >
            <FaSave /> Submit Quiz
          </Button>

        )}

      </div>

    </div>
  );
}