import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../component/Logo";
import "./Register.css"; // Using your existing CSS
import { registerUser } from "../../api/AccountApi";
import Swal from "sweetalert2";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    repeatPassword: "",
    userType: "User", // Hardcoded for this page
    agree: false,
  });

  const [loading, setLoading] = useState(false);

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
      confirmButtonClass: "btn btn-danger",
      buttonsStyling: false,
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
      userType: "User", 
    };

    try {
      setLoading(true);
      Swal.fire({ title: "Registering...", allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

      const res = await registerUser(payload);
      const email = res.data.email;

      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        text: "Signed up as Customer. Redirecting...",
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
            <h2>Sign up as Customer</h2>
            <div className="input-box">
              <input name="firstName" onChange={handleChange} value={form.firstName} type="text" placeholder="First Name" />
            </div>
            <div className="input-box">
              <input name="lastName" onChange={handleChange} value={form.lastName} type="text" placeholder="Last Name" />
            </div>
            <div className="input-box">
              <input name="email" onChange={handleChange} value={form.email} type="email" placeholder="Email" />
            </div>
            <div className="input-box">
              <input name="password" onChange={handleChange} value={form.password} type="password" placeholder="Password" />
            </div>
            <div className="input-box">
              <input name="repeatPassword" onChange={handleChange} value={form.repeatPassword} type="password" placeholder="Repeat your password" />
            </div>
            <div className="terms">
              <input type="checkbox" id="t1" name="agree" checked={form.agree} onChange={handleChange} />
              <label htmlFor="t1">I agree all statements in <span>Terms of service</span></label>
            </div>
            <button onClick={handleRegister} className="register-btn" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
            <p className="already">
              <Link to="/login" className="login-link">Already a member?</Link>
            </p>
          </div>
          <div className="register-img">
            <img src="/assets/register.jpg" alt="Register Visual" />
          </div>
        </div>
      </div>
    </div>
  );
}