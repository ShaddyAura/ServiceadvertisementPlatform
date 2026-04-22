import React, { useEffect, useState, useCallback } from "react";
import { fetchAllServices, fetchAllBookings, fetchCategories, fetchAllProfiles, fetchAllWallets } from "../../../api/AccountApi";
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
  const [activeSection, setActiveSection] = useState(1);
  
  // Analytics State
  const [topServices, setTopServices] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [totals, setTotals] = useState({ totalListings: 0, activeCategories: 0 });
  const [providerPoints, setProviderPoints] = useState([]);

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

      // Fetch wallets independently so it doesn't break other report data
      let allWallets = [];
      try {
        const walletRes = await fetchAllWallets();
        console.log("Wallet API response:", walletRes);
        allWallets = walletRes.data || [];
        console.log("Parsed wallets count:", allWallets.length, allWallets);
      } catch (walletErr) {
        console.error("Failed to fetch wallets (is backend restarted?):", walletErr);
      }

      // Create a map of profileId -> fullName
      const profileMap = {};
      allProfiles.forEach(p => {
        profileMap[p.id || p.Id] = p.fullName || `${p.firstName} ${p.lastName}` || "Unknown Provider";
      });

      // 1. Calculate Category-wise Performance
      const catPerformance = allCategories.map(cat => {
        const catId = cat.id || cat.Id;
        const catName = cat.name || cat.Name || "";
        
        // Find services matching by exact String name since ServiceListings doesn't use CategoryId
        const catServices = allServices.filter(s => {
            const sCat = s.category || s.Category || "";
            return sCat.toLowerCase() === catName.toLowerCase();
        });
        const catBookings = allBookings.filter(b => 
          catServices.some(s => (s.id || s.Id) === (b.serviceId || b.ServiceId))
        );
        return {
          name: catName,
          serviceCount: catServices.length,
          bookingCount: catBookings.length,
          revenue: catBookings.reduce((sum, b) => sum + (b.agreedPrice || b.AgreedPrice || 0), 0)
        };
      }).sort((a, b) => b.bookingCount - a.bookingCount);

      // 2. Calculate Most Booked Services
      const servicePerformance = allServices.map(srv => {
        const srvId = srv.id || srv.Id;
        const srvBookings = allBookings.filter(b => (b.serviceId || b.ServiceId) === srvId);
        
        // Map the provider name manually
        let providerName = srv.profile?.fullName || srv.Profile?.FullName;
        const mappedProfileId = srv.profileId || srv.ProfileId;
        
        if (!providerName && mappedProfileId) {
            providerName = profileMap[mappedProfileId];
        }

        return {
          ...srv,
          title: srv.title || srv.Title,
          price: srv.price || srv.Price,
          providerName: providerName || "N/A",
          bookingCount: srvBookings.length,
          totalEarned: srvBookings.reduce((sum, b) => sum + (b.agreedPrice || b.AgreedPrice || 0), 0)
        };
      }).sort((a, b) => b.bookingCount - a.bookingCount);

      setServices(servicePerformance);
      setTopServices(servicePerformance.slice(0, 5)); // Top 5
      setCategoryStats(catPerformance);
      setTotals({
        totalListings: allServices.length,
        activeCategories: allCategories.length
      });

      // 3. Calculate Provider Point Balances
      const pointStats = allWallets.map(w => {
        const pId = w.profileId || w.ProfileId;
        const providerName = profileMap[pId] || "Unknown Provider";
        
        return {
          providerName,
          balance: w.pointsBalance || w.PointsBalance || 0,
          lifetime: w.lifetimePurchasedPoints || w.LifetimePurchasedPoints || 0
        };
      }).sort((a, b) => b.lifetime - a.lifetime);
      
      setProviderPoints(pointStats);

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

      <div className="logsheet-tabs">
        <button 
          className={`logsheet-tab-btn ${activeSection === 1 ? 'active' : ''}`}
          onClick={() => setActiveSection(1)}>
          1. General Overview
        </button>
        <button 
          className={`logsheet-tab-btn ${activeSection === 2 ? 'active' : ''}`}
          onClick={() => setActiveSection(2)}>
          2. Category Stats
        </button>
        <button 
          className={`logsheet-tab-btn ${activeSection === 3 ? 'active' : ''}`}
          onClick={() => setActiveSection(3)}>
          3. Trending Services
        </button>
        <button 
          className={`logsheet-tab-btn ${activeSection === 4 ? 'active' : ''}`}
          onClick={() => setActiveSection(4)}>
          4. Full Inventory Ledger
        </button>
        <button 
          className={`logsheet-tab-btn ${activeSection === 5 ? 'active' : ''}`}
          onClick={() => setActiveSection(5)}>
          5. Provider Points Ledger
        </button>
      </div>

      {/* OVERVIEW TABLE (Section 1) */}
      {activeSection === 1 && (
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
      )}

      {/* CATEGORY OUTCOMES (Section 2) */}
      {activeSection === 2 && (
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
      )}

      {/* TOP SERVICES (Section 3) */}
      {activeSection === 3 && (
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
             {topServices.map((srv, i) => {
               const gv = srv.bookingCount;
               const label = gv >= 10 ? "High" : (gv >= 3 ? "Steady" : "New");
               const color = gv >= 10 ? "green" : (gv >= 3 ? "#007bff" : "#888");
               return (
                 <tr key={i}>
                   <td>{srv.title}</td>
                   <td>{srv.bookingCount}</td>
                   <td style={{ color: color, fontWeight: 'bold' }}>
                     {gv >= 10 ? <FaArrowUp /> : null} {label}
                   </td>
                 </tr>
               );
             })}
           </tbody>
        </table>
      )}

      {/* FULL INVENTORY (Section 4) */}
      {activeSection === 4 && (
        <>
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
        </>
      )}

      {/* POINTS LEDGER (Section 5) */}
      {activeSection === 5 && (
        <table className="logsheet-table">
          <thead>
            <tr>
              <th colSpan="4" className="logsheet-table-section-header">Provider Point Purchasing Ledger</th>
            </tr>
            <tr>
              <th>Provider Name</th>
              <th>Current Points Balance</th>
              <th>Lifetime Purchased Points</th>
              <th>Estimated Economic Impact (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            {providerPoints.map((p, i) => (
              <tr key={i}>
                <td><strong>{p.providerName}</strong></td>
                <td>{p.balance.toLocaleString()} Pts</td>
                <td>{p.lifetime.toLocaleString()} Pts</td>
                <td style={{ fontWeight: 'bold', color: 'green' }}>Rs. {(p.lifetime).toLocaleString()}</td>
              </tr>
            ))}
            {providerPoints.length === 0 && (
              <tr><td colSpan="4" style={{ padding: "20px", color: '#888' }}>No point transaction data detected.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}