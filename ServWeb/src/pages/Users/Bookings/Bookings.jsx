import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  fetchAllServices,
  fetchAllBookings,
  createBooking,
  updateBookingStatus,
  deleteBooking,
} from "../../../api/AccountApi";
import * as api from "../../../api/AccountApi";
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
import ProviderContactViewer from "../../Services/ProviderContactViewer";

export default function ServicesAndBookings() {
  const Swal = window.Swal;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeContactPanel, setActiveContactPanel] = useState(null);

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

    const now = new Date();
    // Adjust to local ISO string for datetime-local min attribute
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const minDateTime = now.toISOString().slice(0, 16);

    const { value: formValues } = await Swal.fire({
      title: 'Booking Details',
      background: '#ffffff',
      html: `
        <div style="text-align:left; font-family: 'Inter', sans-serif; padding: 10px;">
          <label style="display:block; margin-bottom: 5px; font-weight: 700;">Agreed Price (Rs.)</label>
          <input id="swal-price" class="swal2-input custom-swal-input" type="number" value="${service.price || service.Price}" style="margin-top:0;">
          
          <label style="display:block; margin-top: 15px; margin-bottom: 5px; font-weight: 700;">Scheduled Start</label>
          <input id="swal-start" class="swal2-input custom-swal-input" type="datetime-local" min="${minDateTime}" style="margin-top:0;">
          
          <label style="display:block; margin-top: 15px; margin-bottom: 5px; font-weight: 700;">Scheduled End</label>
          <input id="swal-end" class="swal2-input custom-swal-input" type="datetime-local" min="${minDateTime}" style="margin-top:0;">
          
          <label style="display:block; margin-top: 15px; margin-bottom: 5px; font-weight: 700;">Notes for Provider</label>
          <textarea id="swal-notes" class="swal2-textarea" placeholder="E.g. Address or specific instructions..." style="margin-top:0; border-radius: 8px;"></textarea>
        </div>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Confirm Booking',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#000000',
      preConfirm: () => {
        const price = document.getElementById('swal-price').value;
        const start = document.getElementById('swal-start').value;
        const end = document.getElementById('swal-end').value;
        const notes = document.getElementById('swal-notes').value;
        if (!price || !start || !end) {
          Swal.showValidationMessage('Please fill in Price, Start, and End dates');
          return false;
        }

        const selectedStart = new Date(start);
        const selectedEnd = new Date(end);

        if (selectedEnd <= selectedStart) {
          Swal.showValidationMessage('Scheduled end must be after start time');
          return false;
        }

        // --- Duration Validation: Max 4 Days ---
        const diffMs = selectedEnd - selectedStart;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffDays > 4) {
          Swal.showValidationMessage('Error: Booking duration cannot exceed 4 days');
          return false;
        }

        return { price, start, end, notes };
      },
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
  const handlePayment = (bookingId, amount, categoryName) => {
      navigate('/payments', {
        state: {
          bookingId: bookingId,
          amount: amount,
          planType: "Service Booking",
          categoryName: categoryName || "All Categories"
        }
      });
  };

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

  // Helper: check if status matches (handles both string names and numeric IDs)
  const isStatus = (current, name) => {
    const s = String(current);
    switch (name) {
      case "Pending":   return s === "0" || s === "Pending";
      case "Confirmed": return s === "1" || s === "Confirmed";
      case "InProcess": return s === "2" || s === "InProcess";
      case "Completed": return s === "3" || s === "Completed";
      case "Paid":      return s === "4" || s === "Paid";
      case "Cancelled": return s === "5" || s === "Cancelled";
      case "Disputed":  return s === "6" || s === "Disputed";
      default: return false;
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
{isStatus(currentStatus, "Pending") ? (
  <div className="pending-msg">
    <span className="pending-text"><FaClock /> Waiting...</span>
    {/* Ensure this uses btn-sm to inherit the fixed sizes */}
    <button className="btn-sm danger" onClick={() => handleUpdate(id, 5, "Cancelled")}>
      Cancel
    </button>
  </div>
) : (
                    <>
                      {isStatus(currentStatus, "Confirmed") && (
                        <button className="btn-sm success" onClick={() => handlePayment(id, b.agreedPrice, b.service?.category?.name)}>
                          <FaCheckCircle /> Pay Now
                        </button>
                      )}
                      {isStatus(currentStatus, "InProcess") && (
                        <button className="btn-sm danger" onClick={() => handleUpdate(id, 6, "Disputed")}>
                          <FaExclamationTriangle /> Dispute
                        </button>
                      )}
                      
                      <button className="btn-sm info" onClick={() => viewDetails(b)} title="Details">
                        <FaInfoCircle /> Details
                      </button>
                      <button className="btn-sm bg-secondary text-white border-0" onClick={() => setActiveContactPanel(activeContactPanel === id ? null : id)} title="Contacts">
                        <FaInfoCircle /> Contacts
                      </button>
                      <button className="btn-sm chat" onClick={() => navigate(`/chats/${id}`)} title="Chat">
                        <FaComments /> Chat
                      </button>
                      <button className="btn-sm trash" onClick={() => handleDeleteBooking(id)} aria-label="Delete">
                        <FaTrash />
                      </button>
                    </>
                  )}
                </div>
                {activeContactPanel === id && (
                  <div className="mt-3 pd-2 pb-2">
                    <ProviderContactViewer 
                      profileId={b.providerProfileId || b.ProviderProfileId || b.service?.profileId || b.service?.ProfileId} 
                      realName={b.service?.profile?.fullName || b.service?.Profile?.FullName}
                    />
                  </div>
                )}
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