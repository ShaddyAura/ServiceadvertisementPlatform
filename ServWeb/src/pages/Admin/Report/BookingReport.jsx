import React, { useEffect, useState, useCallback } from "react";
import { fetchAllBookings, fetchAllProfiles, fetchAllServices } from "../../../api/AccountApi";
import { 
  FaShoppingCart, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaRupeeSign, 
  FaSearch, 
  FaFileDownload 
} from "react-icons/fa";
import "./Report.css";

export default function BookingReport() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState(1);

  // Report Metrics
  const [metrics, setMetrics] = useState({
    total: 0,
    completed: 0,
    cancelled: 0,
    disputed: 0,
    totalRevenue: 0,
    totalExpected: 0
  });

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
      const [bookRes, profRes, srvRes] = await Promise.all([
          fetchAllBookings(),
          fetchAllProfiles(),
          fetchAllServices()
      ]);
      const rawData = bookRes.data || [];
      const allProfiles = profRes.data || [];
      const allServices = srvRes.data || [];

      // Create maps
      const profileMap = {};
      allProfiles.forEach(p => {
        profileMap[p.id || p.Id] = p.fullName || `${p.firstName} ${p.lastName}` || "Unknown Provider";
      });

      const serviceMap = {};
      allServices.forEach(s => {
          serviceMap[s.id || s.Id] = s;
      });

      // Map data accurately
      const mappedBookings = rawData.map(b => {
          const srvId = b.serviceId || b.ServiceId;
          const serviceObj = b.service || serviceMap[srvId];
          
          let providerName = serviceObj?.profile?.fullName;
          if (!providerName && serviceObj?.profileId) {
              providerName = profileMap[serviceObj.profileId];
          }

          if (!providerName && b.providerId) {
             providerName = profileMap[b.providerId];
          }

          return {
              ...b,
              resolvedServiceName: serviceObj?.title || "Unknown Service",
              resolvedProviderName: providerName || "N/A"
          }
      });


      // Helper to safely parse status
      const isStatus = (booking, targetInt, targetStr) => {
          const s = String(booking.status ?? booking.Status).toLowerCase();
          return s === String(targetInt) || s === targetStr.toLowerCase();
      };

      // Calculate Metrics from Database Data
      const completed = mappedBookings.filter(b => isStatus(b, 3, "Completed")).length;
      const cancelled = mappedBookings.filter(b => isStatus(b, 4, "Cancelled")).length;
      const disputed = mappedBookings.filter(b => isStatus(b, 5, "Disputed")).length;
      
      // Calculate Revenue (Only from Completed Bookings)
      const revenue = mappedBookings
        .filter(b => isStatus(b, 3, "Completed"))
        .reduce((sum, b) => sum + (b.agreedPrice || b.AgreedPrice || 0), 0);

      // Calculate Expected Revenue (From ALL non-cancelled bookings)
      const expectedRev = mappedBookings
        .reduce((sum, b) => sum + (b.agreedPrice || b.AgreedPrice || 0), 0);

      setMetrics({
        total: mappedBookings.length,
        completed,
        cancelled,
        disputed,
        totalRevenue: revenue,
        totalExpected: expectedRev
      });
      
      setBookings(mappedBookings);
    } catch (error) {
      console.error("Failed to fetch booking report:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // Helper to map status code to display text
  // Helper to map status code to display text (Handle String Enum & Int)
  const getStatusMeta = (status) => {
    const s = String(status).toLowerCase();
    switch (s) {
      case "0": case "pending": return { text: "Pending", cls: "bg-warning-light" };
      case "1": case "confirmed": return { text: "Confirmed", cls: "bg-info-light" };
      case "2": case "in process": case "inprocess": return { text: "In Process", cls: "bg-primary-light" };
      case "3": case "completed": return { text: "Completed", cls: "bg-success-light" };
      case "4": case "cancelled": return { text: "Cancelled", cls: "bg-danger-light" };
      case "5": case "disputed": return { text: "Disputed", cls: "bg-secondary-light" };
      default: return { text: status || "Unknown", cls: "bg-light" };
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.resolvedServiceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.resolvedProviderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.id || b.Id).toString().includes(searchTerm)
  );

  if (loading) return <div className="admin-loader">Generating Report...</div>;

  return (
    <div className="logsheet-wrapper">
      <div className="logsheet-main-title">Booking Logsheet Report</div>
      
      <div className="logsheet-top-bar">
        <div className="logsheet-meta">
          <span>Date: {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
          <span>Document Type: System Generated Log</span>
        </div>
        <div className="logsheet-actions">
          {/* Action to handle print or PDF. window.print() is universally supported. */}
          <button className="logsheet-action-btn" onClick={() => window.print()}>
            <FaFileDownload /> Print / Export PDF
          </button>
        </div>
      </div>

      <div className="logsheet-tabs">
        <button 
          className={`logsheet-tab-btn ${activeSection === 1 ? 'active' : ''}`}
          onClick={() => setActiveSection(1)}>
          1. Metrics Overview
        </button>
        <button 
          className={`logsheet-tab-btn ${activeSection === 2 ? 'active' : ''}`}
          onClick={() => setActiveSection(2)}>
          2. Detailed Ledger
        </button>
      </div>

      {activeSection === 1 && (
        <table className="logsheet-table">
          <thead>
            <tr>
              <th colSpan="5" className="logsheet-table-section-header">Booking Metrics Overview</th>
            </tr>
            <tr>
              <th>Total Bookings</th>
              <th>Completed Jobs</th>
              <th>Cancelled Jobs</th>
              <th>Disputed Jobs</th>
              <th>Total Booking Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{metrics.total}</td>
              <td>{metrics.completed}</td>
              <td>{metrics.cancelled}</td>
              <td>{metrics.disputed}</td>
              <td style={{ fontWeight: 'bold', color: 'green' }}>Rs. {metrics.totalExpected.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      )}

      {activeSection === 2 && (
        <>
          <div style={{ marginBottom: "15px", display: "flex", gap: "10px", alignItems: "center", border: "1px solid #eec4c4", padding: "10px", background: "#fdf5f5" }}>
            <FaSearch color="#888" />
            <input 
              type="text" 
              placeholder="Search Booking ID, Service, or Provider..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "0.85rem" }}
            />
          </div>

          <table className="logsheet-table">
            <thead>
              <tr>
                <th colSpan="6" className="logsheet-table-section-header">Detailed Booking Ledger</th>
              </tr>
              <tr>
                <th>Booking ID</th>
                <th>Service Details</th>
                <th>Provider Name</th>
                <th>Agreed Price (Rs.)</th>
                <th>Scheduled On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => {
                  const statusMeta = getStatusMeta(b.status ?? b.Status);
                  return (
                    <tr key={b.id || b.Id}>
                      <td>#{ (b.id || b.Id).toString().slice(0, 8) }</td>
                      <td><strong>{b.resolvedServiceName}</strong></td>
                      <td>{b.resolvedProviderName}</td>
                      <td>{b.agreedPrice || b.AgreedPrice}</td>
                      <td>{new Date(b.scheduledStart || b.ScheduledStart).toLocaleDateString()}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: statusMeta.cls.includes('success') ? 'green' : (statusMeta.cls.includes('danger') ? 'red' : 'inherit') }}>
                          {statusMeta.text}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '30px', color: '#888' }}>
                    No bookings match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}