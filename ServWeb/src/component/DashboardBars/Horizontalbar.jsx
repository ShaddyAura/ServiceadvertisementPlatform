import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Horizontalbar.css";
import Logo from "../Logo";
import { FaUserCircle, FaCommentDots } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import Notification from "../../component/Notifications/Notification"; 
import { useNotifications } from "../../component/Notifications/useNotifications"; 

const Horizontalbar = () => {
  const [nepalTime, setNepalTime] = useState("");
  const { user } = useAuth(); 
  const navigate = useNavigate();

  // 2. Initialize Real-time Notifications state/socket
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
      </div>

      <div className="right-section">
        <div className="time">🇳🇵 {nepalTime}</div>

        <div className="icon chat-icon" onClick={() => navigate("/chats")} title="Messages">
          <FaCommentDots size={22} />
          <span className="badge">3</span> 
        </div>

        <div className="notification-wrapper">
          <Notification 
            notifications={notifications} 
            setNotifications={setNotifications} 
            profileId={user?.profileId}
          />
        </div>

        <div className="profile-container">
          <div className="icon profile">
            <FaUserCircle size={25} />
          </div>

          <div className="profile-hover-box">
            <div className="hover-header">
              <FaUserCircle className="user-avatar-icon" />
              <div className="user-details">
                <p className="user-email">{user?.email || "Guest User"}</p>
                <span className="user-role-badge">{user?.role || "User"}</span>
              </div>
            </div>
            <hr />
            <div className="hover-footer" onClick={() => navigate("/settings")}>
               Account Settings
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Horizontalbar;