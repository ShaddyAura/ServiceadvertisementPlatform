import React, { useState } from "react";
import "../Users/css/ManageServices.css";

export default function AdminManageServices() {

  const servicesData = [
    { id: 1, title: "Home Cleaning", status: "Active", user: "John Doe" },
    { id: 2, title: "Plumbing Repair", status: "Pending", user: "Alex Brown" },
    { id: 3, title: "Electrician Service", status: "Active", user: "Emily Smith" },
    { id: 4, title: "AC Servicing", status: "Pending", user: "Michael Lee" },
    { id: 5, title: "Painting Service", status: "Active", user: "Sarah W." },
  ];

  const itemsPerPage = 3;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(servicesData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentServices = servicesData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="manage-services">

      <div className="services-header">
        <h2>Admin – Manage Services</h2>
      </div>

      {currentServices.map(service => (
        <div className="service-card" key={service.id}>

          <div className="service-info">
            <h3>{service.title}</h3>
            <p>Posted by: <strong>{service.user}</strong></p>
          </div>

          <div className="service-right">
            <span className={`status ${service.status.toLowerCase()}`}>
              {service.status}
            </span>

            <div className="actions">
              <button className="edit">Approve</button>
              <button className="delete">Reject</button>
            </div>
          </div>

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
