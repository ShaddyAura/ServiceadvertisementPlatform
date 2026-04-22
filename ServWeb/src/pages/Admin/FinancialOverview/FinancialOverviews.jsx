import React, { useEffect, useState, useCallback } from "react";
import { fetchAllBookings, fetchAllProfiles } from "../../../api/AccountApi";
import { fetchAllWallets } from "../../../api/AccountApi";
import { 
  FaWallet, FaMoneyBillWave, FaCoins, FaChartPie, FaUsers,
  FaCheckCircle, FaTimesCircle, FaClock
} from "react-icons/fa";
import "../AdminDashboard.css";
import "./FinancialOverview.css";

const FinancialOverview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    esewaPool: 0,
    khaltiPool: 0,
    totalBookingRevenue: 0,
    completedRevenue: 0,
    pendingRevenue: 0,
    cancelledRevenue: 0,
    totalPointsPurchased: 0,
    totalPointsBalance: 0,
    totalProviders: 0,
    totalCustomers: 0,
    totalBookings: 0
  });

  const isStatus = (booking, targetStr) => {
    const s = String(booking.status ?? booking.Status).toLowerCase();
    return s === targetStr.toLowerCase() || s === String(
      targetStr === "Completed" ? 3 : targetStr === "Cancelled" ? 4 : targetStr === "Pending" ? 0 : -1
    );
  };

  const loadFinancials = useCallback(async () => {
    try {
      setLoading(true);

      const [bookRes, profRes] = await Promise.all([
        fetchAllBookings(),
        fetchAllProfiles()
      ]);

      const allBookings = bookRes.data || [];
      const allProfiles = profRes.data || [];

      // Fetch wallets independently
      let allWallets = [];
      try {
        const walletRes = await fetchAllWallets();
        allWallets = walletRes.data || [];
      } catch (err) {
        console.error("Wallet fetch failed:", err);
      }

      // Aggregate eSewa and Khalti pools from all wallets
      let esewaPool = 0, khaltiPool = 0, totalPointsPurchased = 0, totalPointsBalance = 0;
      allWallets.forEach(w => {
        esewaPool += (w.eSewaBalance || w.ESewaBalance || 0);
        khaltiPool += (w.khaltiBalance || w.KhaltiBalance || 0);
        totalPointsPurchased += (w.lifetimePurchasedPoints || w.LifetimePurchasedPoints || 0);
        totalPointsBalance += (w.pointsBalance || w.PointsBalance || 0);
      });

      // Booking revenue calculations
      const totalBookingRevenue = allBookings.reduce((sum, b) => sum + (b.agreedPrice || b.AgreedPrice || 0), 0);
      const completedRevenue = allBookings
        .filter(b => isStatus(b, "Completed"))
        .reduce((sum, b) => sum + (b.agreedPrice || b.AgreedPrice || 0), 0);
      const pendingRevenue = allBookings
        .filter(b => isStatus(b, "Pending") || isStatus(b, "Confirmed"))
        .reduce((sum, b) => sum + (b.agreedPrice || b.AgreedPrice || 0), 0);
      const cancelledRevenue = allBookings
        .filter(b => isStatus(b, "Cancelled"))
        .reduce((sum, b) => sum + (b.agreedPrice || b.AgreedPrice || 0), 0);

      // Count providers vs customers
      const providers = allProfiles.filter(p => (p.role || p.Role) === "ServiceProvider" || (p.role || p.Role) === 2);
      const customers = allProfiles.filter(p => (p.role || p.Role) === "User" || (p.role || p.Role) === 1);

      setStats({
        esewaPool,
        khaltiPool,
        totalBookingRevenue,
        completedRevenue,
        pendingRevenue,
        cancelledRevenue,
        totalPointsPurchased,
        totalPointsBalance,
        totalProviders: providers.length,
        totalCustomers: customers.length,
        totalBookings: allBookings.length
      });

    } catch (error) {
      console.error("Error loading financials:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFinancials();
  }, [loadFinancials]);

  if (loading) return <div className="admin-loader">Loading Financial Data...</div>;

  return (
    <div className="admin-dash-container">
      <div className="admin-dash-header">
        <div>
          <h2 className="admin-dash-title">Financial Overview</h2>
          <p className="admin-dash-subtitle">Real-time platform financial health from the database</p>
        </div>
      </div>

      {/* Payment Gateway Pools */}
      <h5 className="fo-section-title">Payment Gateway Balances</h5>
      <div className="admin-stats-grid">
        <div className="admin-stat-card fo-gradient-esewa">
          <div className="admin-stat-icon-wrap fo-icon-esewa">
            <FaWallet size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">eSewa Pool</span>
            <h3 className="admin-stat-value">Rs. {stats.esewaPool.toLocaleString()}</h3>
          </div>
        </div>
        <div className="admin-stat-card fo-gradient-khalti">
          <div className="admin-stat-icon-wrap fo-icon-khalti">
            <FaWallet size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Khalti Pool</span>
            <h3 className="admin-stat-value">Rs. {stats.khaltiPool.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <h5 className="fo-section-title">Booking Revenue Breakdown</h5>
      <div className="admin-stats-grid">
        <div className="admin-stat-card fo-gradient-total">
          <div className="admin-stat-icon-wrap fo-icon-total">
            <FaMoneyBillWave size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Booking Revenue</span>
            <h3 className="admin-stat-value">Rs. {stats.totalBookingRevenue.toLocaleString()}</h3>
          </div>
        </div>
        <div className="admin-stat-card fo-gradient-completed">
          <div className="admin-stat-icon-wrap fo-icon-completed">
            <FaCheckCircle size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Cleared (Completed)</span>
            <h3 className="admin-stat-value">Rs. {stats.completedRevenue.toLocaleString()}</h3>
          </div>
        </div>
        <div className="admin-stat-card fo-gradient-pending">
          <div className="admin-stat-icon-wrap fo-icon-pending">
            <FaClock size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Pending / In-Progress</span>
            <h3 className="admin-stat-value">Rs. {stats.pendingRevenue.toLocaleString()}</h3>
          </div>
        </div>
        <div className="admin-stat-card fo-gradient-cancelled">
          <div className="admin-stat-icon-wrap fo-icon-cancelled">
            <FaTimesCircle size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Cancelled / Lost</span>
            <h3 className="admin-stat-value">Rs. {stats.cancelledRevenue.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="fo-bottom-grid">
        {/* Points Economy */}
        <div className="fo-block">
          <h5 className="fo-section-title">Points Economy</h5>
          <div className="fo-economy-grid">
            <div className="admin-stat-card fo-gradient-points">
              <div className="admin-stat-icon-wrap fo-icon-points">
                <FaCoins size={22} />
              </div>
              <div className="admin-stat-info">
                <span className="admin-stat-label">Total Points</span>
                <h3 className="admin-stat-value">{stats.totalPointsPurchased.toLocaleString()} <span style={{fontSize: "14px"}}>Pts</span></h3>
              </div>
            </div>
            <div className="admin-stat-card fo-gradient-balance">
              <div className="admin-stat-icon-wrap fo-icon-balance">
                <FaChartPie size={22} />
              </div>
              <div className="admin-stat-info">
                <span className="admin-stat-label">Circulating</span>
                <h3 className="admin-stat-value">{stats.totalPointsBalance.toLocaleString()} <span style={{fontSize: "14px"}}>Pts</span></h3>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Summary */}
        <div className="fo-block">
          <h5 className="fo-section-title">Platform Summary</h5>
          <div className="fo-platform-summary">
            <div className="fo-summary-row-item">
              <div className="fo-summary-icon-box fo-icon-total"><FaUsers size={20} /></div>
              <div className="fo-summary-details">
                <span className="fo-summary-item-label">Service Providers</span>
                <span className="fo-summary-item-val">{stats.totalProviders}</span>
              </div>
            </div>
            <div className="fo-summary-row-item">
              <div className="fo-summary-icon-box fo-icon-completed"><FaUsers size={20} /></div>
              <div className="fo-summary-details">
                <span className="fo-summary-item-label">Customers</span>
                <span className="fo-summary-item-val">{stats.totalCustomers}</span>
              </div>
            </div>
            <div className="fo-summary-row-item">
              <div className="fo-summary-icon-box fo-icon-esewa"><FaCheckCircle size={20} /></div>
              <div className="fo-summary-details">
                <span className="fo-summary-item-label">Total Bookings</span>
                <span className="fo-summary-item-val">{stats.totalBookings}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FinancialOverview;