import React, { useEffect, useState } from "react";
import { 
  fetchAllDocuments, 
  reviewDocument 
} from "../../../api/AccountApi"; 
import { FaCheck, FaTimes, FaEye, FaIdCard, FaCalendarAlt, FaUser } from "react-icons/fa";
import { useAuth } from "../../../context/AuthContext";
import Swal from "sweetalert2";
import "./IdentityVerification.css";

const IdentityVerification = () => {
  const { user } = useAuth(); 
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch data on load
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchAllDocuments(); 
      setVerifications(res.data || []); 
    } catch (err) {
      console.error("Fetch Error:", err);
      Swal.fire("Error", "Could not retrieve document queue.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 2. Review Logic (Matches your API helper: id in params, dto in body)
  const handleReview = async (docId, status) => {
    // Pre-check: Don't allow verifying an already verified document
    const doc = verifications.find(d => d.id === docId);
    const existingStatus = doc?.status ?? doc?.Status;
    
    if (doc && (existingStatus === 4 || existingStatus === 1 || existingStatus === 'Verified' || existingStatus === 'Approved')) {
       return Swal.fire("Notice", "This document has already been verified and locked.", "info");
    }

    // 1 = Verified/Approved, 2 = Rejected per your Enum
    const isApprove = status === 1 || status === 4; 
    
    const { value: remarks, isConfirmed } = await Swal.fire({
      title: isApprove ? 'Approve Identity?' : 'Reject Identity?',
      input: 'textarea',
      inputLabel: 'Message for User',
      inputPlaceholder: isApprove 
        ? 'Optional: Documents verified successfully' 
        : 'Required: Please specify the reason for rejection...',
      showCancelButton: true,
      confirmButtonText: isApprove ? 'Confirm Approval' : 'Confirm Rejection',
      confirmButtonColor: isApprove ? '#28a745' : '#dc3545',
      inputValidator: (value) => {
        if (!isApprove && !value) return 'You must provide a reason for rejection!';
      }
    });

    if (isConfirmed) {
      try {
        Swal.fire({ title: 'Updating...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });
        
        // This object matches your DocumentReviewDto
        const reviewDto = { 
          status: status, 
          message: remarks || (isApprove ? "Approved" : "")
        };

        // Calling your helper: reviewDocument(id, reviewDto)
        await reviewDocument(docId, reviewDto);
        
        Swal.fire("Success", `Document status updated.`, "success");
        loadData(); // Refresh list
      } catch (err) {
        console.error("API Error:", err);
        const errMsg = err.response?.data?.message || err.response?.data || "Failed to update document status.";
        Swal.fire(
          "Update Failed", 
          typeof errMsg === 'string' ? errMsg : "Failed to update document status. It may already be processed.", 
          "error"
        );
      }
    }
  };

  const openImage = (url) => {
    Swal.fire({
      imageUrl: `https://localhost:7065${url}`, 
      imageAlt: 'Identity Document',
      width: '80%',
      showCloseButton: true,
      showConfirmButton: false,
      customClass: { image: 'rounded border shadow' }
    });
  };

  if (loading) return (
    <div className="loader-box">
      <div className="spinner-border text-danger" />
      <p className="fw-bold mt-2">Accessing Secure Documents...</p>
    </div>
  );

  return (
    <div className="admin-page-content">
      <div className="page-header mb-4">
        <h3 className="fw-bold text-uppercase">Identity Verification Queue</h3>
        <p className="text-muted fw-bold border-bottom pb-2">Admin Review Panel</p>
      </div>

      <div className="verification-grid">
        {verifications.length === 0 ? (
          <div className="empty-state fw-bold">No documents pending review.</div>
        ) : verifications.map((item) => (
          <div key={item.id} className="verification-card dynamic-red-border">
            <div className="card-header-flex">
              <div className="user-profile-info">
                <h5 className="fw-bold mb-0">
                   <FaUser className="me-2 text-danger" />
                   {item.profile?.firstName} {item.profile?.lastName}
                </h5>
                <span className="badge-doc-type"><FaIdCard /> {item.documentType}</span>
              </div>
            </div>

            <div className="doc-meta-info mt-3">
               <p className="mb-1"><strong>ID No:</strong> {item.documentNumber}</p>
               <p className="mb-3">
                 <FaCalendarAlt /> <strong>Submitted:</strong> {new Date(item.submittedAt).toLocaleDateString()}
               </p>
            </div>

            <div className="doc-view-grid">
              <div className="view-btn" onClick={() => openImage(item.documentFrontSideUrl)}>
                <FaEye /> FRONT SIDE
              </div>
              <div className="view-btn" onClick={() => openImage(item.documentBackSideUrl)}>
                <FaEye /> BACK SIDE
              </div>
            </div>

            <div className="action-footer mt-4">
              {(item.status === 4 || item.status === 1) ? (
                <>
                  <button className="btn-verified-locked" disabled>
                    <FaCheck /> VERIFIED
                  </button>
                  <button className="btn-reject-disabled" disabled>
                    <FaTimes /> REJECT
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-verify" onClick={() => handleReview(item.id, 4)}>
                    <FaCheck /> VERIFY
                  </button>
                  <button className="btn-reject" onClick={() => handleReview(item.id, 2)}>
                    <FaTimes /> REJECT
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IdentityVerification;