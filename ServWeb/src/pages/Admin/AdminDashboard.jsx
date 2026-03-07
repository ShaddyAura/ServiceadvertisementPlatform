import React from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { TrendingUp, Users, Box, DollarSign, Star, Zap } from "lucide-react";
import "./AdminDashboard.css";

// Mock Data for the Graph
const data = [
  { name: "Jan", sales: 4000, services: 2400 },
  { name: "Feb", sales: 3000, services: 1398 },
  { name: "Mar", sales: 2000, services: 9800 },
  { name: "Apr", sales: 2780, services: 3908 },
  { name: "May", sales: 1890, services: 4800 },
  { name: "Jun", sales: 2390, services: 3800 },
];

const AdminDashboard = () => {
  return (
    <div className="admin-container p-4">
      <h2 className="mb-4 fw-bold">Dashboard Overview</h2>

      {/* --- Stat Cards --- */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Revenue", value: "$54,230", icon: <DollarSign />, color: "text-primary" },
          { label: "Active Users", value: "1,254", icon: <Users />, color: "text-success" },
          { label: "Total Services", value: "452", icon: <Box />, color: "text-warning" },
          { label: "Growth", value: "+12.5%", icon: <TrendingUp />, color: "text-info" },
        ].map((stat, i) => (
          <div className="col-md-3" key={i}>
            <div className="stat-card shadow-sm p-3 bg-white rounded">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">{stat.label}</p>
                  <h4 className="fw-bold mb-0">{stat.value}</h4>
                </div>
                <div className={`${stat.color} fs-3`}>{stat.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* --- Trending Graph --- */}
        <div className="col-lg-8">
          <div className="graph-card shadow-sm p-4 bg-white rounded">
            <h5 className="mb-4 d-flex align-items-center">
              <TrendingUp className="me-2 text-primary" /> Service Performance Trends
            </h5>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#4f46e5" fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* --- Boosted Services --- */}
        <div className="col-lg-4">
          <div className="boosted-card shadow-sm p-4 bg-white rounded h-100">
            <h5 className="mb-4 d-flex align-items-center">
              <Zap className="me-2 text-warning" fill="currentColor" /> Boosted Services
            </h5>
            <div className="service-list">
              {[
                { name: "Premium Web Design", rating: 4.9, status: "Active" },
                { name: "SEO Optimization", rating: 4.7, status: "High Demand" },
                { name: "Logo Branding", rating: 4.8, status: "Active" },
                { name: "Cloud Hosting", rating: 4.5, status: "Expiring" },
              ].map((service, i) => (
                <div key={i} className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom last-child-no-border">
                  <div>
                    <h6 className="mb-0 fw-semibold">{service.name}</h6>
                    <small className="text-muted"><Star size={12} className="text-warning fill-warning" /> {service.rating}</small>
                  </div>
                  <span className={`badge ${service.status === 'Expiring' ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`}>
                    {service.status}
                  </span>
                </div>
              ))}
            </div>
            <button className="btn btn-outline-primary w-100 mt-2 btn-sm">View All Services</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;