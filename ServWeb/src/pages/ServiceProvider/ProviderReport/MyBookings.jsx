import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { fetchAllBookings, fetchAllServices } from "../../../api/AccountApi";
import "./myreport.css"; 
import "../../Admin/Report/Report.css";

export default function MyBookings() {
  const { user } = useAuth();
  const [incomingBookings, setIncomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProviderBookings = async () => {
    try {
      setLoading(true);
      const [bookingRes, serviceRes] = await Promise.all([
        fetchAllBookings(),
        fetchAllServices()
      ]);
      const allData = bookingRes.data || [];
      const allServices = serviceRes.data || [];

      // Filter: Show ALL bookings where the user is the PROVIDER
      const providerData = allData.filter(
        (b) => String(b.providerProfileId) === String(user.profileId) || String(b.service?.profileId) === String(user.profileId)
      );
      
      // Inject explicit Service Titles so UI doesn't fallback
      const combinedBookings = providerData.map((b) => {
        const sId = b.serviceId || b.ServiceId;
        const mappedService = allServices.find(s => String(s.id || s.Id) === String(sId));
        return { ...b, service: mappedService || b.service || b.Service };
      });
      
      // Sort by newest booking
      combinedBookings.sort((a, b) => new Date(b.scheduledStart || b.createdAt || b.ScheduledStart) > new Date(a.scheduledStart || a.createdAt || a.ScheduledStart) ? -1 : 1);
      
      setIncomingBookings(combinedBookings);
    } catch (error) {
      console.error("Error loading provider bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.profileId) loadProviderBookings();
  }, [user]);

  if (loading) return <div className="loader">Loading your reports...</div>;

  // Safely map status Int
  const getStatusDisplay = (s) => {
    const map = { 0: "Pending", 1: "Confirmed", 2: "In Process", 3: "Completed", 4: "Paid", 5: "Cancelled", 6: "Disputed" };
    const key = typeof s === 'string' ? { "Pending": 0, "Confirmed": 1, "InProcess": 2, "Completed": 3, "Paid": 4, "Cancelled": 5, "Disputed": 6 }[s] : s;
    return map[key ?? 0] || "Unknown";
  };

  const isCompletedOrPaid = (s) => {
    const key = typeof s === 'string' ? { "Pending": 0, "Confirmed": 1, "InProcess": 2, "Completed": 3, "Paid": 4, "Cancelled": 5, "Disputed": 6 }[s] : s;
    return key === 3 || key === 4;
  };

  // Only calculate revenue for completed or paid items
  const totalRevenue = incomingBookings
    .filter(b => isCompletedOrPaid(b.status ?? b.Status))
    .reduce((sum, b) => sum + Number(b.agreedPrice || b.AgreedPrice || 0), 0);

  return (
    <div className="logsheet-wrapper">
      <div className="logsheet-main-title">Provider Bookings & Revenue Report</div>
      
      <div className="logsheet-top-bar">
        <div className="logsheet-meta">
          <span>Date: {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
          <span>Document Type: Total Bookings Ledger (All Statuses)</span>
        </div>
        <div className="logsheet-actions">
          <button className="logsheet-action-btn" onClick={() => window.print()}>
            Print / Export PDF
          </button>
        </div>
      </div>

      <div style={{ padding: "15px", marginBottom: "15px", background: "#f0f8ff", borderLeft: "5px solid #007bff", borderRadius: "4px" }}>
        <strong>Total Lifetime Revenue: </strong> Rs {totalRevenue.toLocaleString()}
      </div>

      <table className="logsheet-table">
        <thead>
          <tr>
            <th colSpan="6" className="logsheet-table-section-header">Complete Jobs Ledger</th>
          </tr>
          <tr>
            <th>Booking ID</th>
            <th>Service Name</th>
            <th>Client Info</th>
            <th>Status</th>
            <th>Revenue (Agreed Price)</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {incomingBookings.length > 0 ? (
            incomingBookings.map((b) => {
              const id = b.id || b.Id;
              const endDate = b.scheduledEnd || b.ScheduledEnd;

              return (
                <tr key={id}>
                  <td>#{String(id).slice(0, 8)}</td>
                  <td><strong>{b.service?.title || b.service?.Title || b.serviceListing?.title || "Service Job"}</strong></td>
                  <td>{b.profile?.fullName || b.Profile?.FullName || "Valued Client"}</td>
                  <td><b>{getStatusDisplay(b.status ?? b.Status)}</b></td>
                  <td style={{ fontWeight: 'bold', color: 'green' }}>Rs {b.agreedPrice || b.AgreedPrice}</td>
                  <td>{endDate ? new Date(endDate).toLocaleDateString('en-GB') : "N/A"}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" style={{ padding: '30px', color: '#888', textAlign: "center" }}>
                You have no booking records yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}