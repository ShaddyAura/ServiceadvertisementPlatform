import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "../../../context/AuthContext";
import {
  sendMessage,
  getChatHistory,
  fetchAllBookings,
  deleteChatHistory
} from "../../../api/AccountApi";
import { FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import "./Chats.css";

export default function Chats() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [booking, setBooking] = useState(null);
  const [input, setInput] = useState("");
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  const scrollRef = useRef();

  // ✅ LOAD BOOKING + HISTORY
  useEffect(() => {
    if (!bookingId || !user?.profileId) return;

    const loadChat = async () => {
      try {
        setLoading(true);

        const [historyRes, bookingsRes] = await Promise.all([
          getChatHistory(bookingId, user.profileId),
          fetchAllBookings()
        ]);

        const mappedHistory = (historyRes.data || []).map(m => ({
          id: m.id || m.Id,
          messageText: m.messageText || m.MessageText,
          senderProfileId: m.senderProfileId || m.SenderProfileId,
          sentAt: m.sentAt || m.SentAt
        }));

        setMessages(mappedHistory);

        const currentBooking = (bookingsRes.data || []).find(
          b => String(b.id || b.Id) === String(bookingId)
        );

        setBooking(currentBooking || null);
      } catch (err) {
        console.error("Chat load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [bookingId, user?.profileId]);

  // ✅ SIGNALR HUB SETUP
  useEffect(() => {
    const token = localStorage.getItem("token");

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7065/chatHub", {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, []);

  // ✅ CONNECT AND LISTEN
  useEffect(() => {
    if (!connection || !bookingId || !booking) return;

    const startConnection = async () => {
      try {
        if (connection.state === "Disconnected") {
          await connection.start();
          await connection.invoke("JoinBookingGroup", bookingId);

          // Register presence
          if (user?.profileId) {
            await connection.invoke("RegisterOnline", user.profileId);
          }

          // Listen for Presence
          connection.on("UserStatusChanged", (pid, isUserOnline) => {
            const providerId = booking.providerProfileId || booking.ProviderProfileId;
            const customerId = booking.profileId || booking.ProfileId;
            const otherId = String(providerId) === String(user.profileId) ? customerId : providerId;

            if (String(pid) === String(otherId)) {
              setIsOnline(isUserOnline);
            }
          });

          connection.on("ReceiveMessage", msg => {
            const msgId = msg.id || msg.Id;

            setMessages(prev => {
              if (prev.find(m => String(m.id) === String(msgId)))
                return prev;

              return [
                ...prev,
                {
                  id: msgId,
                  messageText: msg.messageText || msg.MessageText,
                  senderProfileId: msg.senderProfileId || msg.SenderProfileId,
                  sentAt: msg.sentAt || msg.SentAt || new Date().toISOString()
                }
              ];
            });
          });
        }
      } catch (err) {
        console.error("SignalR error:", err);
      }
    };

    startConnection();
  }, [connection, bookingId, booking, user]);

  // ✅ AUTO SCROLL
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ SEND HANDLER
  const handleSend = async e => {
    e.preventDefault();
    if (!input.trim() || !booking || !user) return;

    const providerId = booking.providerProfileId || booking.ProviderProfileId;
    const customerId = booking.profileId || booking.ProfileId;
    
    if (!providerId || !customerId) {
        alert("Cannot send message. The booking is missing either a Provider ID or Customer ID.");
        return;
    }

    const isMeProvider = String(providerId) === String(user.profileId);
    const receiverId = isMeProvider ? customerId : providerId;

    if (!receiverId || receiverId === "00000000-0000-0000-0000-000000000000") {
        alert("Cannot send message. Receiver ID is invalid or empty.");
        return;
    }

    try {
      await sendMessage({
        BookingId: bookingId,
        SenderProfileId: user.profileId,
        ReceiverProfileId: receiverId,
        MessageText: input.trim()
      });

      setInput("");
    } catch (err) {
      console.error("Send error:", err);
    }
  };

  // ✅ DELETE CHAT (SweetAlert)
  const handleDeleteChat = async () => {
    const result = await Swal.fire({
      title: "Delete Conversation?",
      text: "This will only remove it for you. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await deleteChatHistory(bookingId, user.profileId);
        setMessages([]);
        Swal.fire({
          title: "Deleted!",
          text: "Your conversation has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
        setTimeout(() => navigate(-1), 1600);
      } catch (err) {
        console.error("Delete failed:", err);
        Swal.fire("Error", "Failed to delete chat. Please try again.", "error");
      }
    }
  };

  if (loading) return <div className="loading-screen">Loading Conversation...</div>;

  // ✅ HEADER LOGIC
  let chatUserName = "";
  if (booking && user) {
    const providerId = booking.providerProfileId || booking.ProviderProfileId;
    const isProvider = String(providerId) === String(user.profileId);
    chatUserName = isProvider 
        ? (booking.fullName || booking.FullName) 
        : (booking.providerFullName || booking.ProviderFullName);
  }

  return (
    <div className="chat-container">
      <header className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
            <div className="user-info">
              <h3>{chatUserName || "Chat"}</h3>
              <span className="online-status" style={{ color: isOnline ? '#28a745' : '#888' }}>
                {isOnline ? "🟢 Active Now" : "⚪ Offline"}
              </span>
            </div>
        </div>
        <button className="delete-chat-btn" onClick={handleDeleteChat} style={{ border: 'none', background: 'transparent', color: '#dc3545', cursor: 'pointer', fontSize: '1.2rem' }} title="Delete Conversation">
          <FaTrash />
        </button>
      </header>

      <div className="chat-body">
        {messages.map(m => {
          const isMe = String(m.senderProfileId) === String(user?.profileId);
          return (
            <div key={m.id} className={isMe ? "msg-row me" : "msg-row them"}>
              <div className="msg-bubble">
                <p>{m.messageText}</p>
                <small>
                  {new Date(typeof m.sentAt === 'string' && !m.sentAt.endsWith('Z') ? m.sentAt + 'Z' : m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </small>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form className="chat-footer" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit" className="send-btn">Send</button>
      </form>
    </div>
  );
} 