import React, { useEffect, useState } from "react";
import { 
  FaMoneyBillWave, 
  FaCalendarCheck, 
  FaStar, 
  FaUserClock,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { fetchAllBookings, fetchProfileById, GetStrikeStatus, claimDailyReward } from "../../api/AccountApi";
import "./ProviderDashboard.css";
const earningsData = [
  { month: "Jan", earnings: 2400 },
  { month: "Feb", earnings: 3800 },
  { month: "Mar", earnings: 3200 },
  { month: "Apr", earnings: 5100 },
  { month: "May", earnings: 4200 },
  { month: "Jun", earnings: 6800 },
  { month: "Jul", earnings: 5900 },
];

const weeklyData = [
  { day: "Mon", jobs: 3 },
  { day: "Tue", jobs: 5 },
  { day: "Wed", jobs: 2 },
  { day: "Thu", jobs: 7 },
  { day: "Fri", jobs: 4 },
  { day: "Sat", jobs: 6 },
  { day: "Sun", jobs: 1 },
];

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeBookings: 0,
    completedJobs: 0,
    avgRating: 4.8
  });
  const [profile, setProfile] = useState({ boostingPoints: 0, fullName: "Provider", walletId: null });
  const [strikeInfo, setStrikeInfo] = useState({ canClaim: false, currentStrike: 0 });
  const [recentBookings, setRecentBookings] = useState([]);

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

        // Get recent bookings for the table
        setRecentBookings(data.slice(0, 5));
      } catch (err) {
        console.error("Dashboard stats error:", err);
      }
      
      try {
        if (user?.profileId) {
          const profileRes = await fetchProfileById(user.profileId);
          const profData = profileRes.data || {};
          setProfile(profData);
          
          if (profData.walletId) {
            const strikeRes = await GetStrikeStatus(profData.walletId);
            setStrikeInfo(strikeRes.data);
          }
        }
      } catch (err) {
        console.error("Error loading profile/strike info:", err);
      }
    };
    getDashboardStats();
  }, [user]);

  const statCards = [
    { 
      label: "Total Revenue", 
      value: `Rs. ${stats.totalEarnings.toLocaleString()}`, 
      icon: <FaMoneyBillWave />, 
      trend: "+18.2%", 
      trendUp: true,
      color: "provider-card-emerald"
    },
    { 
      label: "Active Requests", 
      value: stats.activeBookings, 
      icon: <FaUserClock />, 
      trend: "+5 new", 
      trendUp: true,
      color: "provider-card-blue"
    },
    { 
      label: "Completed Jobs", 
      value: stats.completedJobs, 
      icon: <FaCalendarCheck />, 
      trend: "+12 this week", 
      trendUp: true,
      color: "provider-card-violet"
    },
    { 
      label: "Avg Rating", 
      value: stats.avgRating, 
      icon: <FaStar />, 
      trend: "Top 10%", 
      trendUp: true,
      color: "provider-card-amber"
    },
  ];

  const getStatusLabel = (status) => {
    switch (status) {
      case 0: return { text: "Pending", cls: "status-pending" };
      case 1: return { text: "Accepted", cls: "status-active" };
      case 2: return { text: "In Progress", cls: "status-active" };
      case 3: return { text: "Completed", cls: "status-completed" };
      case 4: return { text: "Cancelled", cls: "status-cancelled" };
      default: return { text: "Unknown", cls: "status-pending" };
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 19) return "Good afternoon";
    return "Welcome";
  };

  return (
    <div className="provider-dash">
      {/* Hero Banner */}
      <div className="provider-hero">
        <div className="provider-hero-content">
          <div className="provider-hero-text">
            <h1>{getGreeting()}, {user?.fullname?.split(' ')[0] || "Provider"}! 👋</h1>
            <p>Here's what's happening with your services today.</p>
          </div>
          <div className="provider-hero-badge">
            <FaStar className="provider-hero-star" />
            <span>Pro Member</span>
          </div>
          {strikeInfo.canClaim && (
            <button 
              onClick={async () => {
                setStrikeInfo(prev => ({ ...prev, canClaim: false }));
                try {
                  const res = await claimDailyReward(user.profileId);
                  setProfile(prev => ({ ...prev, boostingPoints: res.data.pointsBalance }));
                  Swal.fire({ title: 'Bonus!', text: `+2 Pts daily login added`, icon: 'success', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
                } catch (err) {
                  Swal.fire({ title: 'Oops', text: err.response?.data?.message || 'Reward already claimed.', icon: 'info', toast: true, position: 'top-end', timer: 3000, showConfirmButton: false });
                  setStrikeInfo(prev => ({ ...prev, canClaim: true }));
                }
              }} 
              style={{ padding: '8px 16px', background: '#ff9800', border: 'none', borderRadius: '20px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginLeft: '20px' }}
            >
              🎯 Claim 2 Pts
            </button>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="provider-stats-grid">
        {statCards.map((card, i) => (
          <div className={`provider-stat-card ${card.color}`} key={i}>
            <div className="provider-stat-icon-circle">
              {card.icon}
            </div>
            <div className="provider-stat-details">
              <span className="provider-stat-lbl">{card.label}</span>
              <h3 className="provider-stat-val">{card.value}</h3>
              <span className="provider-stat-trend">
                {card.trendUp ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                {card.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="provider-charts-row">
        <div className="provider-chart-card provider-chart-main">
          <div className="provider-chart-head">
            <h5>💰 Monthly Earnings</h5>
          </div>
          <div className="provider-chart-area">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={earningsData} barSize={32}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}
                  formatter={(value) => [`Rs. ${value}`, 'Earnings']}
                />
                <Bar dataKey="earnings" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="provider-chart-card provider-chart-side">
          <div className="provider-chart-head">
            <h5>📊 Weekly Jobs</h5>
          </div>
          <div className="provider-chart-area">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="jobs" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="provider-bottom-row">
        {/* Recent Bookings */}
        <div className="provider-bookings-card">
          <div className="provider-chart-head">
            <h5>📋 Recent Bookings</h5>
          </div>
          <div className="provider-bookings-table">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length > 0 ? recentBookings.map((b, i) => {
                  const s = getStatusLabel(b.status || b.Status || 0);
                  return (
                    <tr key={i}>
                      <td className="provider-td-name">{b.customerName || b.CustomerName || "Customer"}</td>
                      <td>{b.serviceTitle || b.ServiceTitle || "Service"}</td>
                      <td className="provider-td-amount">Rs. {b.agreedPrice || b.AgreedPrice || 0}</td>
                      <td><span className={`provider-status-badge ${s.cls}`}>{s.text}</span></td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="4" className="provider-empty">No bookings yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tips & Insights */}
        <div className="provider-tips-card">
          <div className="provider-chart-head">
            <h5>💡 Tips & Insights</h5>
          </div>
          <div className="provider-tips-list">
            <div className="provider-tip-item tip-gold">
              <div className="provider-tip-icon">⚡</div>
              <div>
                <h6>Respond Quickly</h6>
                <p>Responding within 1 hour increases your hire rate by 40%!</p>
              </div>
            </div>
            <div className="provider-tip-item tip-blue">
              <div className="provider-tip-icon">📸</div>
              <div>
                <h6>Upload Portfolio</h6>
                <p>Providers with videos get 3x more bookings.</p>
              </div>
            </div>
            <div className="provider-tip-item tip-green">
              <div className="provider-tip-icon">🎯</div>
              <div>
                <h6>Boost Your Service</h6>
                <p>Use earned points to boost visibility and reach more customers.</p>
              </div>
            </div>
            <div className="provider-tip-item tip-purple">
              <div className="provider-tip-icon">⭐</div>
              <div>
                <h6>Collect Reviews</h6>
                <p>Ask happy clients for reviews. Higher ratings = more bookings.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;