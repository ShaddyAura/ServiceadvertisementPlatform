import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getServiceReviews } from "../../../api/AccountApi"; // Adjust path as needed
import "./ReviewProvider.css"; // Reuse similar styles

export default function ReviewProvider() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const serviceId = queryParams.get("serviceId");

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    if (!serviceId) return;
    try {
      setLoading(true);
      const res = await getServiceReviews(serviceId);
      setReviews(res.data || []);
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Helper to render stars based on rating number
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <i key={i} className={`${i < rating ? "fas" : "far"} fa-star text-warning`}></i>
    ));
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2 text-muted">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="manage-services-container p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i> Back to Services
        </button>
        <h2 className="main-heading">Service Reviews</h2>
        <div style={{ width: "100px" }}></div> {/* Spacer for alignment */}
      </div>

      <div className="table-responsive bg-white shadow-sm table-red-border">
        <table className="table table-hover mb-0 custom-data-table">
          <thead>
            <tr>
              <th className="pl-4">SN</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length > 0 ? (
              reviews.map((r, index) => (
                <tr key={r.id}>
                  <td className="pl-4">{index + 1}</td>
                  <td>
                    <div className="font-weight-bold">
                      {r.profile?.fullName || "Anonymous"}
                    </div>
                    <small className="text-muted">{r.profile?.email}</small>
                  </td>
                  <td>
                    <div className="star-rating">
                      {renderStars(r.rating)}
                      <span className="ml-2">({r.rating}/5)</span>
                    </div>
                  </td>
                  <td>
                    <div className="review-comment-text text-wrap" style={{ maxWidth: "400px" }}>
                      {r.comment}
                    </div>
                  </td>
                  <td>
                    <small className="text-muted">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </small>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-5 text-muted">
                  No reviews yet for this service.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}