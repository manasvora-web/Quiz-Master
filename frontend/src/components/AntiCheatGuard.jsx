import { useEffect, useRef } from "react";

export default function AntiCheatGuard() {

  const locked = useRef(false);


  useEffect(() => {

    const fail = (reason) => {

      if (locked.current) return;

      locked.current = true;

      console.log("CHEAT:", reason);

      // ✅ Fire AUTO_SUBMIT_QUIZ so QuizAttempt handles it
      window.dispatchEvent(
        new Event("AUTO_SUBMIT_QUIZ")
      );
    };



    /* TAB / MINIMIZE */
    const blur = () => fail("TAB_SWITCH");



    /* VISIBILITY */
    const visibility = () => {
      if (document.hidden) {
        fail("HIDDEN_TAB");
      }
    };



    /* RELOAD / CLOSE */
    const unload = () => {
      fail("PAGE_EXIT");
    };



    /* COPY / PASTE */
    const blockCopy = (e) => {
      e.preventDefault();
      fail("COPY_PASTE");
    };



    /* RIGHT CLICK */
    const blockRight = (e) => {
      e.preventDefault();
      fail("RIGHT_CLICK");
    };



    /* DEVTOOLS */
    const devtools = (e) => {
      if (e.key === "F12") {
        e.preventDefault();
        fail("DEVTOOLS");
      }

      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
        fail("DEVTOOLS");
      }
    };



    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("beforeunload", unload);

    document.addEventListener("copy", blockCopy);
    document.addEventListener("paste", blockCopy);
    document.addEventListener("contextmenu", blockRight);
    document.addEventListener("keydown", devtools);



    return () => {

      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("beforeunload", unload);

      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("paste", blockCopy);
      document.removeEventListener("contextmenu", blockRight);
      document.removeEventListener("keydown", devtools);
    };

  }, []);


  return null;
}