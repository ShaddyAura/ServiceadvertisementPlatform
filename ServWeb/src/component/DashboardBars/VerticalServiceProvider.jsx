import React from "react";
import { NavLink } from "react-router-dom";
import "./Verticalbar.css"; 
import {
  FaExclamationTriangle,
  FaTachometerAlt,
  FaUser,           // Added missing import
  FaTools,          // Added missing import
  FaRocket,         // Added missing importsss
  FaCalendarCheck,  // Added missing import
  FaStar,
  FaSignOutAlt,
} from "react-icons/fa";

const VerticalServiceProvider = () => {
  const menuItems = [
    { to: "/serviceproviderDashboard", label:"Dashboard", icon:<FaTachometerAlt /> },
    { to: "/profiles", label: "My Profile", icon: <FaUser /> },
    { to: "/services/manage", label: "My Services", icon: <FaTools /> },
    { to: "/boosts", label: "Boost Services", icon: <FaRocket /> },
    { to: "/booking", label: "Bookings", icon: <FaCalendarCheck /> },
    // { to: "/review", label: "Reviews", icon: <FaStar /> },
    { to: "/point", label: "Points", icon: <FaStar /> },
    { to: "/reedem", label: "Redeem Gifts", icon: <FaStar /> },
    { to: "/mybook", label: "MyBooking", icon: <FaExclamationTriangle /> },
    { to: "/gift", label: "Gifts", icon: <FaStar /> },
    { to: "/login", label: "Logout", icon: <FaSignOutAlt />, className: "logout" },
  ];

  return (
    <aside className="verticalbar">
      <nav className="card-grid">
        {menuItems.map((item, index) => (
          <NavLink 
            key={index} 
            to={item.to} 
            className={({ isActive }) => 
              `nav-card ${isActive ? 'active' : ''} ${item.className || ""}`
            }
          >
            <span className="card-icon">{item.icon}</span>
            <span className="card-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default VerticalServiceProvider;