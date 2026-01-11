import React, { useState } from "react";
import "./css/ManageServices.css";

export default function ManageServices() {

  const servicesData = [
    {
      id: 1,
      title: "Home Cleaning",
      price: "$100",
      unit: "Per Session",
      desc: "Professional home cleaning service including dusting, vacuuming, and more.",
      img: "/assets/cleaning.jpg",
      status: "Active",
      boosted: true,
      duration: "1:23",
      reviews: [
        { user: "Sarah W.", rating: 5, comment: "Excellent cleaning service!" },
        { user: "David K.", rating: 4, comment: "Very professional staff." },
      ],
    },
    {
      id: 2,
      title: "Plumbing Repair",
      price: "$150",
      unit: "Per Hour",
      desc: "Expert plumbing repair and maintenance services.",
      img: "/assets/plumbing.jpg",
      status: "Pending",
      boosted: true,
      duration: "0:23",
      reviews: [
        { user: "Alex B.", rating: 5, comment: "Quick fix and friendly service." },
      ],
    },
    {
      id: 3,
      title: "Electrician Service",
      price: "$80",
      unit: "Per Hour",
      desc: "Licensed electrician for electrical systems.",
      img: "/assets/electrician.jpg",
      status: "Active",
      boosted: false,
      duration: "1:04",
      reviews: [],
    },
  ];

  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const [openReviewId, setOpenReviewId] = useState(null);

  const totalPages = Math.ceil(servicesData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentServices = servicesData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="manage-services">

      {/* HEADER */}
      <div className="services-header">
        <h2>My Services</h2>
        <button className="add-btn">+ Add New Service</button>
      </div>

      {/* SERVICES */}
      {currentServices.map(service => (
        <div key={service.id}>

          <div
            className="service-card clickable"
            onClick={() =>
              setOpenReviewId(openReviewId === service.id ? null : service.id)
            }
          >
            {service.boosted && <span className="boosted-badge">⭐ Boosted</span>}

            <div className="service-left">
              <div className="media-box">
                <img src={service.img} alt="service" />
                <span className="duration">{service.duration}</span>
              </div>

              <div className="service-info">
                <h3>{service.title}</h3>
                <h4>{service.price} <span>{service.unit}</span></h4>
                <p>{service.desc}</p>
              </div>
            </div>

            <div className="service-right">
              <span className={`status ${service.status.toLowerCase()}`}>
                {service.status}
              </span>

              <div className="actions">
                <button className="edit">✏ Edit</button>
                <button className="delete">🗑 Delete</button>
              </div>
            </div>
          </div>

          {/* REVIEWS SECTION */}
          {openReviewId === service.id && (
            <div className="reviews-panel">
              <h4>Service Reviews</h4>

              {service.reviews.length === 0 ? (
                <p className="no-reviews">No reviews yet for this service.</p>
              ) : (
                service.reviews.map((review, index) => (
                  <div className="review-item" key={index}>
                    <strong>{review.user}</strong>
                    <span>{"★".repeat(review.rating)}</span>
                    <p>"{review.comment}"</p>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      ))}

      {/* PAGINATION */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>

        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            className={currentPage === index + 1 ? "active" : ""}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>

    </div>
  );
}
