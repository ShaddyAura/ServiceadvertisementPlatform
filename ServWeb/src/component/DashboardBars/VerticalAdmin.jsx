import React from "react";
import { NavLink } from "react-router-dom";
import "./VerticalAdmin.css"; 
import {
  FaTachometerAlt,
  FaUsers,
  FaShieldAlt,
  FaFileInvoiceDollar,
  FaChartLine,
  FaCogs,
  FaExclamationTriangle,
  FaSignOutAlt,
  FaList,
  FaCheckSquare,
  FaBullhorn,
  FaCreditCard,
  FaTag
} from "react-icons/fa";

const VerticalAdmin = () => {
const adminMenuItems = [
  { to: "/admin-dashboard", label: "Overview", icon: <FaTachometerAlt /> },
  { to: "/users", label: "Manage Users", icon: <FaUsers /> }, 
  { to: "/verifications", label: "Verify IDs", icon: <FaShieldAlt /> }, 
  { to: "/withdrawals", label: "Payouts", icon: <FaCreditCard /> },
  { to: "/moderation", label: "Moderation", icon: <FaCheckSquare /> },
  { to: "/broadcast", label: "Broadcaster", icon: <FaBullhorn /> },
  { to: "/finances", label: "Platform Cash", icon: <FaFileInvoiceDollar /> },
  { to: "/adminboost", label: "Ad Campaigns", icon: <FaChartLine /> },
  { to: "/servicereport", label: "serviceReport", icon: <FaExclamationTriangle /> },
  { to: "/bookingreport", label: "BookingReport", icon: <FaExclamationTriangle /> },
  { to: "/reportreview", label: "ReviewReport", icon: <FaExclamationTriangle /> },
  { to: "/categories", label: "Categories", icon: <FaList /> },
  { to: "/promotions", label: "Promotions", icon: <FaTag /> },
  { to: "/settings", label: "System Setup", icon: <FaCogs /> },
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