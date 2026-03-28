import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllBookings } from "../../../api/AccountApi";
import "./ChatListProvider.css";

export default function ChatListProvider() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await fetchAllBookings();
        setBookings(res.data || []);
      } catch (err) {
        console.error("Failed to load bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  if (loading) return <p>Loading conversations...</p>;

  return (
    <div className="chat-list-container">
      <h2>All Conversations</h2>

      {bookings.length === 0 && <p>No chats available</p>}

      {bookings.map(b => {
        const id = b.id || b.Id;
        const serviceTitle = b.serviceListing?.title || b.resolvedServiceName || "Service Chat";
        const clientName = b.fullName || b.profile?.fullName || "Client";

        return (
          <div
            key={id}
            className="chat-list-item"
            onClick={() => navigate(`/chats/${id}`)}
          >
            <h4>{serviceTitle}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '0.9rem', marginTop: '5px' }}>
              <span>Client: <strong>{clientName}</strong></span>
              <span>Booking #{String(id).slice(0, 8)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
