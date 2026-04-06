import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAlert } from "../context/AlertContext";

export default function QuizResult() {

  const location = useLocation();
  const navigate = useNavigate();

  const { showAlert } = useAlert();

  const data = location.state;



  /* ================= SAFETY CHECK ================= */

  useEffect(() => {

    // If user opens result page directly
    if (!data) {

      showAlert(
        "Result not found. Redirecting to home...",
        "warning",
        2000
      );

      // Force redirect after alert
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
    }

  }, [data, navigate, showAlert]);



  // Stop rendering if no data
  if (!data) return null;



  /* ================= SAFE VALUES ================= */

  const correct = Math.max(
    0,
    Number(data.score) || 0
  );

  const totalQ = Math.max(
    1,
    Number(data.total) || 1
  );

  let percentage = Number(data.percentage);

  if (isNaN(percentage)) {

    percentage = Math.round(
      (correct / totalQ) * 100
    );
  }

  percentage = Math.min(100, Math.max(0, percentage));


  const grade = data.grade || "F";

  const status =
    data.status ||
    data.result_status ||
    "Fail";

  const isPass = status === "Pass";



  /* ================= HANDLERS ================= */

  const goHome = () => {

    // Clear history & force reload
    navigate("/", { replace: true });

    // Extra safety reload
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };



  /* ================= UI ================= */

  return (
    <div style={page}>

      <div style={card}>

        <h2>🎉 Quiz Result</h2>


        {/* PERCENTAGE */}
        <h1
          style={{
            color: isPass ? "#16a34a" : "#dc2626"
          }}
        >
          {percentage}%
        </h1>


        {/* STATUS */}
        <h3
          style={{
            color: isPass ? "#16a34a" : "#dc2626"
          }}
        >
          {isPass ? "✅ PASS" : "❌ FAIL"}
        </h3>


        {/* DETAILS */}
        <p>
          Score: {correct} / {totalQ}
        </p>

        <p>
          Grade: <b>{grade}</b>
        </p>


        {/* BAR */}
        <div style={barBg}>

          <div
            style={{
              ...barFill,
              width: `${percentage}%`,
              background: isPass
                ? "#22c55e"
                : "#dc2626"
            }}
          ></div>

        </div>


        {/* BUTTON */}
        <button
          style={btn}
          onClick={goHome}
        >
          🏠 Go Home
        </button>

      </div>

    </div>
  );
}



/* ================= STYLES ================= */

const page = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f9fafb"
};


const card = {
  background: "#fff",
  padding: 30,
  borderRadius: 16,
  width: 380,
  textAlign: "center",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
};


const barBg = {
  width: "100%",
  height: 16,
  background: "#e5e7eb",
  borderRadius: 20,
  margin: "20px 0",
  overflow: "hidden"
};


const barFill = {
  height: "100%",
  transition: "0.4s"
};


const btn = {
  padding: "10px 18px",
  border: "none",
  borderRadius: 8,
  background: "#3b82f6",
  color: "white",
  cursor: "pointer",
  fontWeight: 600
};