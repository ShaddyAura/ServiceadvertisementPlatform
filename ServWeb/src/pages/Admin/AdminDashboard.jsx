import React from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { TrendingUp, Users, Box, DollarSign, Star, Zap, ShieldCheck, AlertTriangle, Activity, Clock } from "lucide-react";
import "./AdminDashboard.css";
import { useAuth } from "../../context/AuthContext";

const monthlyData = [
  { name: "Jan", revenue: 4000, services: 2400 },
  { name: "Feb", revenue: 3000, services: 1398 },
  { name: "Mar", revenue: 5000, services: 9800 },
  { name: "Apr", revenue: 2780, services: 3908 },
  { name: "May", revenue: 1890, services: 4800 },
  { name: "Jun", revenue: 4390, services: 3800 },
  { name: "Jul", revenue: 5490, services: 4300 },
];

const categoryData = [
  { name: "Plumbing", value: 35 },
  { name: "Cleaning", value: 25 },
  { name: "Electrical", value: 20 },
  { name: "Design", value: 20 },
];
const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

const recentActivity = [
  { user: "Ram Aryal", action: "registered as provider", time: "2 min ago", type: "user" },
  { user: "Sita Sharma", action: "booked Plumbing service", time: "15 min ago", type: "booking" },
  { user: "Admin", action: "verified provider ID #45", time: "1 hr ago", type: "verify" },
  { user: "System", action: "daily report generated", time: "3 hr ago", type: "system" },
  { user: "Hari KC", action: "submitted identity documents", time: "5 hr ago", type: "verify" },
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const stats = [
    { label: "Total Revenue", value: "Rs. 54,230", icon: <DollarSign size={22} />, trend: "+12.5%", trendUp: true, gradient: "stat-gradient-indigo" },
    { label: "Active Users", value: "1,254", icon: <Users size={22} />, trend: "+8.3%", trendUp: true, gradient: "stat-gradient-emerald" },
    { label: "Total Services", value: "452", icon: <Box size={22} />, trend: "+5.1%", trendUp: true, gradient: "stat-gradient-amber" },
    { label: "Pending Verifications", value: "23", icon: <ShieldCheck size={22} />, trend: "3 new", trendUp: false, gradient: "stat-gradient-rose" },
  ];

  return (
    <div className="admin-dash-container">
      <div className="admin-dash-header">
        <div>
          <h2 className="admin-dash-title">Dashboard Overview</h2>
          <p className="admin-dash-subtitle">Welcome back, {user?.fullname || "Admin"}! Here's what's happening today.</p>
        </div>
        <div className="admin-dash-date">
          <Clock size={16} />
          <span>{new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="admin-stats-grid">
        {stats.map((stat, i) => (
          <div className={`admin-stat-card ${stat.gradient}`} key={i}>
            <div className="admin-stat-icon-wrap">
              {stat.icon}
            </div>
            <div className="admin-stat-info">
              <span className="admin-stat-label">{stat.label}</span>
              <h3 className="admin-stat-value">{stat.value}</h3>
              <span className={`admin-stat-trend ${stat.trendUp ? 'trend-up' : 'trend-neutral'}`}>
                {stat.trendUp && <TrendingUp size={14} />} {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-charts-row">
        {/* Revenue Chart */}
        <div className="admin-chart-card admin-chart-wide">
          <div className="admin-chart-header">
            <h5><Activity size={18} className="admin-chart-icon" /> Revenue & Service Trends</h5>
          </div>
          <div className="admin-chart-body">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradServices" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', fontSize: '13px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#gradRevenue)" />
                <Area type="monotone" dataKey="services" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#gradServices)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="admin-chart-card admin-chart-narrow">
          <div className="admin-chart-header">
            <h5><Box size={18} className="admin-chart-icon" /> Category Split</h5>
          </div>
          <div className="admin-chart-body admin-pie-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="admin-pie-legend">
              {categoryData.map((cat, i) => (
                <div key={i} className="admin-pie-legend-item">
                  <span className="admin-pie-dot" style={{ background: PIE_COLORS[i] }}></span>
                  <span>{cat.name}</span>
                  <span className="admin-pie-pct">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-bottom-row">
        {/* Recent Activity */}
        <div className="admin-activity-card">
          <div className="admin-chart-header">
            <h5><Clock size={18} className="admin-chart-icon" /> Recent Activity</h5>
          </div>
          <div className="admin-activity-list">
            {recentActivity.map((item, i) => (
              <div key={i} className="admin-activity-item">
                <div className={`admin-activity-dot dot-${item.type}`}></div>
                <div className="admin-activity-content">
                  <p><strong>{item.user}</strong> {item.action}</p>
                  <span className="admin-activity-time">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Boosted Services */}
        <div className="admin-boosted-card">
          <div className="admin-chart-header">
            <h5><Zap size={18} className="admin-chart-icon admin-icon-amber" /> Boosted Services</h5>
          </div>
          <div className="admin-boosted-list">
            {[
              { name: "Premium Web Design", rating: 4.9, status: "Active" },
              { name: "SEO Optimization", rating: 4.7, status: "High Demand" },
              { name: "Logo Branding", rating: 4.8, status: "Active" },
              { name: "Cloud Hosting", rating: 4.5, status: "Expiring" },
            ].map((service, i) => (
              <div key={i} className="admin-boosted-item">
                <div className="admin-boosted-info">
                  <h6>{service.name}</h6>
                  <div className="admin-boosted-rating">
                    <Star size={12} fill="#f59e0b" color="#f59e0b" /> 
                    <span>{service.rating}</span>
                  </div>
                </div>
                <span className={`admin-boosted-badge ${service.status === 'Expiring' ? 'badge-danger' : service.status === 'High Demand' ? 'badge-info' : 'badge-success'}`}>
                  {service.status}
                </span>
              </div>
            ))}
          </div>
          <button className="admin-view-all-btn">View All Services</button>
        </div>

        {/* Quick Stats */}
        <div className="admin-quick-card">
          <div className="admin-chart-header">
            <h5><AlertTriangle size={18} className="admin-chart-icon admin-icon-rose" /> Platform Health</h5>
          </div>
          <div className="admin-quick-list">
            <div className="admin-quick-item">
              <span className="admin-quick-label">Reported Services</span>
              <span className="admin-quick-value text-danger">12</span>
            </div>
            <div className="admin-quick-item">
              <span className="admin-quick-label">Pending Reviews</span>
              <span className="admin-quick-value text-warning">8</span>
            </div>
            <div className="admin-quick-item">
              <span className="admin-quick-label">Active Campaigns</span>
              <span className="admin-quick-value text-success">5</span>
            </div>
            <div className="admin-quick-item">
              <span className="admin-quick-label">System Uptime</span>
              <span className="admin-quick-value text-info">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;