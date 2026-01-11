import React from "react"; 

export default function ServicesPage() {
  return (
    <div className="container my-5 text-white">
      <h1 className="fw-bold text-center mb-4">Our Services</h1>
      <p className="text-center mb-5">
        Browse and book our professional services below.
      </p>

      <div className="row g-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div className="col-md-4" key={i}>
            <div className="card shadow-sm p-3 bg-secondary text-white">
              <img
                src={`https://source.unsplash.com/400x250/?service,home,${i}`}
                className="card-img-top rounded"
                alt="service"
              />
              <h5 className="mt-3">Service Title {i}</h5>
              <p>Starting from: ${40 + i * 10}</p>
              <p>⭐ 4.{i} Rating</p>
              <button className="btn btn-primary w-100">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
