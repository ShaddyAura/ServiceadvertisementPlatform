import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { 
  fetchAllBookings, 
  updateBookingStatus, 
  deleteBooking 
} from "../../../api/AccountApi";
import { 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSpinner, 
  FaHandshake, 
  FaInfoCircle, 
  FaComments 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./myreport.css"; 
import "../../Admin/Report/Report.css";

export default function MyBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incomingBookings, setIncomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProviderBookings = async () => {
    try {
      setLoading(true);
      const res = await fetchAllBookings();
      const allData = res.data || [];

      // Filter: Show only bookings where the current user is the PROVIDER
      const providerData = allData.filter(
        (b) => String(b.providerProfileId) === String(user.profileId)
      );
      setIncomingBookings(providerData);
    } catch (error) {
      console.error("Error loading provider bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.profileId) loadProviderBookings();
  }, [user]);

  // --- STATUS UPDATER ---
  const changeStatus = async (id, status, label) => {
    const result = await Swal.fire({
      title: `Set to ${label}?`,
      text: `Do you want to change the booking status to ${label}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
    });

    if (result.isConfirmed) {
      try {
        await updateBookingStatus(id, status);
        Swal.fire("Updated", `Booking is now ${label}`, "success");
        loadProviderBookings();
      } catch (err) {
        Swal.fire("Error", "Failed to update status", "error");
      }
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 0: return { text: "New Request", icon: <FaClock />, cls: "status-pending" };
      case 1: return { text: "Confirmed", icon: <FaCheckCircle />, cls: "status-confirmed" };
      case 2: return { text: "In Progress", icon: <FaSpinner className="fa-spin" />, cls: "status-process" };
      case 3: return { text: "Finished", icon: <FaHandshake />, cls: "status-completed" };
      case 4: return { text: "Cancelled", icon: <FaTimesCircle />, cls: "status-cancelled" };
      default: return { text: "Unknown", icon: null, cls: "" };
    }
  };

  if (loading) return <div className="loader">Loading your jobs...</div>;

  return (
    <div className="logsheet-wrapper">
      <div className="logsheet-main-title">Client Booking Requests Logsheet</div>
      
      <div className="logsheet-top-bar">
        <div className="logsheet-meta">
          <span>Date: {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
          <span>Document Type: Provider Job Ledger</span>
        </div>
        <div className="logsheet-actions">
          <button className="logsheet-action-btn" onClick={() => window.print()}>
            Print / Export PDF
          </button>
        </div>
      </div>

      <table className="logsheet-table">
        <thead>
          <tr>
            <th colSpan="6" className="logsheet-table-section-header">Active & Historical Bookings Ledger</th>
          </tr>
          <tr>
            <th>Booking ID</th>
            <th>Service Requested</th>
            <th>Client Info</th>
            <th>Agreed Price (Rs.)</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {incomingBookings.length > 0 ? (
            incomingBookings.map((b) => {
              const id = b.id || b.Id;
              const currentStatus = b.status ?? b.Status;
              const statusInfo = getStatusInfo(currentStatus);

              return (
                <tr key={id}>
                  <td>#{String(id).slice(0, 8)}</td>
                  <td><strong>{b.serviceListing?.title || "Service Job"}</strong></td>
                  <td>{b.profile?.fullName || "Valued Client"}</td>
                  <td style={{ fontWeight: 'bold' }}>{b.agreedPrice}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: statusInfo.cls.includes('success') || statusInfo.cls.includes('completed') ? 'green' : (statusInfo.cls.includes('cancelled') ? 'red' : 'inherit') }}>
                      {statusInfo.text}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {currentStatus === 0 && (
                        <>
                          <button className="btn-sm success" onClick={() => changeStatus(id, 1, "Confirmed")}>Accept</button>
                          <button className="btn-sm danger" onClick={() => changeStatus(id, 4, "Cancelled")}>Reject</button>
                        </>
                      )}
                      {currentStatus === 1 && (
                        <button className="btn-sm primary" onClick={() => changeStatus(id, 2, "In Process")}>Start</button>
                      )}
                      {currentStatus === 2 && (
                        <button className="btn-sm success" onClick={() => changeStatus(id, 3, "Completed")}>Finish</button>
                      )}
                      <button className="btn-sm chat" onClick={() => navigate(`/chats/${id}`)}>
                        <FaComments /> Chat
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" style={{ padding: '30px', color: '#888' }}>
                You have no active booking requests yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}