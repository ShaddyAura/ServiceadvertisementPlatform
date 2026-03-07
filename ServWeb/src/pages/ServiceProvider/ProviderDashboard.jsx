import React, { useEffect, useState } from "react";
import { 
  FaMoneyBillWave, 
  FaCalendarCheck, 
  FaStar, 
  FaUserClock 
} from "react-icons/fa";
import { fetchAllBookings } from "../../api/AccountApi";
import "./ProviderDashboard.css";

const ProviderDashboard = () => {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeBookings: 0,
    completedJobs: 0,
    avgRating: 4.8 // Mock or fetch from API
  });

  // Example logic to calculate stats from bookings
  useEffect(() => {
    const getDashboardStats = async () => {
      try {
        const res = await fetchAllBookings();
        const data = res.data || [];
        
        const completed = data.filter(b => b.status === 3 || b.Status === 3);
        const active = data.filter(b => b.status === 1 || b.status === 2);
        const earnings = completed.reduce((sum, b) => sum + (b.agreedPrice || b.AgreedPrice || 0), 0);

        setStats(prev => ({
          ...prev,
          totalEarnings: earnings,
          activeBookings: active.length,
          completedJobs: completed.length
        }));
      } catch (err) {
        console.error("Dashboard stats error:", err);
      }
    };
    getDashboardStats();
  }, []);

  return (
    <div className="dashboard-content">
      <div className="welcome-header mb-4">
        <h1>Welcome back, Provider!</h1>
        <p className="text-muted">Here is what's happening with your services today.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-green"><FaMoneyBillWave /></div>
          <div className="stat-info">
            <h3>Rs. {stats.totalEarnings.toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-blue"><FaUserClock /></div>
          <div className="stat-info">
            <h3>{stats.activeBookings}</h3>
            <p>Active Requests</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-teal"><FaCalendarCheck /></div>
          <div className="stat-info">
            <h3>{stats.completedJobs}</h3>
            <p>Completed Jobs</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon icon-yellow"><FaStar /></div>
          <div className="stat-info">
            <h3>{stats.avgRating}</h3>
            <p>Avg Rating</p>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        {/* Quick Tips or Announcements */}
        <div className="col-md-12">
          <div className="info-banner shadow-sm p-4 rounded bg-white">
            <h5><FaStar className="text-warning mr-2" /> Top Tip</h5>
            <p className="mb-0">Responding to booking requests within 1 hour increases your chances of being hired by 40%!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;