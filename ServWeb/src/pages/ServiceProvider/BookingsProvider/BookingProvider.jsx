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
      await updateBookingStatus(id, status);
      Swal.fire("Updated", `Status is now: ${statusName}`, "success");
      loadData();
    } catch (error) {
      Swal.fire("Error", "Could not update status.", "error");
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
    switch (status) {
      case 0: return { text: "Pending", icon: <FaClock />, cls: "status-pending" };
      case 1: return { text: "Confirmed", icon: <FaCheckCircle />, cls: "status-confirmed" };
      case 2: return { text: "In Process", icon: <FaSpinner className="fa-spin" />, cls: "status-process" };
      case 3: return { text: "Completed", icon: <FaHandshake />, cls: "status-completed" };
      case 4: return { text: "Cancelled", icon: <FaTimesCircle />, cls: "status-cancelled" };
      case 5: return { text: "Disputed", icon: <FaExclamationTriangle />, cls: "status-disputed" };
      default: return { text: "Unknown", icon: null, cls: "" };
    }
  };

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
            return (
              <div className="card booking-card" key={id}>
                <div className={`status-tag ${statusInfo.cls}`}>{statusInfo.icon} {statusInfo.text}</div>
                <h5>{b.service?.title || b.Service?.Title || "Service Request"}</h5>
                <p className="small">Client: <strong>{b.profile?.fullName || b.Profile?.FullName || "A Customer"}</strong></p>
                
                <div className="action-row">
                  {currentStatus === 0 && <button className="btn-sm success" onClick={() => handleUpdate(id, 1, "Confirmed")}>Accept</button>}
                  {currentStatus === 1 && <button className="btn-sm process" onClick={() => handleUpdate(id, 2, "In Process")}>Start Work</button>}
                  {currentStatus === 2 && (
                    <>
                      <button className="btn-sm success" onClick={() => handleUpdate(id, 3, "Completed")}>Finish</button>
                      <button className="btn-sm danger" onClick={() => handleUpdate(id, 5, "Disputed")}>Dispute</button>
                    </>
                  )}
                  
                  {currentStatus < 3 && currentStatus !== 5 && (
                    <button className="btn-sm danger" onClick={() => handleUpdate(id, 4, "Cancelled")}>Cancel</button>
                  )}
                  
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