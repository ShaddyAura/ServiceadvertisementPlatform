import React from "react";
import { NavLink } from "react-router-dom";
import "./Verticalbar.css";
import {
  FaTachometerAlt,
  FaUser,
  FaTools,
  FaRocket,
  FaCalendarCheck,
  FaMoneyBill,
  FaStar,
  FaSignOutAlt,
} from "react-icons/fa";

const Verticalbar = () => {
  const menuItems = [
    { to: "/user-dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { to: "/profile", label: "My Profile", icon: <FaUser /> },
    { to: "/services/manage", label: "My Services", icon: <FaTools /> },
    { to: "/boost", label: "Boost Services", icon: <FaRocket /> },
    { to: "/bookings", label: "Bookings", icon: <FaCalendarCheck /> },
    { to: "/payments", label: "Payments", icon: <FaMoneyBill /> },
    { to: "/reviews", label: "Reviews", icon: <FaStar /> },
    { to: "/login", label: "Logout", icon: <FaSignOutAlt />, className: "logout" },
  ];

  return (
    <aside className="verticalbar">
      <nav className="card-grid">
        {menuItems.map((item, index) => (
          <NavLink 
            key={index} 
            to={item.to} 
            className={`nav-card ${item.className || ""}`}
          >
            <span className="card-icon">{item.icon}</span>
            <span className="card-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Verticalbar;