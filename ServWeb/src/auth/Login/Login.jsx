import React, { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { 
  Box, Typography, TextField, Button, IconButton, 
  InputAdornment, Divider, useTheme
} from "@mui/material";
import { 
  Visibility, VisibilityOff, Email as EmailIcon, 
  Lock as LockIcon 
} from "@mui/icons-material";
import Logo from "../../component/Logo";
import "./Login.css";
import { loginUser } from "../../api/AccountApi";
import { getCurrentUser } from "../../Services/authService";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

export default function Login() {
  const theme = useTheme();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

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
        confirmButtonColor: theme.palette.primary.main,
      });
      window.history.replaceState({}, document.title, "/login");
    }
  }, [location.search, theme.palette.primary.main]);

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
      Swal.fire({ title: "Signing in...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const res = await loginUser(form);
      const role = res.data?.role;
      const user = await getCurrentUser();
      setUser(user);

      Swal.close();
      if (role === "Admin") navigate("/admin-dashboard");
      else navigate("/user-dashboard");

    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid email or password",
        confirmButtonColor: theme.palette.error.main,
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
            <h2>Sign in</h2>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
              Welcome back! Please enter your details.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField 
                fullWidth
                label="Email"
                name="email"
                variant="outlined"
                value={form.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField 
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={form.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} sx={{ color: 'rgba(0, 0, 0, 0.6)', mr: -1 }}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ textAlign: 'right' }}>
                <Typography 
                  component={RouterLink} 
                  to="/forgot-password" 
                  variant="body2" 
                  className="login-link"
                >
                  Forgot Password?
                </Typography>
              </Box>

              <Button 
                fullWidth 
                variant="contained" 
                size="large" 
                onClick={handleLogin}
                disabled={loading}
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, mt: 1 }}
              >
                {loading ? "Signing in..." : "Log in"}
              </Button>

              <Divider sx={{ my: 1 }}>
                <Typography variant="caption" color="text.secondary">OR</Typography>
              </Divider>

              <button 
                className="google-btn"
                onClick={() => window.location.href = "https://localhost:7065/api/account/google-login?userType=User"}
              >
                <img src="/assets/google-icon.png" alt="google" />
                Sign in with Google
              </button>

              <p className="already">
                Don't have an account?{' '}
                <RouterLink to="/register" className="login-link">Sign up for free</RouterLink>
              </p>
            </Box>
          </div>

          <div className="login-img">
            <img src="/assets/Login.jpg" alt="Login Visual" />
          </div>
        </div>
      </div>
    </div>
  );
}