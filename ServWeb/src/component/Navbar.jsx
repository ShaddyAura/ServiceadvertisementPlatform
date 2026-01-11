import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../component/Logo";
import "./Navbar.css";

export default function Navbar() {
  const [serviceOpen, setServiceOpen] = useState(false);

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

          {/* SERVICES DROPDOWN */}
          <li
            className="nav-item dropdown mx-3 service-group"
            onMouseEnter={() => setServiceOpen(true)}
            onMouseLeave={() => setServiceOpen(false)}
          >
            <span
              className="nav-link service-toggle"
              role="button"
              onClick={() => setServiceOpen(!serviceOpen)}
            >
              Services{" "}
              <span className="arrow-icon">{serviceOpen ? "v" : ">"}</span>
            </span>

            {serviceOpen && (
              <ul className="dropdown-menu show service-menu">
                <li>
                  <Link className="dropdown-item" to="/services/home">
                    <i className="bi bi-house-door me-2"></i> Home Service
                  </Link>
                </li>

                <li>
                  <Link className="dropdown-item" to="/services/personal">
                    <i className="bi bi-person me-2"></i> Personal Service
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* DISCOUNTS */}
          <li className="nav-item dropdown mx-3">
            <span className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown">
              Discounts
            </span>
            <ul className="dropdown-menu">
              <li><Link className="dropdown-item" to="/discounts/today">Today's Deals</Link></li>
              <li><Link className="dropdown-item" to="/discounts/new-user">New User Offer</Link></li>
              <li><Link className="dropdown-item" to="/discounts/seasonal">Seasonal Discounts</Link></li>
            </ul>
          </li>

          <li className="nav-item mx-3">
            <Link className="nav-link" to="/payment">Payment</Link>
          </li>

        </ul>

        {/* RIGHT SIDE BUTTONS */}
        <ul className="navbar-nav ms-auto">
          <li className="nav-item mx-2">
            <Link className="nav-link" to="/login">Login</Link>
          </li>

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
