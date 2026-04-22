import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7065/api",
  withCredentials: true,
});

// AUTO-LOGOUT INTERCEPTOR (Test Case 18)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthPage = window.location.pathname === "/login" || window.location.pathname === "/register";
    
    if (error.response && error.response.status === 401 && !isAuthPage) {
      // Clear session and redirect to login only if we aren't already there
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

