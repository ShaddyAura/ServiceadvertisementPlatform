import React, { useState } from "react";
import { forgotPassword } from "../../api/AccountApi";
import "./ForgotPassword.css";
import Swal from "sweetalert2";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Email required",
        text: "Please enter your email address",
      });
      return;
    }

    try {
      setLoading(true);

      await forgotPassword({ email });

      Swal.fire({
        icon: "success",
        title: "Email Sent!",
        text: "Password reset link has been sent to your email.",
        confirmButtonColor: "#5ca9ff",
      });

      setEmail("");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.response?.data || "Failed to send reset link.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-bg">
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="forgot-card shadow-lg">
          <div className="row g-0 align-items-center">

            {/* LEFT FORM */}
            <div className="col-md-6 p-4">
              <h2 className="text-center mb-3">Forgot Password</h2>
              <p className="text-muted text-center mb-4">
                Enter your email and we’ll send you a password reset link.
              </p>

              <form onSubmit={handleSubmit}>
                <label className="form-label fw-semibold">Email</label>

                <div className="position-relative mb-3">
                  <i className="fa fa-envelope forgot-icon"></i>

                  <input
                    type="email"
                    className="form-control forgot-input"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn forgot-btn w-100"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </div>

            {/* RIGHT IMAGE */}
            <div className="col-md-6 d-none d-md-flex justify-content-center align-items-center p-3">
              <img
                src="/assets/forgot.png"
                alt="Forgot Password"
                className="img-fluid"
                style={{ maxHeight: "300px" }}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
