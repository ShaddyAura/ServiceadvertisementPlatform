import React, { useEffect, useState, useCallback } from "react";
import { fetchAllBoostingTransactions } from "../../../api/AccountApi";
import { FaRocket, FaFire, FaSearch, FaHistory, FaArrowUp, FaCoins } from "react-icons/fa";
import "./AdCampaigns.css";

const AdCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchAllBoostingTransactions();
      setCampaigns(res.data || []);
    } catch (error) {
      console.error("Error fetching boosting campaigns:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const filteredCampaigns = campaigns.filter(c => {
    const serviceTitle = c.service?.title || c.service?.Title || "";
    const providerName = c.service?.profile?.fullName || c.service?.profile?.FirstName || "Unknown";
    return serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
           providerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPoints = campaigns.reduce((sum, c) => sum + (c.pointsSpent || c.PointsSpent || 0), 0);
  const activeBoosts = campaigns.filter(c => new Date(c.boostEndDate || c.BoostEndDate) > new Date()).length;

  if (loading) return <div className="admin-loader">Loading Ad Campaigns...</div>;

  return (
    <div className="ad-campaigns-container">
      <div className="ad-campaigns-header">
        <div>
          <h2>Ad Campaigns & Boosting</h2>
          <p>Tracking point consumption and visibility boosts from service providers.</p>
        </div>
        <button className="refresh-btn" onClick={loadCampaigns}>Refresh Data</button>
      </div>

      <div className="ad-stats-grid">
        <div className="ad-stat-card revenue">
          <div className="stat-icon"><FaRocket /></div>
          <div className="stat-content">
            <span className="stat-label">Total Points Consumed</span>
            <h3 className="stat-value">{totalPoints.toLocaleString()} <small>Pts</small></h3>
            <span className="stat-trend"><FaArrowUp /> 100% organic growth</span>
          </div>
        </div>
        <div className="ad-stat-card active-boosts">
          <div className="stat-icon"><FaFire /></div>
          <div className="stat-content">
            <span className="stat-label">Active Boosts</span>
            <h3 className="stat-value">{activeBoosts} <small>Live</small></h3>
            <span className="stat-trend">Currently gaining visibility</span>
          </div>
        </div>
      </div>

      <div className="ad-content-card">
        <div className="ad-card-header">
          <h5><FaHistory /> Transaction History</h5>
          <div className="ad-search-box">
            <FaSearch />
            <input 
              type="text" 
              placeholder="Search service or provider..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="ad-table-responsive">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Service Details</th>
                <th>Provider</th>
                <th>Points Spent</th>
                <th>Boost Period</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((c, i) => {
                const isLive = new Date(c.boostEndDate || c.BoostEndDate) > new Date();
                const startDate = new Date(c.boostStartDate || c.BoostStartDate).toLocaleDateString();
                const endDate = new Date(c.boostEndDate || c.BoostEndDate).toLocaleDateString();
                const serviceTitle = c.service?.title || c.service?.Title || "N/A";
                const providerName = c.service?.profile?.fullName || 
                                    `${c.service?.profile?.firstName || ""} ${c.service?.profile?.lastName || ""}` || "N/A";

                return (
                  <tr key={i}>
                    <td>
                      <div className="service-cell">
                        <span className="service-title">{serviceTitle}</span>
                        <span className="service-id">ID: {(c.id || "").toString().slice(0, 8)}</span>
                      </div>
                    </td>
                    <td>{providerName}</td>
                    <td className="points-cell">
                      <FaCoins className="coin-icon" /> 
                      {(c.pointsSpent || c.PointsSpent || 0).toLocaleString()}
                    </td>
                    <td>
                      <div className="period-cell">
                        <span className="date-range">{startDate} - {endDate}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${isLive ? 'live' : 'expired'}`}>
                        {isLive ? 'Live' : 'Expired'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredCampaigns.length === 0 && (
                <tr>
                  <td colSpan="5" className="no-data">No boosting transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdCampaigns;