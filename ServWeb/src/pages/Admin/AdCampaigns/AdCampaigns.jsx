import React from "react";
import { FaRocket, FaFire } from "react-icons/fa";
import "./AdCampaigns.css"; // Ensure this is imported

const AdCampaigns = () => {
  return (
    <div className="admin-page-content">
      <div className="page-header">
        <h3>Ad Campaigns</h3>
        <p>Tracking revenue and status from boosted service listings.</p>
      </div>

      {/* Summary Card - Ties to Boosting Transactions */}
      <div className="card mt-4 border-0 shadow-sm p-4 ad-summary-card">
        <div className="d-flex align-items-center">
          <div className="ad-icon-circle">
            <FaRocket />
          </div>
          <div className="ml-3">
            <h5 className="mb-0">Total Boosting Revenue</h5>
            <h3 className="font-weight-bold">Rs. 24,000</h3>
          </div>
        </div>
      </div>

      {/* Active Boosts Section - Ties to IsServiceCurrentlyBoostedAsync */}
      <h5 className="mt-4 font-weight-bold">Currently Boosted Services</h5>
      <div className="row mt-2">
        <div className="col-md-4">
          <div className="boost-item shadow-sm">
            <div className="boost-header d-flex justify-content-between">
              <span className="active-tag"><FaFire /> Live</span>
              <span className="days-left small text-muted">2 Days Left</span>
            </div>
            <h6 className="mt-2 font-weight-bold">Expert Home Plumbing</h6>
            <p className="small text-muted mb-0">Cost: 500 Points</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Explicit default export
export default AdCampaigns;