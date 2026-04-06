import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("quiz_token"));

  const login = (t) => {
    localStorage.setItem("quiz_token", t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem("quiz_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
