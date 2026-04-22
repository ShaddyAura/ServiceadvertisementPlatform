import React, { useEffect, useState, useCallback } from "react";
import { fetchAllBookings, fetchAllProfiles, fetchAllServices, updateBookingStatus } from "../../../api/AccountApi";
import { 
  FaExclamationTriangle, FaGavel, FaRegClock, 
  FaCheckCircle, FaBan, FaUser, FaUserTie,
  FaInfoCircle
} from "react-icons/fa";
import Swal from "sweetalert2";
import "./SystemSettings.css";

const SystemSettings = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  const isDisputed = (booking) => {
    const s = String(booking.status ?? booking.Status).toLowerCase();
    return s === "disputed" || s === "6";
  };

  const loadDisputes = useCallback(async () => {
    try {
      setLoading(true);
      const [bookRes, profRes, srvRes] = await Promise.all([
        fetchAllBookings(),
        fetchAllProfiles(),
        fetchAllServices()
      ]);

      const allBookings = bookRes.data || [];
      const allProfiles = profRes.data || [];
      const allServices = srvRes.data || [];

      // Build lookup maps
      const profileMap = {};
      allProfiles.forEach(p => {
        profileMap[p.id || p.Id] = p.fullName || `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Unknown";
      });

      const serviceMap = {};
      allServices.forEach(s => {
        serviceMap[s.id || s.Id] = s.title || s.Title || "Unknown Service";
      });

      // Filter disputed bookings
      const disputedBookings = allBookings
        .filter(b => isDisputed(b))
        .map(b => {
          const bookingId = b.id || b.Id;
          const serviceId = b.serviceId || b.ServiceId;
          const customerId = b.profileId || b.ProfileId;
          const providerId = b.providerProfileId || b.ProviderProfileId;
          const createdAt = b.createdAt || b.CreatedAt;

          return {
            id: bookingId,
            serviceName: serviceMap[serviceId] || "Unknown Service",
            customerName: profileMap[customerId] || "Unknown Customer",
            providerName: profileMap[providerId] || "Unknown Provider",
            agreedPrice: b.agreedPrice || b.AgreedPrice || 0,
            scheduledStart: b.scheduledStart || b.ScheduledStart,
            notes: b.notes || b.Notes || "No description provided",
            createdAt: createdAt,
            timeAgo: getTimeAgo(createdAt)
          };
        });

      setDisputes(disputedBookings);
    } catch (error) {
      console.error("Error loading disputes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return "Unknown";
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now - then;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) return "Just now";
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const handleResolve = async (bookingId, action) => {
    const statusMap = {
      complete: { value: 3, label: "Completed", text: "This booking will be marked as successfully completed." },
      cancel: { value: 4, label: "Cancelled", text: "This booking will be cancelled and the dispute closed." }
    };
    const chosen = statusMap[action];

    const result = await Swal.fire({
      title: `Mark as ${chosen.label}?`,
      text: chosen.text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: action === "complete" ? "#27ae60" : "#e74c3c",
      confirmButtonText: `Yes, ${chosen.label}`,
      cancelButtonText: "Back"
    });

    if (result.isConfirmed) {
      try {
        await updateBookingStatus(bookingId, chosen.value);
        Swal.fire("Done!", `Dispute resolved — booking marked as ${chosen.label}.`, "success");
        loadDisputes(); // Refresh
      } catch (err) {
        console.error("Error resolving dispute:", err);
        Swal.fire("Error", "Failed to update booking status. Check backend.", "error");
      }
    }
  };

  // Tab State
  const [activeTab, setActiveTab] = useState("disputes");
  const [commissionRate, setCommissionRate] = useState(5.0);

  const handleSaveSettings = () => {
    Swal.fire("Saved", `Platform Commission updated to ${commissionRate}%.`, "success");
  };

  if (loading) return <div className="admin-loader">Loading...</div>;

  return (
    <div className="disputes-container">
      <div className="admin-dash-header mb-4">
        <div>
          <h2 className="admin-dash-title">System Management</h2>
          <p className="admin-dash-subtitle">Manage disputes and platform economics</p>
        </div>
      </div>

      <div className="admin-tabs mb-4" style={{ display: 'flex', gap: '15px' }}>
        <button 
            className={`btn ${activeTab === 'disputes' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab("disputes")}
        >
            <FaGavel /> Active Disputes
        </button>
        <button 
            className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab("settings")}
        >
            <FaInfoCircle /> Platform Settings
        </button>
      </div>

      {activeTab === "settings" && (
          <div className="admin-chart-card p-4">
             <h5>Platform Economics</h5>
             <hr/>
             <div className="form-group mb-4" style={{ maxWidth: "300px" }}>
                 <label>Global Commission Fee (%)</label>
                 <div className="input-group">
                     <input 
                        type="number" 
                        step="0.1"
                        className="form-control" 
                        value={commissionRate} 
                        onChange={(e) => setCommissionRate(e.target.value)} 
                     />
                     <span className="input-group-text">%</span>
                 </div>
                 <small className="text-muted">This percentage is automatically deducted from all completed bookings.</small>
             </div>
             <button className="btn btn-success" onClick={handleSaveSettings}>Save Settings</button>
          </div>
      )}

      {activeTab === "disputes" && (
          <>
            <div className="disputes-header" style={{ marginTop: 0 }}>
                <div>
                <h2><FaExclamationTriangle className="header-icon" /> Resolution Center</h2>
                </div>
                <div className="disputes-count-badge">
                {disputes.length} Active Dispute{disputes.length !== 1 ? 's' : ''}
                </div>
            </div>

            {disputes.length === 0 ? (
                <div className="no-disputes">
                <FaCheckCircle className="no-disputes-icon" />
                <h4>No Active Disputes</h4>
                <p>All bookings are running smoothly. No conflicts detected.</p>
                </div>
            ) : (
                <div className="disputes-list">
                {disputes.map((d) => (
                    <div className="dispute-card" key={d.id}>
                    <div className="dispute-card-left">
                        <div className="dispute-badge">
                        <FaExclamationTriangle /> DISPUTED
                        </div>
                        <div className="dispute-id">#{(d.id).toString().slice(0, 8)}</div>
                    </div>

                    <div className="dispute-card-center">
                        <div className="dispute-parties">
                        <div className="dispute-party">
                            <FaUser className="party-icon customer" />
                            <div>
                            <span className="party-role">Customer</span>
                            <span className="party-name">{d.customerName}</span>
                            </div>
                        </div>
                        <span className="vs-label">vs</span>
                        <div className="dispute-party">
                            <FaUserTie className="party-icon provider" />
                            <div>
                            <span className="party-role">Provider</span>
                            <span className="party-name">{d.providerName}</span>
                            </div>
                        </div>
                        </div>
                        <div className="dispute-service">
                        <strong>Service:</strong> {d.serviceName} &nbsp;|&nbsp; 
                        <strong>Amount:</strong> Rs. {d.agreedPrice.toLocaleString()}
                        </div>
                        {d.notes && d.notes !== "No description provided" && (
                        <div className="dispute-notes">
                            <FaInfoCircle /> {d.notes}
                        </div>
                        )}
                    </div>

                    <div className="dispute-card-right">
                        <div className="dispute-time">
                        <FaRegClock /> {d.timeAgo}
                        </div>
                        <div className="dispute-actions">
                        <button 
                            className="dispute-btn resolve"
                            onClick={() => handleResolve(d.id, "complete")}
                        >
                            <FaGavel /> Complete
                        </button>
                        <button 
                            className="dispute-btn cancel"
                            onClick={() => handleResolve(d.id, "cancel")}
                        >
                            <FaBan /> Cancel
                        </button>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            )}
          </>
      )}
    </div>
  );
};

export default SystemSettings;