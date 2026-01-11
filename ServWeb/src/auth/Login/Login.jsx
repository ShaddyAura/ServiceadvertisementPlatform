import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../../component/Logo";
import "./Login.css";
import { loginUser } from "../../api/AccountApi";
import { getCurrentUser } from "../../Services/authService";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  /* ---------------- GOOGLE CANCEL / ERROR HANDLER ---------------- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");

    if (error === "google_cancelled") {
      Swal.fire({
        icon: "error",
        title: "Login cancelled",
        text: "You cancelled Google sign in",
        confirmButtonColor: "#5ca9ff",
      });
    }

    if (error === "access_denied") {
      Swal.fire({
        icon: "error",
        title: "Access denied",
        text: "Google sign in was denied",
        confirmButtonColor: "#5ca9ff",
      });
    }

    if (error === "google_failed") {
      Swal.fire({
        icon: "error",
        title: "Google login failed",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: "#5ca9ff",
      });
    }

    // Clean URL so alert doesn't repeat
    if (error) {
      window.history.replaceState({}, document.title, "/login");
    }
  }, [location.search]);

  /* ---------------- FORM HANDLERS ---------------- */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Please enter email and password",
        confirmButtonColor: "#f0ad4e",
      });
      return;
    }

    try {
      setLoading(true);

      Swal.fire({
        title: "Signing in...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // Login
      const res = await loginUser(form);
      const role = res.data?.role || "User";

      // Fetch current user
      const user = await getCurrentUser();
      setUser(user);

      Swal.close();

      // Redirect
      navigate(role === "Admin" ? "/admin-dashboard" : "/user-dashboard");

    } catch (err) {
      Swal.close();

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid email or password",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="auth-bg">
      <nav className="auth-navbar">
        <Logo width={120} />
      </nav>

      <div className="login-wrapper">
        <div className="login-card">

          <div className="login-form">
            <h2>Sign in</h2>

            <div className="input-box">
              <i className="fa fa-envelope"></i>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                placeholder="Email"
              />
            </div>

            <div className="input-box">
              <i className="fa fa-lock"></i>
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type="password"
                placeholder="Password"
              />
            </div>

            <div className="text-center mt-2">
              <Link to="/forgot-password" className="login-link">
                Forgot Password?
              </Link>
            </div>

            <button
              onClick={handleLogin}
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Log in"}
            </button>

            {/* GOOGLE LOGIN */}
            <button
              onClick={() =>
                (window.location.href =
                  "https://localhost:7065/api/account/google-login")
              }
              className="google-btn"
            >
              <img src="/assets/google-icon.png" alt="Google icon" />
              Sign in with Google
            </button>

            <p className="already">
              <Link to="/register" className="login-link">
                Don’t have an account?
              </Link>
            </p>
          </div>

          <div className="login-img">
            <img src="/assets/Login.jpg" alt="Login Visual" />
          </div>

        </div>
      </div>
    </div>
  );
}
