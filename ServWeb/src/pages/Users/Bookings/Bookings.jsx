import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  fetchAllServices,
  fetchAllBookings,
  createBooking,
  updateBookingStatus,
  deleteBooking
} from "../../../api/AccountApi";
import {
  FaPlus,
  FaTrash,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaComments,
  FaSpinner,
  FaHandshake,
  FaExclamationTriangle,
  FaInfoCircle
} from "react-icons/fa";
import "./Bookings.css";

export default function ServicesAndBookings() {
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

      const combinedBookings = rawBookings.map(b => {
        const service = allServices.find(
          s => String(s.id || s.Id) === String(b.serviceId || b.ServiceId)
        );
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

  // --- 1. HANDLE NEW BOOKING ---
  const handleAddBooking = async (service) => {
    if (String(user.profileId) === String(service.profileId || service.ProfileId)) {
      return Swal.fire("Invalid Action", "You cannot book your own service.", "warning");
    }

    const { value: formValues } = await Swal.fire({
  title: 'Booking Details',
  // 1. Force White Background and Black Text
  background: '#ffffff', // Force white background
  html: `
    <div style="text-align:left; font-family: 'Inter', sans-serif; padding: 10px;">
      <label style="display:block; margin-bottom: 5px; font-weight: 700;">Agreed Price (Rs.)</label>
      <input id="swal-price" class="swal2-input custom-swal-input" type="number" value="${service.price || service.Price}" style="margin-top:0;">
      
      <label style="display:block; margin-top: 15px; margin-bottom: 5px; font-weight: 700;">Scheduled Start</label>
      <input id="swal-start" class="swal2-input custom-swal-input" type="datetime-local" style="margin-top:0;">
      
      <label style="display:block; margin-top: 15px; margin-bottom: 5px; font-weight: 700;">Scheduled End</label>
      <input id="swal-end" class="swal2-input custom-swal-input" type="datetime-local" style="margin-top:0;">
      
      <label style="display:block; margin-top: 15px; margin-bottom: 5px; font-weight: 700;">Notes for Provider</label>
      <textarea id="swal-notes" class="swal2-textarea" placeholder="E.g. Address or specific instructions..." style="margin-top:0; border-radius: 8px;"></textarea>
    </div>`,
  focusConfirm: false,
  showCancelButton: true,
  confirmButtonText: 'Confirm Booking',
  confirmButtonColor: '#dc3545', // Matches your red theme
  cancelButtonColor: '#000000',   // Matches your black theme
  preConfirm: () => {
    const price = document.getElementById('swal-price').value;
    const start = document.getElementById('swal-start').value;
    const end = document.getElementById('swal-end').value;
    const notes = document.getElementById('swal-notes').value;
    if (!price || !start || !end) {
      Swal.showValidationMessage('Please fill in Price, Start, and End dates');
      return false;
    }
    return { price, start, end, notes };
  },
  // 2. Add custom class for more styling control
  customClass: {
    popup: 'white-background-popup',
    title: 'black-title'
  }
});

    if (formValues) {
      try {
        const bookingData = {
          serviceId: service.id || service.Id,
          profileId: user.profileId, // Booker
          providerProfileId: service.profileId || service.ProfileId, // Owner
          agreedPrice: parseFloat(formValues.price),
          scheduledStart: new Date(formValues.start).toISOString(),
          scheduledEnd: new Date(formValues.end).toISOString(),
          notes: formValues.notes || "No additional notes"
        };

        await createBooking(bookingData);
        Swal.fire("Success", "Booking request sent to provider.", "success");
        loadData();
      } catch (error) {
        Swal.fire("Error", "Failed to create booking.", "error");
      }
    }
  };

  // --- 2. HANDLE STATUS UPDATES (Customer Actions Only) ---
  const handleUpdate = async (id, status, statusName) => {
    if (!id) return;

    if (status === 5) {
      const confirm = await Swal.fire({
        title: 'Raise Dispute?',
        text: "This flags the booking for intervention.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33'
      });
      if (!confirm.isConfirmed) return;
    }

    try {
      await updateBookingStatus(id, status);
      Swal.fire("Updated", `Status is now: ${statusName}`, "success");
      loadData();
    } catch (error) {
      Swal.fire("Error", "Could not update status.", "error");
    }
  };

  // --- 3. HANDLE DELETE ---
  const handleDeleteBooking = async (id) => {
    const res = await Swal.fire({
      title: "Delete Record?",
      text: "This removes the history permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545"
    });

    if (res.isConfirmed) {
      try {
        await deleteBooking(id);
        Swal.fire("Deleted", "Record removed.", "success");
        loadData();
      } catch (error) {
        Swal.fire("Error", "Failed to delete.", "error");
      }
    }
  };

  // --- 4. VIEW DETAILS ---
  const viewDetails = (b) => {
    Swal.fire({
      title: 'Booking Info',
      html: `
        <div style="text-align:left;">
          <p><b>Price:</b> Rs. ${b.agreedPrice || b.AgreedPrice}</p>
          <p><b>Start:</b> ${new Date(b.scheduledStart || b.ScheduledStart).toLocaleString()}</p>
          <p><b>End:</b> ${new Date(b.scheduledEnd || b.ScheduledEnd).toLocaleString()}</p>
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

  if (loading) return <div className="loader">Loading Services...</div>;

  const exploreServices = services.filter(s => String(s.profileId || s.ProfileId) !== String(user.profileId));
  const myBookings = bookings.filter(b => String(b.profileId || b.ProfileId) === String(user.profileId));

  return (
    <div className="page-container">
      
      {/* SECTION 1: ALL SERVICES (EXPLORE) */}
      <h3 className="section-title">Explore & Book Services</h3>
      <div className="grid">
        {exploreServices.length > 0 ? (
          exploreServices.map(s => (
            <div className="card service-card" key={s.id || s.Id}>
              <h5>{s.title || s.Title}</h5>
              <p className="price">Rs. {s.price || s.Price}</p>
              <button className="btn primary" onClick={() => handleAddBooking(s)}>
                <FaPlus /> Book Now
              </button>
            </div>
          ))
        ) : (
          <p className="muted">No services available to book at the moment.</p>
        )}
      </div>

      {/* SECTION 2: MY BOOKINGS (OUTGOING) */}
      <h3 className="section-title mt">Your Bookings</h3>
      <div className="grid">
        {myBookings.length > 0 ? (
          myBookings.map(b => {
            const id = b.id || b.Id;
            const currentStatus = b.status ?? b.Status;
            const statusInfo = getStatusDisplay(currentStatus);
            return (
              <div className="card booking-card" key={id}>
                <div className={`status-tag ${statusInfo.cls}`}>{statusInfo.icon} {statusInfo.text}</div>
                <h5>{b.service?.title || "Service Title"}</h5>
                <p className="small">Provider: {b.service?.profile?.fullName || "Service Provider"}</p>
                
                <div className="action-row">
                  {currentStatus === 0 && (
                    <button className="btn-sm danger" onClick={() => handleUpdate(id, 4, "Cancelled")}>
                      Cancel Request
                    </button>
                  )}
                  {currentStatus === 2 && (
                    <button className="btn-sm danger" onClick={() => handleUpdate(id, 5, "Disputed")}>
                      Dispute
                    </button>
                  )}
                  
                  <button className="btn-sm info" onClick={() => viewDetails(b)} title="Details">
                    <FaInfoCircle />
                  </button>
                  <button className="btn-sm trash" onClick={() => handleDeleteBooking(id)} title="Delete">
                    <FaTrash />
                  </button>
                  <button className="btn-sm chat" onClick={() => navigate(`/chats/${id}`)} title="Chat">
                    <FaComments />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="muted">You haven't made any bookings yet.</p>
        )}
      </div>
    </div>
  );
}