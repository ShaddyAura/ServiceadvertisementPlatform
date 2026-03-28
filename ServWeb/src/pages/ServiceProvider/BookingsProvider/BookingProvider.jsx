import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  fetchAllServices,
  fetchAllBookings,
  updateBookingStatus,
  deleteBooking
} from "../../../api/AccountApi";
import {
  FaTrash,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaComments,
  FaUserAlt,
  FaBriefcase,
  FaSpinner,
  FaHandshake,
  FaExclamationTriangle,
  FaInfoCircle
} from "react-icons/fa";
import "./BookingProvider.css";

export default function BookingsProvider() {
  const Swal = window.Swal;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [serviceRes, bookingRes] = await Promise.all([
        fetchAllServices(),
        fetchAllBookings()
      ]);

      const allServices = serviceRes.data || [];
      const rawBookings = bookingRes.data || [];
      
      // Debugging: Check your console to see the structure of your bookings
      console.log("Raw Bookings from API:", rawBookings);
      console.log("Current User Profile ID:", user.profileId);

      const combinedBookings = rawBookings.map(b => {
        const sId = b.serviceId || b.ServiceId;
        const service = allServices.find(s => String(s.id || s.Id) === String(sId));
        return { ...b, service };
      });

      setServices(allServices);
      setBookings(combinedBookings);
    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdate = async (id, status, statusName) => {
    if (!id) return;
    try {
      const res = await updateBookingStatus(id, status);
      console.log("Status update response:", res.status, res);
      Swal.fire("Updated", `Status is now: ${statusName}`, "success");
      loadData();
    } catch (error) {
      console.error("Status update error:", error.response?.status, error.response?.data, error.message);
      Swal.fire("Error", `Could not update status. ${error.response?.data || error.message}`, "error");
    }
  };

  const handleDeleteBooking = async (id) => {
    const res = await Swal.fire({
      title: "Delete Record?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545"
    });
    if (res.isConfirmed) {
      try {
        await deleteBooking(id);
        loadData();
      } catch (error) {
        Swal.fire("Error", "Failed to delete.", "error");
      }
    }
  };

  const viewDetails = (b) => {
    Swal.fire({
      title: 'Booking Info',
      html: `<div style="text-align:left;">
          <p><b>Price:</b> Rs. ${b.agreedPrice || b.AgreedPrice}</p>
          <p><b>Notes:</b> ${b.notes || b.Notes || 'None'}</p>
        </div>`,
      icon: 'info'
    });
  };

  const getStatusDisplay = status => {
    const s = String(status);
    switch (s) {
      case "Pending": case "0": return { text: "Pending", icon: <FaClock />, cls: "status-pending" };
      case "Confirmed": case "1": return { text: "Confirmed", icon: <FaCheckCircle />, cls: "status-confirmed" };
      case "InProcess": case "2": return { text: "In Process", icon: <FaSpinner className="fa-spin" />, cls: "status-process" };
      case "Completed": case "3": return { text: "Completed", icon: <FaHandshake />, cls: "status-completed" };
      case "Paid": case "4": return { text: "Paid", icon: <FaCheckCircle />, cls: "status-paid" };
      case "Cancelled": case "5": return { text: "Cancelled", icon: <FaTimesCircle />, cls: "status-cancelled" };
      case "Disputed": case "6": return { text: "Disputed", icon: <FaExclamationTriangle />, cls: "status-disputed" };
      default: return { text: "Pending", icon: <FaClock />, cls: "status-pending" };
    }
  };

  const statusOptions = [
    { value: 0, label: "Pending" },
    { value: 1, label: "Confirmed" },
    { value: 2, label: "In Process" },
    { value: 3, label: "Completed" },
    { value: 4, label: "Paid" },
    { value: 5, label: "Cancelled" },
    { value: 6, label: "Disputed" },
  ];

  if (loading) return <div className="loader">Loading Dashboard...</div>;

  // Filter: Services I own
  const myOwnServices = services.filter(s => String(s.profileId || s.ProfileId) === String(user.profileId));

  // Filter: Incoming Requests (Where I am the Provider)
  const incomingRequests = bookings.filter(b => {
    const providerId = b.providerProfileId || b.ProviderProfileId;
    // Fallback: If the API doesn't send ProviderProfileId directly, check the nested service object
    const serviceOwnerId = b.service?.profileId || b.service?.ProfileId;
    
    return String(providerId) === String(user.profileId) || String(serviceOwnerId) === String(user.profileId);
  });

  return (
    <div className="page-container">
      
      {/* SECTION 1: MY SERVICES */}
      <h3 className="section-title"><FaBriefcase /> Your Live Services</h3>
      <div className="grid">
        {myOwnServices.length > 0 ? (
          myOwnServices.map(s => (
            <div className="card service-card own-service" key={s.id || s.Id}>
              <span className="badge-own">Active</span>
              <h5>{s.title || s.Title}</h5>
              <p className="price">Rs. {s.price || s.Price}</p>
            </div>
          ))
        ) : (
          <p className="text-muted ml-3">No active services listed.</p>
        )}
      </div>

      {/* SECTION 2: INCOMING REQUESTS (ONLY ONE SECTION NOW) */}
      <h3 className="section-title mt"><FaUserAlt /> Incoming Service Requests</h3>
      <div className="grid">
        {incomingRequests.length > 0 ? (
          incomingRequests.map(b => {
            const id = b.id || b.Id;
            const currentStatus = b.status ?? b.Status;
            const statusInfo = getStatusDisplay(currentStatus);
            
            // Convert string status from API to integer for dropdown
            const statusToInt = (s) => {
              const map = { "Pending": 0, "Confirmed": 1, "InProcess": 2, "Completed": 3, "Paid": 4, "Cancelled": 5, "Disputed": 6 };
              return map[s] ?? (typeof s === "number" ? s : 0);
            };
            const currentStatusInt = statusToInt(currentStatus);
            
            return (
              <div className="card booking-card" key={id}>
                <div className={`status-tag ${statusInfo.cls}`}>{statusInfo.icon} {statusInfo.text}</div>
                <h5>{b.service?.title || b.Service?.Title || "Service Request"}</h5>
                <p className="small">Client: <strong>{b.profile?.fullName || b.Profile?.FullName || "A Customer"}</strong></p>
                
                {/* Provider Status Dropdown */}
                <div className="status-select-row">
                  <label className="status-select-label">Update Status:</label>
                  <select
                    className="status-select"
                    value={currentStatusInt}
                    onChange={(e) => {
                      const newStatus = parseInt(e.target.value);
                      const label = statusOptions.find(o => o.value === newStatus)?.label || "Unknown";
                      handleUpdate(id, newStatus, label);
                    }}
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="action-row">
                  <button className="btn-sm info" onClick={() => viewDetails(b)}><FaInfoCircle /></button>
                  <button className="btn-sm trash" onClick={() => handleDeleteBooking(id)}><FaTrash /></button>
                  <button className="btn-sm chat" onClick={() => navigate(`/chat/${id}`)}><FaComments /></button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-muted ml-3">No incoming requests found.</p>
        )}
      </div>
    </div>
  );
}