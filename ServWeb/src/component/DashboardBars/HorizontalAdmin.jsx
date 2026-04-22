import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HorizontalAdmin.css"; 
import Logo from "../Logo"; 
import { FaUserShield, FaCommentDots, FaUserCircle, FaLock, FaSignOutAlt, FaCog } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../api/AccountApi";
import Notification from "../Notifications/Notification"; 
import { useNotifications } from "../Notifications/useNotifications"; 

const HorizontalAdmin = () => {
  const [nepalTime, setNepalTime] = useState("");
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
      setUser(null);
      navigate("/login");
    }
  };

  // Notification integration (was missing)
  const { notifications, setNotifications } = useNotifications(user?.profileId);

  // Notifications are loaded by the useNotifications hook


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

        {/* Fixed: Now uses the Notification component instead of plain bell icon */}
        <div className="notification-wrapper">
          <Notification 
            notifications={notifications} 
            setNotifications={setNotifications} 
            profileId={user?.profileId}
          />
        </div>

        <div className="profile-container">
          <div className="icon profile">
            <FaUserShield />
          </div>
          
          <div className="profile-hover-box">
            <div className="hover-header">
              <FaUserCircle className="user-avatar-icon" />
              <div className="user-details">
                <p className="user-email">{user?.email || "guest@example.com"}</p>
                <span className="user-role-badge">{user?.role || "Admin"}</span>
              </div>
            </div>
            <hr />
            <div className="hover-footer-links">
               <div className="hover-link-item" onClick={() => navigate("/change-password")}>
                 <FaLock /> <span>Change Password</span>
               </div>
               <div className="hover-link-item logout-link" onClick={handleLogout}>
                 <FaSignOutAlt /> <span>Logout</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalAdmin;