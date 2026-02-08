import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import * as signalR from "@microsoft/signalr";
import { FaPaperPlane, FaArrowLeft, FaCircle } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import "./Chats.css";

export default function Chats() {
  const { bookingId } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connection, setConnection] = useState(null);
  const scrollRef = useRef();

  // Mock Data for Initial UI
  useEffect(() => {
    const mockHistory = [
      {
        senderProfileId: "provider-123",
        messageText: "Hello! I received your booking for the house cleaning service.",
        sentAt: new Date(Date.now() - 3600000)
      },
      {
        senderProfileId: user?.profileId,
        messageText: "Hi! Yes, I was wondering if you could come around 10 AM?",
        sentAt: new Date(Date.now() - 3000000)
      },
      {
        senderProfileId: "provider-123",
        messageText: "10 AM works perfectly for me. See you then!",
        sentAt: new Date(Date.now() - 2000000)
      }
    ];
    setMessages(mockHistory);
  }, [user]);

  // SignalR Connection
  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7065/chatHub") 
      .withAutomaticReconnect()
      .build();
    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection && bookingId) {
      connection.start()
        .then(() => {
          connection.invoke("JoinBookingGroup", bookingId);
          connection.on("ReceiveMessage", (msg) => {
            setMessages(prev => [...prev, msg]);
          });
        })
        .catch(err => console.error("SignalR Error: ", err));
    }
  }, [connection, bookingId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      senderProfileId: user?.profileId,
      messageText: input,
      sentAt: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    // API Call would happen here
    setInput("");
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-page-main">
      {/* 1. Chat Header */}
      <div className="chat-header-fixed shadow-sm">
        <button className="btn btn-link text-dark" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <div className="ml-3 d-flex align-items-center">
          <div className="provider-avatar">
            {state?.booking?.service?.title?.charAt(0) || "S"}
          </div>
          <div className="header-info">
            <h6 className="mb-0 font-weight-bold">{state?.booking?.service?.title || "Service Chat"}</h6>
            <small className="text-success"><FaCircle size={8} className="mr-1" /> Active Now</small>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Message Area */}
      <div className="chat-messages-viewport">
        {messages.map((m, i) => {
          const isMe = m.senderProfileId === user?.profileId;
          return (
            <div key={i} className={`message-row ${isMe ? 'sent' : 'received'}`}>
              <div className="message-bubble-wrapper">
                <div className="bubble-content">{m.messageText}</div>
                <div className="bubble-time">
                  {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* 3. Fixed Bottom Input Area */}
      <form className="chat-input-footer" onSubmit={handleSend}>
        <div className="input-group-custom">
          <input 
            type="text" 
            placeholder="Type your message here..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="send-circle-btn" disabled={!input.trim()}>
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
}