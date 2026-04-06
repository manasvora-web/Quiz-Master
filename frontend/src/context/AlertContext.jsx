import { createContext, useContext, useState, useRef } from "react";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {

  const [alert, setAlert] = useState({
    type: "info",
    message: "",
    show: false
  });

  const timerRef = useRef(null);



  const clearTimer = () => {

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };



  /* SHOW TOAST */
  const showAlert = (message, type = "info", time = 2500) => {

    clearTimer();

    setAlert({
      type,
      message,
      show: true
    });

    timerRef.current = setTimeout(() => {
      hideAlert();
    }, time);
  };



  /* HIDE */
  const hideAlert = () => {

    clearTimer();

    setAlert({
      type: "info",
      message: "",
      show: false
    });
  };



  return (
    <AlertContext.Provider
      value={{
        alert,
        showAlert,
        hideAlert
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};


export const useAlert = () => useContext(AlertContext);