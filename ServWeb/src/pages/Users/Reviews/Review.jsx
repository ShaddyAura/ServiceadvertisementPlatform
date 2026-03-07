import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { createReview } from "../../../api/AccountApi";
import "./Review.css";

export default function SubmitReview({ serviceId, onReviewAdded }) {
  const { user } = useAuth();
  const Swal = window.Swal;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hover, setHover] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      Swal.fire("Wait!", "You must be logged in to leave a review.", "warning");
      return;
    }

    const reviewDto = {
      rating: rating,
      comment: comment,
      profileId: user.profileId,
      serviceId: serviceId
    };

    try {
      setSubmitting(true);
      await createReview(reviewDto);
      
      Swal.fire({
        icon: "success",
        title: "Review Submitted",
        text: "Thank you for your feedback!",
        timer: 2000,
        showConfirmButton: false
      });

      setComment("");
      setRating(5);
      
      // Refresh the review list if the parent provided a callback
      if (onReviewAdded) onReviewAdded();
      
    } catch (err) {
      console.error("Submit failed", err);
      Swal.fire("Error", "Could not post your review. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 mb-4 animate-slide-up">
      <div className="card-header bg-white py-3">
        <h5 className="m-0 font-weight-bold text-dark">Leave a Review</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {/* Star Rating Selector */}
          <div className="mb-3">
            <label className="small font-weight-bold d-block mb-2">Your Rating</label>
            <div className="star-rating">
              {[...Array(5)].map((star, index) => {
                const ratingValue = index + 1;
                return (
                  <button
                    type="button"
                    key={index}
                    className={`btn-star ${ratingValue <= (hover || rating) ? "on" : "off"}`}
                    onClick={() => setRating(ratingValue)}
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(0)}
                  >
                    <span className="star">&#9733;</span>
                  </button>
                );
              })}
              <span className="ml-3 text-muted small">{rating}/5 Stars</span>
            </div>
          </div>

          {/* Comment Box */}
          <div className="mb-3">
            <label className="small font-weight-bold">Your Feedback</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Tell others about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="text-right">
            <button 
              type="submit" 
              className="btn btn-danger px-4 font-weight-bold" 
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Post Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}