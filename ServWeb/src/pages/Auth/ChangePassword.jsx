import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash, FaLock, FaArrowLeft } from "react-icons/fa";
import { changePassword } from "../../api/AccountApi";
import { useAuth } from "../../context/AuthContext";
import "./ChangePassword.css";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "New passwords do not match!",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "New password must be at least 6 characters long.",
      });
      return;
    }

    try {
      setLoading(true);
      const email = user?.email; // Get email from auth context

      if (!email) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "User email not found. Please log in again.",
        });
        return;
      }

      await changePassword({
        email: email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Password changed successfully!",
        timer: 1500,
        showConfirmButton: false,
      });

      // Navigate back after a moment
      setTimeout(() => navigate(-1), 1500);
      
    } catch (error) {
      console.error("Change password error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.Message || "Failed to change password. Please check your current password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <div className="change-password-container">
        
        <div className="back-btn-container">
           <button className="back-btn" onClick={() => navigate(-1)}>
             <FaArrowLeft /> Back
           </button>
        </div>

        <div className="change-password-header">
          <div className="icon-wrapper">
             <FaLock />
          </div>
          <h2>Change Password</h2>
          <p>Create a new strong password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="input-group">
            <label>Current Password</label>
            <div className="input-wrapper">
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                required
              />
              <span 
                className="eye-icon" 
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="input-group">
            <label>New Password</label>
            <div className="input-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
                required
              />
              <span 
                className="eye-icon" 
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="input-group">
            <label>Confirm New Password</label>
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                required
              />
              <span 
                className="eye-icon" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
