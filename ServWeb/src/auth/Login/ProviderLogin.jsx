import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Logo from "../../component/Logo";
import "./Login.css"; // Reusing the same CSS
import { loginUser } from "../../api/AccountApi";
import { getCurrentUser } from "../../Services/authService";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

export default function ProviderLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  /* ---------------- GOOGLE HANDLERS ---------------- */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");

    if (error) {
      const messages = {
        google_cancelled: "You cancelled Google sign in",
        access_denied: "Google sign in was denied",
        google_failed: "Something went wrong. Please try again.",
      };

      Swal.fire({
        icon: "error",
        title: "Login Issue",
        text: messages[error] || "An error occurred",
        confirmButtonColor: "#5ca9ff",
      });
      window.history.replaceState({}, document.title, "/provider-login");
    }
  }, [location.search]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Swal.fire({ icon: "warning", title: "Missing fields", text: "Please enter email and password" });
      return;
    }

    try {
      setLoading(true);
      Swal.fire({
        title: "Signing in as Provider...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // 1. Backend Login
      const res = await loginUser(form);
      const role = res.data?.role;

      // 2. Auth Context
      const user = await getCurrentUser();
      setUser(user);

      Swal.close();

      // 3. Redirect Logic (Ensuring only ServiceProviders get through here)
      if (role === "ServiceProvider") {
        navigate("/serviceproviderDashboard");
      } else if (role === "Admin") {
        navigate("/admin-dashboard");
      } else {
        // If a regular user tries to login here, send them to user dashboard
        navigate("/user-dashboard");
      }
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid provider credentials",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <nav className="auth-navbar">
        <Logo width={120} />
      </nav>

      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-form">
            <h2 style={{ color: "#dc3545" }}>Provider Sign in</h2>
            <p className="text-muted small mb-4">Manage your services and reviews</p>

            <div className="input-box">
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                placeholder="Provider Email"
              />
            </div>

            <div className="input-box">
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
              />
              <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <div className="text-center mt-2">
              <Link to="/forgot-password" size="small" className="login-link">
                Forgot Password?
              </Link>
            </div>

            <button onClick={handleLogin} className="login-btn" disabled={loading}>
              {loading ? "Verifying..." : "Provider Login"}
            </button>

            {/* GOOGLE LOGIN - UPDATED userType to ServiceProvider */}
            <button
              onClick={() =>
                (window.location.href =
                  "https://localhost:7065/api/account/google-login?userType=ServiceProvider")
              }
              className="google-btn"
            >
              <img src="/assets/google-icon.png" alt="Google icon" />
              Provider Sign in with Google
            </button>

            <p className="already">
              <Link to="/providerregister" className="login-link">
                Register as a New Provider
              </Link>
            </p>
          </div>

          <div className="login-img">
            {/* You can use a different image here if you have one for providers */}
            <img src="/assets/Login.jpg" alt="Provider Login Visual" />
          </div>
        </div>
      </div>
    </div>
  );
}