import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./ConfirmEmail.css";
import { verifyEmailCode, resendVerificationEmail } from "../../api/AccountApi";

export default function ConfirmEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const email = params.get("email") || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerify = async () => {
    if (!code) {
      Swal.fire({
        icon: "warning",
        title: "Missing information",
        text: "Please enter the verification code.",
      });
      return;
    }

    try {
      setLoading(true);
      await verifyEmailCode({ email, code });

      Swal.fire({
        icon: "success",
        title: "Email verified!",
        text: "You can now log in.",
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Verification failed",
        text: err.response?.data || "Invalid verification code.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);
      await resendVerificationEmail({ email });

      Swal.fire({
        icon: "success",
        title: "Email sent",
        text: "Verification email has been resent.",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.response?.data || "Could not resend verification email.",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="confirm-page">
      <div className="confirm-card">
        <h2>Check your inbox</h2>
        <p className="subtitle">
          Enter the verification code sent to your email
        </p>

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} readOnly />
        </div>

        <div className="form-group">
          <label>Verification Code</label>
          <input
            type="text"
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <button onClick={handleVerify} disabled={loading}>
          {loading ? "Verifying..." : "Continue"}
        </button>

        <p className="footer-text">
          Didn't receive the email?{" "}
          <span onClick={handleResend}>
            {resendLoading ? "Resending..." : "Resend email"}
          </span>
        </p>
      </div>
    </div>
  );
}
