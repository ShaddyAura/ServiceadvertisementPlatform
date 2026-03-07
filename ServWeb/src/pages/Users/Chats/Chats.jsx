import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "../../../context/AuthContext";
import {
  sendMessage,
  getChatHistory,
  fetchAllBookings
} from "../../../api/AccountApi";
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

  const scrollRef = useRef();

  // ✅ LOAD BOOKING + HISTORY
  useEffect(() => {
    if (!bookingId) return;

    const loadChat = async () => {
      try {
        setLoading(true);

        const [historyRes, bookingsRes] = await Promise.all([
          getChatHistory(bookingId),
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
  }, [bookingId]);

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
    if (!connection || !bookingId) return;

    const startConnection = async () => {
      try {
        if (connection.state === "Disconnected") {
          await connection.start();
          await connection.invoke("JoinBookingGroup", bookingId);

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
                  // ✅ Matches standard key from backend
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
  }, [connection, bookingId]);

  // ✅ AUTO SCROLL
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ SEND HANDLER (FIXED)
  const handleSend = async e => {
    e.preventDefault();
    if (!input.trim() || !booking || !user) return;

    // Determine who is receiving the message
    const providerId = booking.providerProfileId || booking.ProviderProfileId;
    const customerId = booking.profileId || booking.ProfileId; // This is the Booker/Customer
    
    const isMeProvider = String(providerId) === String(user.profileId);
    
    // If I am provider, receiver is customer. If I am customer, receiver is provider.
    const receiverId = isMeProvider ? customerId : providerId;

    try {
      await sendMessage({
        BookingId: bookingId,
        SenderProfileId: user.profileId,
        ReceiverProfileId: receiverId, // ✅ Added Receiver mapping
        MessageText: input.trim()
      });

      setInput("");
    } catch (err) {
      console.error("Send error:", err);
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
      <header className="chat-header">
        <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
        <div className="user-info">
          <h3>{chatUserName || "Chat"}</h3>
          <span className="online-status">Online</span>
        </div>
      </header>

      <div className="chat-body">
        {messages.map(m => {
          const isMe = String(m.senderProfileId) === String(user?.profileId);
          return (
            <div key={m.id} className={isMe ? "msg-row me" : "msg-row them"}>
              <div className="msg-bubble">
                <p>{m.messageText}</p>
                <small>
                  {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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