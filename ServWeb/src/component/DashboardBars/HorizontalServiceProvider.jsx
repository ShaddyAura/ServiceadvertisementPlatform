import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Horizontalbar.css"; 
import Logo from "../Logo"; 
import { 
  FaUserCircle, 
  FaCommentDots, 
  FaIdBadge 
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import Notification from "../Notifications/Notification"; 
import { useNotifications } from "../Notifications/useNotifications"; 
// 1. Import the specific API endpoint for fetching history
import { getUserNotifications } from "../../api/AccountApi";

const HorizontalServiceProvider = () => {
  const [nepalTime, setNepalTime] = useState("");
  const { user } = useAuth(); 
  const navigate = useNavigate();

  // 2. Hook into real-time notifications
  const { notifications, setNotifications } = useNotifications(user?.profileId);

  // 3. Fetch initial notification history from DB on load
  useEffect(() => {
    const fetchHistory = async () => {
      if (user?.profileId) {
        try {
          const response = await getUserNotifications(user.profileId);
          setNotifications(response.data);
        } catch (err) {
          console.error("Failed to load provider notifications:", err);
        }
      }
    };

    fetchHistory();
  }, [user?.profileId, setNotifications]);

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

        <div className="icon chat-icon" onClick={() => navigate("/chat")} title="Messages">
          <FaCommentDots />
          <span className="badge">3</span> 
        </div>

        {/* 🚀 Notification Dropdown Logic */}
        <div className="notification-wrapper">
          <Notification 
            notifications={notifications} 
            setNotifications={setNotifications} 
            profileId={user?.profileId}
          />
        </div>

        <div className="profile-container">
          <div className="icon profile" onClick={() => navigate("/profile")}>
            <FaIdBadge />
          </div>

          <div className="profile-hover-box">
            <div className="hover-header">
              <FaUserCircle className="user-avatar-icon" />
              <div className="user-details">
                <p className="user-email">{user?.email || "provider@example.com"}</p>
                <span className="user-role-badge">{user?.role || "ServiceProvider"}</span>
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

export default HorizontalServiceProvider;