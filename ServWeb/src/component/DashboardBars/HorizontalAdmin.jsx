import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HorizontalAdmin.css"; 
import Logo from "../Logo"; 
import { FaBell, FaUserShield, FaCommentDots, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const HorizontalAdmin = () => {
  const [nepalTime, setNepalTime] = useState("");
  const { user } = useAuth(); // Access user data: { email, role, profileId }
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const nepalOffset = 5 * 60 + 45;
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const nepalDate = new Date(utc + nepalOffset * 60000);

      setNepalTime(
        nepalDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="horizontalbar">
      <div className="left-section">
        <Logo />
        <span className="badge ml-2 admin-tag">ADMIN PANEL</span>
      </div>

      <div className="right-section">
        <div className="time">🇳🇵 {nepalTime}</div>

        <div className="icon chat-icon" onClick={() => navigate("/admin/disputes")} title="Disputes">
          <FaCommentDots />
          <span className="badge">5</span> 
        </div>

        <div className="icon notification">
          <FaBell />
        </div>

        {/* Profile Section with Hover Info */}
        <div className="profile-container">
          <div className="icon profile" onClick={() => navigate("/admin/settings")}>
            <FaUserShield />
          </div>
          
          {/* THE HOVER BOX */}
          <div className="profile-hover-box">
            <div className="hover-header">
              <FaUserCircle className="user-avatar-icon" />
              <div className="user-details">
                <p className="user-email">{user?.email || "guest@example.com"}</p>
                <span className="user-role-badge">{user?.role || "User"}</span>
              </div>
            </div>
            <hr />
            <div className="hover-footer" onClick={() => navigate("/admin/settings")}>
               View Settings
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalAdmin;