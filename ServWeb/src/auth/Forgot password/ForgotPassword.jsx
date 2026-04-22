import React, { useState } from "react";
import { 
  Box, Typography, TextField, Button, InputAdornment, useTheme
} from "@mui/material";
import { Email as EmailIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import Logo from "../../component/Logo";
import "./../Login/Login.css";
import { forgotPassword } from "../../api/AccountApi";
import Swal from "sweetalert2";

export default function ForgotPassword() {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      Swal.fire({ icon: "warning", title: "Email required", text: "Please enter your email address" });
      return;
    }

    try {
      setLoading(true);
      await forgotPassword({ email });
      Swal.fire({
        icon: "success",
        title: "Email Sent!",
        text: "Password reset link has been sent to your email.",
        confirmButtonColor: theme.palette.primary.main,
      });
      setEmail("");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.response?.data || "Failed to send reset link.",
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
             <Button 
                component={RouterLink} 
                to="/login" 
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 4, textTransform: 'none', color: 'text.secondary', alignSelf: 'flex-start' }}
              >
                Back to Login
              </Button>

            <h2>Forgot Password?</h2>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
              No worries! Enter your email below to receive a reset link.
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField 
                fullWidth
                label="Email Address"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Button 
                fullWidth 
                variant="contained" 
                size="large" 
                type="submit"
                disabled={loading}
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, mt: 1 }}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </Box>
          </div>

          <div className="login-img" style={{ background: '#f8fafc' }}>
            <img
              src="/assets/forgot.png"
              alt="Forgot Password"
              style={{ width: '80%', height: 'auto', objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
