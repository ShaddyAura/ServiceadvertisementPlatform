import React, { useState } from "react";
import "./Review.css";

export default function Reviews() {
  // Mock data to match your current dashboard style
  const [reviews] = useState([
    {
      id: 1,
      client: "Arjun Thapa",
      service: "Video Editing",
      rating: 5,
      comment: "Excellent work on the promo video! Very professional.",
      date: "2024-03-15",
    },
    {
      id: 2,
      client: "Sarah Jenkins",
      service: "Web Development",
      rating: 4,
      comment: "Great communication, the site looks clean and fast.",
      date: "2024-03-12",
    },
  ]);

  return (
    <div className="manage-services-container p-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="main-heading">Client Reviews</h2>
      </div>

      <div className="table-responsive bg-white shadow-sm table-container-custom">
        <table className="table mb-0 custom-data-table">
          <thead>
            <tr>
              <th className="pl-4">SN</th>
              <th>Client Name</th>
              <th>Service</th>
              <th>Rating</th>
              <th>Feedback</th>
              <th className="text-right pr-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((rev, index) => (
              <tr key={rev.id}>
                <td className="pl-4 font-weight-bold text-muted">{index + 1}</td>
                <td className="service-title-text">{rev.client}</td>
                <td>
                  <span className="service-category-text">{rev.service}</span>
                </td>
                <td>
                  <div className="text-warning">
                    {"★".repeat(rev.rating)}
                    <span className="text-muted">{"★".repeat(5 - rev.rating)}</span>
                  </div>
                </td>
                <td className="text-muted small" style={{ maxWidth: "250px" }}>
                  "{rev.comment}"
                </td>
                <td className="text-right pr-4 font-weight-bold">
                  {rev.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}