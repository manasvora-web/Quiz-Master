import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useAlert } from "../context/AlertContext";

import "../styles/thankyou.css";

export default function ThankYou() {

  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // Prevent infinite loop
  const shownRef = useRef(false);



  /* ================= ONCE ONLY ================= */

  useEffect(() => {

    if (shownRef.current) return;

    shownRef.current = true;

    showAlert(
      "Quiz submitted successfully. Thank you!",
      "success",
      2000
    );

  }, [showAlert]);



  /* ================= UI ================= */

  return (
    <div className="thankyou-wrapper">

      <div className="thankyou-card">

        <h1>✅ Submission Complete</h1>

        <p>Your quiz has been submitted successfully.</p>

        <p>You may now exit safely.</p>


        <button
          className="thankyou-btn"
          onClick={() => navigate("/", { replace: true })}
        >
          Go Home
        </button>

      </div>

    </div>
  );
}