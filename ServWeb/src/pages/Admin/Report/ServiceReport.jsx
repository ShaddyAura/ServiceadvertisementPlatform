import React, { useEffect, useState, useCallback } from "react";
import { fetchAllServices, fetchAllBookings, fetchCategories, fetchAllProfiles } from "../../../api/AccountApi";
import { 
  FaLayerGroup, 
  FaStar, 
  FaChartLine, 
  FaConciergeBell, 
  FaSearch, 
  FaArrowUp 
} from "react-icons/fa";
import "./Report.css";

export default function ServiceReport() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Analytics State
  const [topServices, setTopServices] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [totals, setTotals] = useState({ totalListings: 0, activeCategories: 0 });

  const loadServiceData = useCallback(async () => {
    try {
      setLoading(true);
      const [srvRes, bookRes, catRes, profRes] = await Promise.all([
        fetchAllServices(),
        fetchAllBookings(),
        fetchCategories(),
        fetchAllProfiles()
      ]);

      const allServices = srvRes.data || [];
      const allBookings = bookRes.data || [];
      const allCategories = catRes.data || [];
      const allProfiles = profRes.data || [];

      // Create a map of profileId -> fullName
      const profileMap = {};
      allProfiles.forEach(p => {
        profileMap[p.id || p.Id] = p.fullName || `${p.firstName} ${p.lastName}` || "Unknown Provider";
      });

      // 1. Calculate Category-wise Performance
      const catPerformance = allCategories.map(cat => {
        const catServices = allServices.filter(s => s.categoryId === cat.id);
        const catBookings = allBookings.filter(b => 
          catServices.some(s => s.id === b.serviceId)
        );
        return {
          name: cat.name,
          serviceCount: catServices.length,
          bookingCount: catBookings.length,
          revenue: catBookings.reduce((sum, b) => sum + (b.agreedPrice || 0), 0)
        };
      }).sort((a, b) => b.bookingCount - a.bookingCount);

      // 2. Calculate Most Booked Services
      const servicePerformance = allServices.map(srv => {
        const srvBookings = allBookings.filter(b => b.serviceId === srv.id);
        
        // Map the provider name manually
        let providerName = srv.profile?.fullName;
        if (!providerName && srv.profileId) {
            providerName = profileMap[srv.profileId];
        }

        return {
          ...srv,
          providerName: providerName || "N/A",
          bookingCount: srvBookings.length,
          totalEarned: srvBookings.reduce((sum, b) => sum + (b.agreedPrice || 0), 0)
        };
      }).sort((a, b) => b.bookingCount - a.bookingCount);

      setServices(servicePerformance);
      setTopServices(servicePerformance.slice(0, 5)); // Top 5
      setCategoryStats(catPerformance);
      setTotals({
        totalListings: allServices.length,
        activeCategories: allCategories.length
      });

    } catch (error) {
      console.error("Error generating service report:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServiceData();
  }, [loadServiceData]);

  const filteredServices = services.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.providerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="admin-loader">Processing Service Metrics...</div>;

  return (
    <div className="logsheet-wrapper">
      <div className="logsheet-main-title">Service Performance Logsheet Report</div>
      
      <div className="logsheet-top-bar">
        <div className="logsheet-meta">
          <span>Date: {new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}</span>
          <span>Document Type: System Generated Log</span>
        </div>
        <div className="logsheet-actions">
          <button className="logsheet-action-btn" onClick={() => window.print()}>
            Print / Export PDF
          </button>
        </div>
      </div>

      {/* SEARCH ROW */}
      <div style={{ marginBottom: "15px", display: "flex", gap: "10px", alignItems: "center", border: "1px solid #eec4c4", padding: "10px", background: "#fdf5f5" }}>
        <FaSearch color="#888" />
        <input 
          type="text" 
          placeholder="Search listings or providers..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: "0.85rem" }}
        />
      </div>

      {/* OVERVIEW TABLE */}
      <table className="logsheet-table" style={{ marginBottom: "20px" }}>
        <thead>
          <tr>
            <th colSpan="3" className="logsheet-table-section-header">Service & Category Overview</th>
          </tr>
          <tr>
            <th>Total Listings</th>
            <th>Active Categories</th>
            <th>Top Performing Category</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{totals.totalListings}</td>
            <td>{totals.activeCategories}</td>
            <td style={{ fontWeight: 600, color: "green" }}>{categoryStats[0]?.name || "N/A"}</td>
          </tr>
        </tbody>
      </table>

      {/* CATEGORY & TRENDING TABLES */}
      <table className="logsheet-table" style={{ marginBottom: "20px" }}>
         <thead>
           <tr>
             <th colSpan="4" className="logsheet-table-section-header">Category Performance Analysis</th>
           </tr>
           <tr>
              <th>Category</th>
              <th>Total Services</th>
              <th>Total Bookings</th>
              <th>Revenue (Rs.)</th>
           </tr>
         </thead>
         <tbody>
           {categoryStats.map((cat, i) => (
             <tr key={i}>
               <td><strong>{cat.name}</strong></td>
               <td>{cat.serviceCount}</td>
               <td>{cat.bookingCount}</td>
               <td style={{ fontWeight: 'bold' }}>{cat.revenue.toLocaleString()}</td>
             </tr>
           ))}
         </tbody>
      </table>

      <table className="logsheet-table" style={{ marginBottom: "20px" }}>
         <thead>
           <tr>
             <th colSpan="3" className="logsheet-table-section-header">Top 5 Trending Services</th>
           </tr>
           <tr>
              <th>Service</th>
              <th>Bookings</th>
              <th>Growth</th>
           </tr>
         </thead>
         <tbody>
           {topServices.map((srv, i) => (
             <tr key={i}>
               <td>{srv.title}</td>
               <td>{srv.bookingCount}</td>
               <td style={{ color: 'green', fontWeight: 'bold' }}><FaArrowUp /> High</td>
             </tr>
           ))}
         </tbody>
      </table>

      {/* INVENTORY TABLE */}
      <table className="logsheet-table">
        <thead>
          <tr>
            <th colSpan="5" className="logsheet-table-section-header">Full Service Inventory Ledger</th>
          </tr>
          <tr>
            <th>Service Title</th>
            <th>Provider Name</th>
            <th>Base Price (Rs.)</th>
            <th>Total Bookings</th>
            <th>Revenue Generated (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          {filteredServices.map((s, i) => (
            <tr key={i}>
              <td>{s.title}</td>
              <td>{s.providerName}</td>
              <td>{s.price}</td>
              <td>{s.bookingCount}</td>
              <td style={{ fontWeight: 'bold' }}>{s.totalEarned.toLocaleString()}</td>
            </tr>
          ))}
          {filteredServices.length === 0 && (
            <tr>
              <td colSpan="5" style={{ padding: '30px', color: '#888' }}>No services match your search criteria.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}