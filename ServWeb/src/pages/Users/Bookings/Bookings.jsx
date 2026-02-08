import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaComments, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaTrash } from "react-icons/fa";
// Centralized API imports from AccountApi as requested
import { 
  fetchAllBookings, 
  fetchAllServices, 
  updateBookingStatus, 
  deleteBooking 
} from "../../../api/AccountApi"; 
import "./Bookings.css";

export default function Bookings() {
  const navigate = useNavigate();
  const Swal = window.Swal;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Parallel fetch for Bookings and Services from AccountApi
      const [bookingRes, serviceRes] = await Promise.all([
        fetchAllBookings(),
        fetchAllServices()
      ]);

      const rawBookings = bookingRes.data || [];
      const allServices = serviceRes.data || [];

      // 2. Map Service details into Bookings for full data availability
      const combinedData = rawBookings.map(b => {
        const sId = b.serviceId || b.ServiceId;
        const serviceInfo = (b.service || b.Service) || allServices.find(s => (s.id || s.Id) === sId);
        
        return {
          ...b,
          displayService: serviceInfo || { title: "Service Unavailable", price: "N/A" }
        };
      });

      setBookings(combinedData);
    } catch (err) {
      console.error("❌ API Fetch Error:", err);
      setError("Failed to load your activity. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, newStatus);
      Swal.fire({ icon: 'success', title: 'Status Updated', timer: 1000, showConfirmButton: false });
      loadData(); // Refresh list to sync with RabbitMQ/DB updates
    } catch (err) {
      Swal.fire('Error', 'Could not update status.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Remove Booking?',
      text: "This will delete the booking record permanently.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, delete'
    });

    if (result.isConfirmed) {
      try {
        await deleteBooking(id);
        setBookings(prev => prev.filter(b => (b.id || b.Id) !== id));
        Swal.fire('Deleted', 'Booking has been removed.', 'success');
      } catch (err) {
        Swal.fire('Error', 'Delete failed.', 'error');
      }
    }
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case 0: return { bg: "#fff3cd", text: "#856404", label: "Pending", icon: <FaClock className="me-1" /> };
      case 1: return { bg: "#d4edda", text: "#155724", label: "Confirmed", icon: <FaCheckCircle className="me-1" /> };
      case 2: return { bg: "#f8d7da", text: "#721c24", label: "Cancelled", icon: <FaTimesCircle className="me-1" /> };
      default: return { bg: "#e2e3e5", text: "#383d41", label: "Updated", icon: <FaClock className="me-1" /> };
    }
  };

  if (loading) return (
    <div className="text-center p-5">
      <div className="spinner-border text-danger" role="status"></div>
      <p className="mt-2 text-muted">Loading your bookings...</p>
    </div>
  );

  return (
    <div className="bookings-page p-4">
      <div className="header-section mb-4">
        <h2 className="main-heading">
          <FaCalendarAlt className="text-danger me-2" /> My Activity
        </h2>
      </div>

      <div className="row">
        {bookings.map((b) => {
          const bId = b.id || b.Id;
          const status = b.status !== undefined ? b.status : b.Status;
          const details = getStatusDetails(status);
          const service = b.displayService;

          return (
            <div className="col-md-6 col-lg-4 mb-4" key={bId}>
              <div className="card booking-card border-0 shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="status-badge" style={{ backgroundColor: details.bg, color: details.text }}>
                      {details.icon} {details.label}
                    </span>
                    <button className="btn btn-link text-muted p-0" onClick={() => handleDelete(bId)}>
                       <FaTrash size={14} />
                    </button>
                  </div>

                  <h5 className="service-title mb-1 fw-bold">{service.title || service.Title}</h5>
                  <p className="text-muted small mb-3">ID: #{bId.substring(0, 8)}</p>
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="booking-date text-muted small">
                      {new Date(b.scheduledAt || b.ScheduledAt).toLocaleDateString()}
                    </span>
                    <span className="price-tag fw-bold text-success">Rs. {service.price || service.Price}</span>
                  </div>

                  <div className="mt-auto">
                    {status === 0 && (
                      <div className="d-flex gap-2 mb-2">
                        <button className="btn btn-sm btn-success flex-grow-1" onClick={() => handleUpdateStatus(bId, 1)}>Accept</button>
                        <button className="btn btn-sm btn-outline-danger flex-grow-1" onClick={() => handleUpdateStatus(bId, 2)}>Reject</button>
                      </div>
                    )}
                    <button 
                      className="btn btn-danger w-100 py-2 fw-bold" 
                      onClick={() => navigate(`/Chats`, { state: { booking: b } })}
                    >
                      <FaComments className="me-2" /> Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}