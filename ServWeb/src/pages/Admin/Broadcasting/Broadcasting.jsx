import React, { useState } from "react";
import { sendBroadcast } from "../../../api/AccountApi";
import { FaBullhorn, FaPaperPlane } from "react-icons/fa";
import Swal from "sweetalert2";
import "./Broadcasting.css";
import "../AdminDashboard.css";

const Broadcasting = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("All Users");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message) {
      Swal.fire("Incomplete", "Please provide a title and message.", "warning");
      return;
    }

    const confirm = await Swal.fire({
      title: "Confirm Broadcast",
      text: `Send this message to ${audience}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Send it!"
    });

    if (confirm.isConfirmed) {
      try {
        setLoading(true);
        await sendBroadcast({ title, message, audience });
        Swal.fire("Sent!", "Broadcast successfully delivered.", "success");
        setTitle("");
        setMessage("");
      } catch (err) {
        Swal.fire("Error", "Failed to send broadcast.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="admin-dash-container">
      <div className="admin-dash-header">
        <div>
          <h2 className="admin-dash-title"><FaBullhorn color="#10b981" /> Global Broadcasting</h2>
          <p className="admin-dash-subtitle">Send push notifications to all users or specific segments.</p>
        </div>
      </div>

      <div className="admin-chart-card mt-4 p-4 broadcast-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-4">
            <label className="fw-bold mb-2">Target Audience</label>
            <select 
                className="form-control" 
                value={audience} 
                onChange={e => setAudience(e.target.value)}
            >
              <option value="All Users">All Registered Users</option>
              <option value="Providers Only">Service Providers Only</option>
            </select>
          </div>

          <div className="form-group mb-4">
            <label className="fw-bold mb-2">Notification Title</label>
            <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Scheduled Maintenance"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={100}
            />
          </div>

          <div className="form-group mb-4">
            <label className="fw-bold mb-2">Message Content</label>
            <textarea 
                className="form-control" 
                rows="5"
                placeholder="Type your announcement here..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                maxLength={500}
            ></textarea>
            <div className="text-end text-muted small mt-1">{message.length}/500</div>
          </div>

          <button 
              type="submit" 
              className="btn btn-primary d-flex align-items-center gap-2"
              disabled={loading}
          >
             <FaPaperPlane /> {loading ? "Sending..." : "Send Broadcast"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Broadcasting;
