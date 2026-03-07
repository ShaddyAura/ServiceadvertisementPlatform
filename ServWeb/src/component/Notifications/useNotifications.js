import { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import axios from "axios"; // or your Api client

export const useNotifications = (profileId) => {
  const [notifications, setNotifications] = useState([]);
  const connectionRef = useRef(null);

  // 1. Load History from your API
  useEffect(() => {
    const fetchHistory = async () => {
      if (!profileId) return;
      try {
        const res = await axios.get(`https://localhost:7065/api/Notification/${profileId}`);
        setNotifications(res.data);
      } catch (err) {
        console.error("Error fetching notification history:", err);
      }
    };
    fetchHistory();
  }, [profileId]);

  // 2. Real-time SignalR Connection
  useEffect(() => {
    if (!profileId || connectionRef.current) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7065/notificationHub", {
        accessTokenFactory: () => localStorage.getItem("token")
      })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection.start()
      .then(() => console.log("SignalR: Connected"))
      .catch(err => console.error("SignalR Connection Error: ", err));

    connection.on("ReceiveNotification", (newNotif) => {
      // Append new notification to the top
      setNotifications(prev => [newNotif, ...prev]);
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