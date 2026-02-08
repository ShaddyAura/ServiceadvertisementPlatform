import React, { useEffect, useState } from "react";
// import { fetchUserDocuments, reviewDocument } from "../../../api/VerificationApi"; 
import { FaCheck, FaTimes, FaEye } from "react-icons/fa";
import "./IdentityVerification.css";

const IdentityVerification = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mocking the fetch for now, but uses your API structure
  useEffect(() => {
    // In real use: fetchAllPendingVerifications()
    const mockData = [
      { id: "1", userName: "Kiran KC", docType: "Citizenship", status: 0, date: "2024-05-20" },
      { id: "2", userName: "Sita Sharma", docType: "Passport", status: 0, date: "2024-05-21" },
    ];
    setVerifications(mockData);
    setLoading(false);
  }, []);

  const handleReview = async (id, status) => {
    const adminId = "current-admin-guid"; // From Auth Context
    const remarks = status === 1 ? "Approved" : "Documents unclear";
    
    // Call your backend review endpoint
    await reviewDocument(id, { status, adminRemarks: remarks, adminId });
    setVerifications(verifications.filter(v => v.id !== id));
  };

  return (
    <div className="admin-page-content">
      <div className="page-header">
        <h3>Identity Verifications</h3>
        <p>Review and verify service provider documents.</p>
      </div>

      <div className="verification-grid">
        {verifications.map((item) => (
          <div key={item.id} className="verification-card shadow-sm">
            <div className="card-top">
              <div className="user-info">
                <span className="user-name">{item.userName}</span>
                <span className="doc-type">{item.docType}</span>
              </div>
              <span className="date-tag">{item.date}</span>
            </div>
            
            <div className="doc-preview">
               <FaEye className="eye-icon" />
               <span>Click to view document</span>
            </div>

            <div className="card-actions">
              <button className="btn-approve" onClick={() => handleReview(item.id, 1)}>
                <FaCheck /> Approve
              </button>
              <button className="btn-reject" onClick={() => handleReview(item.id, 2)}>
                <FaTimes /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IdentityVerification;