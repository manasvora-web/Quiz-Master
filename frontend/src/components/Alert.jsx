import "./Alert.css";
import { useAlert } from "../context/AlertContext";

export default function Alert() {

  const { alert, hideAlert } = useAlert();

  if (!alert.show) return null;


  return (
    <div className="toast-container">

      <div className={`toast toast-${alert.type}`}>

        <span className="toast-msg">
          {alert.message}
        </span>

        <button
          className="toast-close"
          onClick={hideAlert}
        >
          ✖
        </button>

      </div>

    </div>
  );
}
