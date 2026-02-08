import React from "react";
import { NavLink } from "react-router-dom";
import "./Verticalbar.css"; // Reuse exactly the same CSS
import {
  FaTachometerAlt,
  FaUsers,
  FaShieldAlt,
  FaFileInvoiceDollar,
  FaChartLine,
  FaCogs,
  FaExclamationTriangle,
  FaSignOutAlt,
} from "react-icons/fa";

const VerticalAdmin = () => {
  const adminMenuItems = [
    { to: "/admin-dashboard", label: "Overview", icon: <FaTachometerAlt /> },
    { to: "admin/users", label: "Manage Users", icon: <FaUsers /> },
    { to: "/admin/verifications", label: "Verify IDs", icon: <FaShieldAlt /> }, // Verification Logic
    { to: "/admin/finances", label: "Platform Cash", icon: <FaFileInvoiceDollar /> }, // Wallet Logic
    { to: "/admin/boosts", label: "Ad Campaigns", icon: <FaChartLine /> }, // Boosting Logic
    { to: "/admin/disputes", label: "Disputes", icon: <FaExclamationTriangle /> },
    { to: "/admin/settings", label: "System Setup", icon: <FaCogs /> },
    { to: "/login", label: "Logout", icon: <FaSignOutAlt />, className: "logout" },
  ];

  return (
    <aside className="verticalbar">
      <nav className="card-grid">
        {adminMenuItems.map((item, index) => (
          <NavLink 
            key={index} 
            to={item.to} 
            className={({ isActive }) => `nav-card ${isActive ? 'active' : ''} ${item.className || ""}`}
          >
            <span className="card-icon">{item.icon}</span>
            <span className="card-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default VerticalAdmin;