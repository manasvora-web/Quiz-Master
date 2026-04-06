import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ children }) {

  const { token } = useAuth();
  const location = useLocation();

  // ✅ If logged in → allow access
  if (token) {
    return children;
  }

  // ❌ If not logged in → redirect to login
  return (
    <Navigate
      to="/organizer/login"
      replace
      state={{ from: location }}
    />
  );
}