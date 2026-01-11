import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { resetPassword } from "../../api/AccountApi";
import "./ResetPassword.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Password mismatch",
        text: "Passwords do not match",
        confirmButtonColor: "#5ca9ff",
      });
      return;
    }

    try {
      setLoading(true);

      await resetPassword({
        email,
        resetCode: token,
        newPassword,
      });

      Swal.fire({
        icon: "success",
        title: "Password Updated",
        text: "Your password has been reset successfully",
        confirmButtonColor: "#5ca9ff",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      const data = err.response?.data;
      let errorMessage = "Failed to reset password.";

      if (data?.errors) {
        const key = Object.keys(data.errors)[0];
        errorMessage = data.errors[key][0];
      } else if (data?.title) {
        errorMessage = data.title;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-bg">
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="reset-card shadow-lg">
          <h1 className="text-center mb-4">Reset Password</h1>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <label className="form-label">Email</label>
            <input
              className="form-control reset-input"
              type="email"
              value={email || ""}
              disabled
            />

            {/* New Password */}
            <label className="form-label mt-3">New Password</label>
            <div className="position-relative">
              <input
                className="form-control reset-input"
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <i
                className={`fa ${
                  showNewPassword ? "fa-eye-slash" : "fa-eye"
                } password-toggle`}
                onClick={() => setShowNewPassword(!showNewPassword)}
              ></i>
            </div>

            {/* Confirm Password */}
            <label className="form-label mt-3">Confirm Password</label>
            <div className="position-relative">
              <input
                className="form-control reset-input"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <i
                className={`fa ${
                  showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                } password-toggle`}
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              ></i>
            </div>

            <button
              type="submit"
              className="btn reset-btn w-100 mt-4"
              disabled={loading}
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
