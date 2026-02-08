import React from "react";
import { FaExclamationTriangle, FaCommentDots, FaRegClock, FaGavel, FaUser } from "react-icons/fa";
import "./SystemDisputes.css"; 

const SystemDisputes = () => {
  // Mock data representing disputes tied to your BookingController logic
  const disputes = [
    {
      id: "DISP-8821",
      customer: "Sagar Thapa",
      provider: "Anita Repairs",
      issue: "Service marked as complete but motor still not working",
      status: "High Priority",
      time: "45 mins ago"
    },
    {
      id: "DISP-8819",
      customer: "Binod Rai",
      provider: "Kushal Plumbers",
      issue: "Provider did not show up for scheduled appointment",
      status: "Investigating",
      time: "2 hours ago"
    }
  ];

  return (
    <div className="admin-page-content">
      <div className="page-header mb-4">
        <h3 className="font-weight-bold">System Disputes</h3>
        <p className="text-muted">Review reports and mediate between customers and service providers.</p>
      </div>

      <div className="dispute-list">
        {disputes.map((dispute) => (
          <div className="card border-0 shadow-sm mb-3 dispute-card" key={dispute.id}>
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <div className="d-flex align-items-center mb-2">
                    <span className="dispute-id-tag">{dispute.id}</span>
                    <span className={`badge ml-2 ${dispute.status === 'High Priority' ? 'badge-danger' : 'badge-warning'}`}>
                      {dispute.status}
                    </span>
                  </div>
                  <h6 className="font-weight-bold mb-1">{dispute.issue}</h6>
                  <div className="d-flex text-muted small">
                    <span className="mr-3"><FaUser className="mr-1"/> <b>Customer:</b> {dispute.customer}</span>
                    <span><FaUser className="mr-1"/> <b>Provider:</b> {dispute.provider}</span>
                  </div>
                </div>
                <div className="col-md-4 text-md-right mt-3 mt-md-0">
                  <div className="small text-muted mb-2"><FaRegClock /> {dispute.time}</div>
                  <div className="action-buttons">
                    <button className="btn btn-sm btn-dark mr-2">
                      <FaCommentDots /> View Chat
                    </button>
                    <button className="btn btn-sm btn-outline-danger">
                      <FaGavel /> Resolve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// CRITICAL: This line fixes the "export named default" error
export default SystemDisputes;