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

        return (
          <div
            key={id}
            className="chat-list-item"
            onClick={() => navigate(`/chats/${id}`)}
          >
            <h4>Booking #{id}</h4>
            <p>Click to open chat</p>
          </div>
        );
      })}
    </div>
  );
}
