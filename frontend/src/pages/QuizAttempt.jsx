import {
  useEffect,
  useState,
  useCallback,
  useRef
} from "react";

import {
  useParams,
  useNavigate
} from "react-router-dom";

import api from "../api/axios";

import FullScreenGuard from "../components/FullScreenGuard";
import AntiCheatGuard from "../components/AntiCheatGuard";

import { useAlert } from "../context/AlertContext";

/* ICONS */
import {
  FaClock,
  FaArrowLeft,
  FaArrowRight,
  FaFlag,
  FaCheckCircle,
  FaQuestionCircle
} from "react-icons/fa";

import "../styles/QuizAttempt.css";

/* ================= BASE URL FOR IMAGES ================= */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function QuizAttempt() {

  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const submittedRef = useRef(false);
  const copyCount = useRef(0);



  /* ================= BLOCK COPY ================= */

  useEffect(() => {

    const blockKeys = (e) => {

      // CTRL+C
      if (e.ctrlKey && e.key.toLowerCase() === "c") {

        copyCount.current += 1;

        showAlert(
          `Copy not allowed (${copyCount.current}/3)`,
          "warning",
          1000
        );

        if (copyCount.current >= 3) {

          window.dispatchEvent(
            new Event("AUTO_SUBMIT_QUIZ")
          );
        }

        e.preventDefault();
      }

      // Other shortcuts
      if (
        e.ctrlKey &&
        ["v", "x", "a", "s", "p"].includes(
          e.key.toLowerCase()
        )
      ) {
        e.preventDefault();
      }

      // Dev tools
      if (e.key === "F12") {
        e.preventDefault();
      }
    };


    const blockRightClick = (e) => e.preventDefault();


    document.addEventListener("keydown", blockKeys);
    document.addEventListener("contextmenu", blockRightClick);

    document.body.style.userSelect = "none";


    return () => {

      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("contextmenu", blockRightClick);

      document.body.style.userSelect = "auto";
    };

  }, [showAlert]);



  /* ================= STATE ================= */

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const [showResult, setShowResult] = useState(true);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);



  /* ================= LOAD QUIZ ================= */

  useEffect(() => {

    let mounted = true;

    const loadQuiz = async () => {

      try {

        const res = await api.get(
          `/quiz/questions/${attemptId}`
        );

        if (!mounted) return;


        if (res.data?.questions) {

          setQuestions(res.data.questions);
          setTimeLeft(res.data.duration);
          setShowResult(res.data.show_result);

        } else if (Array.isArray(res.data)) {

          setQuestions(res.data);

        } else {

          throw new Error("Invalid response");
        }

        setLoading(false);

      } catch {

        showAlert("Quiz load failed", "error");

        navigate("/join", { replace: true });
      }
    };

    loadQuiz();


    return () => {
      mounted = false;
    };

  }, [attemptId, navigate, showAlert]);



  /* ================= EXIT FULLSCREEN ================= */

  const exitFullScreen = () => {

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };



  /* ================= REAL SUBMIT ================= */

  const doSubmit = useCallback(async (payload, cheated = false) => {

    if (submittedRef.current) return;

    submittedRef.current = true;


    try {

      const res = await api.post("/attempt/submit", {
        attempt_id: Number(attemptId),
        answers: payload
      });


      exitFullScreen();


      /* CHEAT → FAIL */
      if (cheated) {

        navigate("/result", {
          replace: true,
          state: {
            score: 0,
            total: questions.length,
            percentage: 0,
            grade: "F",
            status: "Fail",
            disqualified: true
          }
        });

        return;
      }


      /* NORMAL */
      if (showResult) {

        navigate("/result", {
          replace: true,
          state: {
            score: res.data.score,
            total: res.data.total,
            percentage: res.data.percentage,
            grade: res.data.grade,
            status: res.data.result_status
          }
        });

      } else {

        navigate("/thank-you", { replace: true });
      }

    } catch {

      submittedRef.current = false;

      showAlert("Submission failed", "error");
    }

  }, [
    attemptId,
    navigate,
    showResult,
    questions.length,
    showAlert
  ]);



  /* ================= MANUAL SUBMIT ================= */

  const submitQuiz = async () => {

    const payload = Object.entries(answers).map(
      ([qid, selected]) => ({
        question_id: Number(qid),
        selected_option: Number(selected)
      })
    );

    await doSubmit(payload, false);
  };



  /* ================= AUTO SUBMIT (CHEAT) ================= */

  useEffect(() => {

    const handleAutoSubmit = async () => {

      if (submittedRef.current) return;

      submittedRef.current = true;


      showAlert(
        "Cheating detected! Exam ended.",
        "error",
        1500
      );


      setTimeout(() => {

        navigate("/result", {
          replace: true,
          state: {
            score: 0,
            total: questions.length,
            percentage: 0,
            grade: "F",
            status: "Fail",
            disqualified: true
          }
        });

      }, 800);
    };


    window.addEventListener(
      "AUTO_SUBMIT_QUIZ",
      handleAutoSubmit
    );


    return () => {

      window.removeEventListener(
        "AUTO_SUBMIT_QUIZ",
        handleAutoSubmit
      );
    };

  }, [navigate, questions.length, showAlert]);



  /* ================= TIMER ================= */

  useEffect(() => {

    if (loading || timeLeft === null) return;


    if (timeLeft <= 0) {

      if (!submittedRef.current) {

        showAlert(
          "Time is up! Submitting...",
          "warning"
        );


        const payload = Object.entries(answers).map(
          ([qid, selected]) => ({
            question_id: Number(qid),
            selected_option: Number(selected)
          })
        );


        doSubmit(payload, false);
      }

      return;
    }


    const timer = setInterval(() => {

      setTimeLeft(prev => prev - 1);

    }, 1000);


    return () => clearInterval(timer);

  }, [timeLeft, loading, answers, doSubmit, showAlert]);



  /* ================= FORMAT TIME ================= */

  const formatTime = (sec) => {

    if (sec === null || sec < 0) return "00:00:00";

    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    return `${h.toString().padStart(2,"0")}:${m
      .toString()
      .padStart(2,"0")}:${s
      .toString()
      .padStart(2,"0")}`;
  };



  /* ================= LOADING ================= */

  if (loading) {
    return <div className="page-center">Loading...</div>;
  }

  if (!questions.length) {
    return <div className="page-center">No Questions Found</div>;
  }



  const currentQuestion = questions[currentIndex];

  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;

  const progressPercent = Math.round(
    (answeredCount / totalCount) * 100
  );



  const getStatusClass = (index) => {

    const q = questions[index];

    if (index === currentIndex) return "nav-current";
    if (marked[q.id]) return "nav-marked";
    if (answers[q.id]) return "nav-answered";

    return "nav-default";
  };



  /* ================= UI ================= */

  return (
    <>
      <FullScreenGuard />
      <AntiCheatGuard />


      {/* HEADER */}

      <div className="quiz-top-header">

        <div className="quiz-top-title">

          <h2>
            <FaQuestionCircle /> Quiz In Progress
          </h2>

          <p>Answer carefully before submitting.</p>

        </div>


        {/* TIMER */}

        <div
          className={
            timeLeft <= 30
              ? "quiz-timer danger"
              : "quiz-timer"
          }
        >
          <FaClock /> {formatTime(timeLeft)}
        </div>


        {/* PROGRESS */}

        <div className="quiz-progress-box">

          <div className="quiz-progress-text">
            {answeredCount}/{totalCount} Completed
          </div>

          <div className="quiz-progress-bar">

            <div
              className="quiz-progress-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>

          </div>

        </div>

      </div>



      {/* MAIN */}

      <div className="quiz-layout">


        {/* LEFT */}

        <div className="question-section">

          <h3>
            Question {currentIndex + 1} of {totalCount}
          </h3>


          {/* QUESTION TEXT */}
          <div className="question-text">
            {currentQuestion.question_text}
          </div>


          {/* ================= QUESTION IMAGE ================= */}
          {currentQuestion.question_image && (
            <div className="question-image-box">
              <img
                src={`${BASE_URL}${currentQuestion.question_image}`}
                alt={`Question ${currentIndex + 1}`}
                className="question-image"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}


          {/* OPTIONS */}

          <div className="options">

            {[1,2,3,4,5,6].map(i => (

              currentQuestion[`option${i}`] && (

                <label
                  key={i}
                  className="option-item"
                >

                  <input
                    type="radio"
                    name={`q-${currentQuestion.id}`}
                    checked={
                      answers[currentQuestion.id] === i
                    }
                    onChange={() =>
                      setAnswers(prev => ({
                        ...prev,
                        [currentQuestion.id]: i
                      }))
                    }
                  />

                  <span>
                    {String.fromCharCode(64 + i)}.{" "}
                    {currentQuestion[`option${i}`]}
                  </span>

                </label>

              )
            ))}

          </div>



          {/* ACTIONS */}

          <div className="action-buttons">


            <button
              className="prev-btn"
              disabled={currentIndex === 0}
              onClick={() =>
                setCurrentIndex(p => p - 1)
              }
            >
              <FaArrowLeft /> Previous
            </button>


            <button
              className="mark-btn"
              onClick={() =>
                setMarked(p => ({
                  ...p,
                  [currentQuestion.id]:
                    !p[currentQuestion.id]
                }))
              }
            >
              <FaFlag />
              {marked[currentQuestion.id]
                ? " Unmark"
                : " Mark"}
            </button>



            {currentIndex < totalCount - 1 ? (

              <button
                className="next-btn"
                onClick={() =>
                  setCurrentIndex(p => p + 1)
                }
              >
                Next <FaArrowRight />
              </button>

            ) : (

              <button
                className="submit-btn"
                disabled={submittedRef.current}
                onClick={submitQuiz}
              >
                <FaCheckCircle /> Submit
              </button>

            )}

          </div>

        </div>



        {/* RIGHT */}

        <div className="navigator-section">

          <h4>Questions</h4>

          <div className="navigator-grid">

            {questions.map((_, index) => (

              <button
                key={index}
                className={`nav-btn ${getStatusClass(index)}`}
                onClick={() =>
                  setCurrentIndex(index)
                }
              >
                {index + 1}
              </button>

            ))}

          </div>

        </div>

      </div>
    </>
  );
}