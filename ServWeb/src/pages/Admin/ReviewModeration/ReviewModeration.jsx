import React, { useEffect, useState, useCallback } from "react";
import { fetchAllReviews, deleteReview } from "../../../api/AccountApi";
import { FaTrash, FaStar, FaShieldAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import "./ReviewModeration.css";
import "../AdminDashboard.css";

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchAllReviews();
      setReviews(res.data || []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Review?",
      text: "This action cannot be undone. Are you sure this violates platform terms?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Delete",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteReview(id);
        Swal.fire("Deleted!", "Review has been removed.", "success");
        setReviews(reviews.filter(r => (r.id || r.Id) !== id));
      } catch (err) {
        Swal.fire("Error", "Could not delete review.", "error");
      }
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} color={i < rating ? "#f59e0b" : "#e2e8f0"} size={14} />
    ));
  };

  if (loading) return <div className="admin-loader">Loading Reviews...</div>;

  return (
    <div className="admin-dash-container">
      <div className="admin-dash-header">
        <div>
          <h2 className="admin-dash-title"><FaShieldAlt color="#6366f1" /> Content Moderation</h2>
          <p className="admin-dash-subtitle">Monitor and sanitize user reviews across the platform.</p>
        </div>
      </div>

      <div className="admin-chart-card mt-4">
        <div className="admin-chart-header">
          <h5>All Platform Reviews ({reviews.length})</h5>
        </div>
        <div className="mod-table-container">
          <table className="mod-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Service Name</th>
                <th>Customer</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length > 0 ? reviews.map(r => {
                const dateStr = r.createdAt || r.CreatedAt;
                const rDate = dateStr ? new Date(dateStr).toLocaleDateString() : "N/A";
                const sName = r.service?.title || r.service?.Title || "Unknown Service";
                const pName = r.profile?.fullName || r.profile?.FirstName || "Unknown User";
                const comment = r.comment || r.Comment || "";

                return (
                  <tr key={r.id || r.Id}>
                    <td className="mod-date">{rDate}</td>
                    <td className="mod-bold">{sName}</td>
                    <td>{pName}</td>
                    <td><div className="mod-stars">{renderStars(r.rating || r.Rating || 0)}</div></td>
                    <td className="mod-comment">"{comment}"</td>
                    <td>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(r.id || r.Id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="6" className="admin-loader">No reviews found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReviewModeration;
