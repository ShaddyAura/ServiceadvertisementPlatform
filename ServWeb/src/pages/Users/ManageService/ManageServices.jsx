import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { fetchAllServices } from "../../../api/AccountApi";
import "./ManageServices.css";

export default function ViewAllServices() {
  const { loading: authLoading } = useAuth();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = async () => {
    try {
      setLoading(true);
      const serviceRes = await fetchAllServices();
      setServices(serviceRes.data || []);
    } catch (err) {
      console.error("Load failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) loadData();
  }, [authLoading]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = services.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(services.length / itemsPerPage);

  if (authLoading || loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="manage-services-container">
      <div className="header-section">
        <h2 className="main-heading">All Available Services</h2>
        <p className="sub-text">Viewing full service directory</p>
      </div>

      <div className="table-wrapper">
        <table className="custom-data-table">
          <thead>
  <tr>
    <th>SN</th>
    <th>Media</th>
    <th>Service Name</th>
    <th>Description</th>
    <th>Category</th>
    <th>Availability</th>
    <th>Status</th>
    <th className="text-right">Price</th>
  </tr>
</thead>

<tbody>
  {currentItems.length > 0 ? (
    currentItems.map((s, index) => (
      <tr key={s.id || index}>
        <td>{indexOfFirstItem + index + 1}</td>

        <td>
          {s.imageUrl ? (
            <img
              src={`https://localhost:7065${s.imageUrl}`}
              className="service-img"
              alt="service"
            />
          ) : (
            <div className="no-img-placeholder">
              No Image
            </div>
          )}
        </td>

        <td>
          <span className="service-title-text">
            {s.title || "Untitled"}
          </span>
        </td>

        {/* ✅ NEW DESCRIPTION COLUMN */}
        <td>
          <div className="service-description">
            {s.description || "No description available"}
          </div>
        </td>

        <td>
          <span className="badge-category">
            {s.category || "General"}
          </span>
        </td>

        <td>
          <span className="availability-text">
            {s.startTime || "N/A"} - {s.endTime || "N/A"}
          </span>
        </td>

        <td>
          <span
            className={`status-pill ${
              s.status === "Active"
                ? "pill-active"
                : "pill-warning"
            }`}
          >
            {s.status || "Unknown"}
          </span>
        </td>

        <td className="text-right">
          <span className="price-text-bold">
            Rs. {s.price}
          </span>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="8" className="no-data">
        No services found in the database.
      </td>
    </tr>
  )}
</tbody>
        </table>

        {services.length > 0 && (
          <div className="pagination-footer">
            <div className="pagination-info">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, services.length)} of{" "}
              {services.length} services
            </div>

            <div className="pagination-buttons">
              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((prev) => Math.max(1, prev - 1))
                }
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={currentPage === i + 1 ? "active-page" : ""}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(totalPages, prev + 1)
                  )
                }
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}