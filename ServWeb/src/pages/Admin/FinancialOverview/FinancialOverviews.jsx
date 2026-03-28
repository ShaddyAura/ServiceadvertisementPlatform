import React from "react";
import { FaWallet, FaArrowUp, FaHistory } from "react-icons/fa";
// import "./FinancialOverview.css"; // Ensure this is imported

const FinancialOverview = () => {
  return (
    <div className="admin-page-content">
      <h3>Financial Overview</h3>
      <p>Real-time balance across platform wallets.</p>

      <div className="row mt-4">
        <div className="col-md-6">
          <div className="finance-card esewa shadow-sm">
            <div className="d-flex justify-content-between">
              <FaWallet size={30} />
              <span className="platform-name">eSewa Pool</span>
            </div>
            <h2 className="mt-3">Rs. 450,200</h2>
            <p className="small"><FaArrowUp /> 12% increase this month</p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="finance-card khalti shadow-sm">
            <div className="d-flex justify-content-between">
              <FaWallet size={30} />
              <span className="platform-name">Khalti Pool</span>
            </div>
            <h2 className="mt-3">Rs. 128,450</h2>
            <p className="small text-white-50">Stable balance</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FinancialOverview;