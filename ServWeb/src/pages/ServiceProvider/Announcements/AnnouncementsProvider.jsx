import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getUserNotifications, markNotificationAsRead } from "../../../api/AccountApi";
import { FaBullhorn, FaCheckCircle, FaClock, FaEnvelope, FaEnvelopeOpen } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import Swal from "sweetalert2";
import "../../Users/Announcements/Announcements.css";

const AnnouncementsProvider = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (user?.profileId) loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await getUserNotifications(user.profileId);
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      Swal.fire("Error", "Could not mark as read.", "error");
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map(n => markNotificationAsRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      Swal.fire({
        title: "Done!",
        text: "All messages marked as read.",
        icon: "success",
        toast: true,
        position: "top-end",
        timer: 2000,
        showConfirmButton: false
      });
    } catch {
      Swal.fire("Error", "Could not mark all as read.", "error");
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="announce-loading">
        <div className="announce-loading-spinner"></div>
        <p>Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="announce-wrapper">
      {/* Header */}
      <div className="announce-header">
        <div className="announce-header-left">
          <div className="announce-header-icon">
            <FaBullhorn />
          </div>
          <div>
            <h2>Announcements</h2>
            <p>Important updates & broadcasts from the platform</p>
          </div>
        </div>
        <div className="announce-header-right">
          {unreadCount > 0 && (
            <span className="announce-unread-badge">{unreadCount} unread</span>
          )}
          <button className="announce-mark-all-btn" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
            <FaCheckCircle /> Mark all read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="announce-filters">
        {["all", "unread", "read"].map(f => (
          <button
            key={f}
            className={`announce-filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" && "All Messages"}
            {f === "unread" && `Unread (${unreadCount})`}
            {f === "read" && "Read"}
          </button>
        ))}
      </div>

      {/* Messages List */}
      <div className="announce-list">
        {filtered.length === 0 ? (
          <div className="announce-empty">
            <FaBullhorn className="announce-empty-icon" />
            <h4>No announcements yet</h4>
            <p>You'll see broadcast messages from the platform here.</p>
          </div>
        ) : (
          filtered.map((n, idx) => (
            <div
              key={n.id || idx}
              className={`announce-card ${!n.isRead ? "announce-unread" : ""}`}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="announce-card-indicator">
                {!n.isRead ? (
                  <div className="announce-dot-unread" />
                ) : (
                  <FaEnvelopeOpen className="announce-dot-read" />
                )}
              </div>

              <div className="announce-card-icon">
                {!n.isRead ? <FaEnvelope /> : <FaEnvelopeOpen />}
              </div>

              <div className="announce-card-content">
                <div className="announce-card-top">
                  <h5>{n.title}</h5>
                  <span className="announce-card-time">
                    <FaClock />
                    {n.createdAt
                      ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
                      : "Just now"}
                  </span>
                </div>
                <p className="announce-card-message">{n.message}</p>
                {!n.isRead && (
                  <span className="announce-new-tag">NEW</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementsProvider;
