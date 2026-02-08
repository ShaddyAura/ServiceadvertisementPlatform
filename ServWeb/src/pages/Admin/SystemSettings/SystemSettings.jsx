import React from "react";
import { FaExclamationTriangle, FaCommentDots, FaRegClock, FaGavel } from "react-icons/fa";
import "./SystemSettings.css"; // Reuse the same shared CSS

const SystemSettings = () => {
  const disputes = [
    {
      id: "DISP-102",
      customer: "Himal Tamang",
      provider: "Rajesh Electrician",
      issue: "Service not completed but marked as finished",
      status: "Open",
      time: "3 hours ago"
    }
  ];

  return (
    <div className="admin-page-content">
      <div className="page-header">
        <h3>System Disputes</h3>
        <p>Resolve conflicts between customers and service providers.</p>
      </div>

      <div className="row mt-4">
        {disputes.map((dispute) => (
          <div className="col-12 mb-3" key={dispute.id}>
            <div className="card border-0 shadow-sm dispute-card">
              <div className="card-body d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="dispute-icon-box">
                    <FaExclamationTriangle />
                  </div>
                  <div className="ml-3">
                    <div className="d-flex align-items-center">
                      <h6 className="mb-0 font-weight-bold">{dispute.id}</h6>
                      <span className="badge badge-warning ml-2">{dispute.status}</span>
                    </div>
                    <p className="mb-0 text-muted small">
                      <strong>{dispute.customer}</strong> vs <strong>{dispute.provider}</strong>
                    </p>
                    <p className="mb-0 small text-danger">{dispute.issue}</p>
                  </div>
                </div>

                <div className="dispute-actions text-right">
                  <div className="text-muted small mb-2"><FaRegClock /> {dispute.time}</div>
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
        ))}
      </div>
    </div>
  );
};

// EXPLICIT DEFAULT EXPORT (Fixes your error)
export default SystemSettings;