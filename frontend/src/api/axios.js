import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
});


/* ================= REQUEST ================= */
api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("quiz_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);



/* ================= RESPONSE ================= */
api.interceptors.response.use(

  (response) => response,

  (error) => {

    /* TOKEN EXPIRED / INVALID */
    if (error.response?.status === 401) {

      localStorage.removeItem("quiz_token");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);


export default api;