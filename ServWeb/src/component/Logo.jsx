import React from "react";
import { Link } from "react-router-dom";
import "./Logo.css";

export default function Logo() {
  return (
    <Link to="/" className="logo-wrapper">
      <img src="/assets/logo.png" alt="App Logo" className="logo-icon" />
      <span className="logo-text">ServAdd</span>
    </Link>
  );
}
