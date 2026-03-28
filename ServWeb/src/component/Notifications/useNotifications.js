import { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { getUserNotifications } from "../../api/AccountApi";

export const useNotifications = (profileId) => {
  const [notifications, setNotifications] = useState([]);
  const connectionRef = useRef(null);

  // 1. Load History from your API (single source of truth)
  useEffect(() => {
    const fetchHistory = async () => {
      if (!profileId) return;
      try {
        const res = await getUserNotifications(profileId);
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Error fetching notification history:", err);
      }
    };
    fetchHistory();
  }, [profileId]);

  // 2. Real-time SignalR Connection
  useEffect(() => {
    if (!profileId || connectionRef.current) return;

    const token = localStorage.getItem("token");

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7065/notificationHub", {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection.start()
      .then(() => console.log("✅ NotificationHub: Connected"))
      .catch(err => console.error("❌ NotificationHub Connection Error:", err));

    // Listen for new real-time notifications
    connection.on("ReceiveNotification", (newNotif) => {
      setNotifications(prev => {
        // Prevent duplicates
        if (prev.find(n => n.id === newNotif.id)) return prev;
        return [newNotif, ...prev];
      });
    });

    // Handle "Mark as Read" broadcast from backend
    connection.on("NotificationRead", (notificationId) => {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    });

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, [profileId]);

  return { notifications, setNotifications };
};