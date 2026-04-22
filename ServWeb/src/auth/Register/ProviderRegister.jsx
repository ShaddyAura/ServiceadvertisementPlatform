import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { 
  Box, Typography, TextField, Button, IconButton, 
  InputAdornment, Checkbox, FormControlLabel, useTheme
} from "@mui/material";
import { 
  Visibility, VisibilityOff, Person as PersonIcon,
  Email as EmailIcon, Lock as LockIcon 
} from "@mui/icons-material";
import Logo from "../../component/Logo";
import "./Register.css";
import { registerUser } from "../../api/AccountApi";
import Swal from "sweetalert2";

export default function ProviderRegister() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    repeatPassword: "",
    userType: "ServiceProvider", 
    agree: false,
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const showError = (message) => {
    Swal.fire({
      icon: "error",
      title: "Registration Failed",
      text: message,
      confirmButtonColor: theme.palette.error.main,
    });
  };

  const handleRegister = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.password.trim()) {
      showError("Please fill all fields.");
      return;
    }
    if (form.password !== form.repeatPassword) {
      showError("Passwords do not match.");
      return;
    }
    if (!form.agree) {
      showError("You must accept the Terms of Service.");
      return;
    }

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      confirmPassword: form.repeatPassword,
      userType: "ServiceProvider", 
    };

    try {
      setLoading(true);
      Swal.fire({ title: "Registering...", allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

      const res = await registerUser(payload);
      const email = res.data.email;

      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        text: "Signed up as Service Provider. Redirecting...",
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => {
        navigate(`/confirm-email?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (err) {
      let errorMessage = err.response?.data ? (typeof err.response.data === "string" ? err.response.data : Object.values(err.response.data).flat().join("\n")) : "Registration failed.";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <nav className="auth-navbar">
        <Logo width={120} />
      </nav>

      <div className="register-wrapper">
        <div className="register-card">
          <div className="register-form">
            <h2 style={{ color: theme.palette.secondary.main }}>Provider Signup</h2>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
              Join Nepal's leading platform for on-demand services.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField 
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: 'action.active' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField 
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  ),
                }}
                />
              </Box>

              <TextField 
                fullWidth
                label="Business Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                variant="outlined"
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
                value={form.password}
                onChange={handleChange}
                variant="outlined"
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

              <TextField 
                fullWidth
                label="Confirm Password"
                name="repeatPassword"
                type={showRepeatPassword ? "text" : "password"}
                value={form.repeatPassword}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowRepeatPassword(!showRepeatPassword)} sx={{ color: 'rgba(0, 0, 0, 0.6)', mr: -1 }}>
                        {showRepeatPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox 
                    name="agree" 
                    checked={form.agree} 
                    onChange={handleChange} 
                    color="secondary" 
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    I agree to the <span className="login-link" style={{ color: theme.palette.secondary.main, cursor: 'pointer' }}>Terms of Service</span>
                  </Typography>
                }
              />

              <Button 
                fullWidth 
                variant="contained" 
                color="secondary"
                size="large" 
                onClick={handleRegister}
                disabled={loading}
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, mt: 1 }}
              >
                {loading ? "Registering..." : "Join as Provider"}
              </Button>

              <p className="already">
                Already have a business account?{' '}
                <RouterLink to="/providerlogin" className="login-link" style={{ color: theme.palette.secondary.main }}>Sign in</RouterLink>
              </p>
            </Box>
          </div>

          <div className="register-img">
            <img src="/assets/register.jpg" alt="Register Visual" />
          </div>
        </div>
      </div>
    </div>
  );
}