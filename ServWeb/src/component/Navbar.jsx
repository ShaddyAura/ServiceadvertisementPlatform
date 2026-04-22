import React from "react";
import { Link } from "react-router-dom";
import Logo from "../component/Logo";
import "./Navbar.css";

export default function Navbar() {

  return (
    <nav className="navbar navbar-expand-lg sky-navbar shadow-sm sticky-top px-4 py-3">
      
      <Logo />
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navMenu"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navMenu">
        
        <ul className="navbar-nav ms-5 mb-2 mb-lg-0">
          <li className="nav-item mx-3">
            <Link className="nav-link" to="/">Home</Link>
          </li>
        </ul>

        {/* RIGHT SIDE BUTTONS */}
        <ul className="navbar-nav ms-auto align-items-center">
          
          {/* BECOME A SELLER - Path to Provider Registration */}
          <li className="nav-item mx-2">
            <Link className="nav-link fw-bold text-primary" to="/providerregister">
              Become a Seller
            </Link>
          </li>

          <li className="nav-item mx-2">
            <Link className="nav-link" to="/login">Login</Link>
          </li>

          {/* REGISTER - Path to Standard Registration */}
          <li className="nav-item mx-2">
            <Link className="btn btn-light text-primary fw-bold px-3 py-1" to="/register">
              Register
            </Link>
          </li>
        </ul>

      </div>
    </nav>
  );
}