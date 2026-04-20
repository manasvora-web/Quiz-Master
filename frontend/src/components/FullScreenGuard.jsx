import { useEffect, useRef } from "react";

export default function FullScreenGuard() {

  const locked = useRef(false);


  useEffect(() => {

    /* ================= ENTER FULLSCREEN ================= */

    const enterFull = async () => {

      if (!document.fullscreenElement) {

        try {
          await document.documentElement.requestFullscreen();
        } catch {
          console.log("Fullscreen blocked");
        }
      }
    };



    /* ================= FORCE FAIL ================= */

    const triggerFail = (reason) => {

      if (locked.current) return;

      locked.current = true;

      console.log("FULLSCREEN VIOLATION:", reason);

      // ✅ Fire AUTO_SUBMIT_QUIZ so QuizAttempt handles it
      window.dispatchEvent(
        new Event("AUTO_SUBMIT_QUIZ")
      );
    };



    /* ================= ON FULLSCREEN EXIT ================= */

    const handleChange = () => {

      if (!document.fullscreenElement) {

        triggerFail("EXIT_FULLSCREEN");

        // Try to re-enter (optional)
        enterFull();
      }
    };



    /* ================= BLOCK F11 ================= */

    const blockF11 = (e) => {

      if (e.key === "F11") {

        e.preventDefault();

        triggerFail("F11_KEY");
      }
    };



    /* ================= BLOCK ESC ================= */

    const blockESC = (e) => {

      if (e.key === "Escape") {

        e.preventDefault();

        triggerFail("ESC_KEY");
      }
    };



    /* ================= INIT ================= */

    enterFull();

    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("keydown", blockF11);
    document.addEventListener("keydown", blockESC);



    /* ================= CLEANUP ================= */

    return () => {

      document.removeEventListener(
        "fullscreenchange",
        handleChange
      );

      document.removeEventListener("keydown", blockF11);
      document.removeEventListener("keydown", blockESC);

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };

  }, []);


  return null;
}