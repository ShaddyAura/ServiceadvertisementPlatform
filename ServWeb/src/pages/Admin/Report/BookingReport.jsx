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

  // Report Metrics
  const [metrics, setMetrics] = useState({
    total: 0,
    completed: 0,
    cancelled: 0,
    disputed: 0,
    totalRevenue: 0
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


      // Calculate Metrics from Database Data
      const completed = mappedBookings.filter(b => (b.status ?? b.Status) === 3).length;
      const cancelled = mappedBookings.filter(b => (b.status ?? b.Status) === 4).length;
      const disputed = mappedBookings.filter(b => (b.status ?? b.Status) === 5).length;
      
      // Calculate Revenue (Only from Completed Bookings)
      const revenue = mappedBookings
        .filter(b => (b.status ?? b.Status) === 3)
        .reduce((sum, b) => sum + (b.agreedPrice || b.AgreedPrice || 0), 0);

      setMetrics({
        total: mappedBookings.length,
        completed,
        cancelled,
        disputed,
        totalRevenue: revenue
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
  const getStatusMeta = (status) => {
    switch (status) {
      case 0: return { text: "Pending", cls: "bg-warning-light" };
      case 1: return { text: "Confirmed", cls: "bg-info-light" };
      case 2: return { text: "In Process", cls: "bg-primary-light" };
      case 3: return { text: "Completed", cls: "bg-success-light" };
      case 4: return { text: "Cancelled", cls: "bg-danger-light" };
      case 5: return { text: "Disputed", cls: "bg-secondary-light" };
      default: return { text: "Unknown", cls: "bg-light" };
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

      {/* METRICS SUMMARY TABLE */}
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
            <th>Total Cleared Revenue (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{metrics.total}</td>
            <td>{metrics.completed}</td>
            <td>{metrics.cancelled}</td>
            <td>{metrics.disputed}</td>
            <td style={{ fontWeight: 'bold' }}>{metrics.totalRevenue.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      {/* SEARCH AND FILTERS ROW (Rendered as simple table or div inside logsheet) */}
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

      {/* MAIN DATA TABLE */}
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
    </div>
  );
}