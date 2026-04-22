import React, { useEffect, useState } from "react";
import { FaCheck, FaTimes, FaSearch, FaUser } from "react-icons/fa";
import { 
  fetchAllProfiles, 
  verifyProfileDirectly,
  toggleSuspension
} from "../../../api/AccountApi";
import { useAuth } from "../../../context/AuthContext";
import Swal from "sweetalert2";
import "./Usermanagement.css";

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const res = await fetchAllProfiles();
      setProfiles(res.data || []);
    } catch (err) {
      console.error("Failed to load profiles:", err);
      Swal.fire("Error", "Failed to load user profiles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfiles(); }, []);

  const handleAction = async (profile, actionType) => {
    const isVerify = actionType === 'verify';
    const isSuspend = actionType === 'suspend';
    
    let confirmationText = `Confirm manual profile update for this user?`;
    let confirmBtnText = `Yes, ${actionType}`;
    
    if (isSuspend) {
        if (!profile.isSuspended) {
            const { value: reason } = await Swal.fire({
                title: 'Suspend User',
                input: 'textarea',
                inputLabel: 'Reason for suspension',
                inputPlaceholder: 'Type your message here...',
                showCancelButton: true
            });
            if (!reason) return; // Cancelled or empty
            
            try {
                await toggleSuspension(profile.id, reason);
                Swal.fire("Suspended!", "User has been suspended.", "success");
                loadProfiles();
            } catch (e) {
                Swal.fire("Error", "Could not suspend user.", "error");
            }
            return;
        } else {
            // Unsuspend
            const c = await Swal.fire({
                title: 'Unsuspend User?',
                text: "User will regain access to the platform.",
                icon: "info",
                showCancelButton: true,
                confirmButtonText: "Yes, Unsuspend"
            });
            if (c.isConfirmed) {
                await toggleSuspension(profile.id, "");
                Swal.fire("Restored!", "User is no longer suspended.", "success");
                loadProfiles();
            }
            return;
        }
    }

    // Verify fallback
    Swal.fire({
      title: `${isVerify ? 'Verify' : 'Action on'} ${profile.firstName}?`,
      text: confirmationText,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: confirmBtnText,
      confirmButtonColor: isVerify ? "#28a745" : "#d33",
      cancelButtonColor: "#6c757d",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({ title: 'Processing...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
          
          if (isVerify) {
              await verifyProfileDirectly(profile.id); 
          }
          
          Swal.fire("Updated!", `Profile action completed successfully.`, "success");
          loadProfiles();
        } catch (error) {
          Swal.fire("Error", "Action failed. Check API connectivity.", "error");
        }
      }
    });
  };

  const filteredProfiles = profiles.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phoneNumber && p.phoneNumber.includes(searchTerm))
  );

  if (loading) return (
    <div className="loader-box p-5 text-center">
        <div className="spinner-border text-danger" />
        <p className="mt-2 fw-bold">Loading Profiles...</p>
    </div>
  );

  return (
    <div className="admin-page-content">
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-0 text-uppercase">Profile Audit Management</h3>
          <p className="text-muted small fw-bold">Review user identity details and contact info</p>
        </div>
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            className="fw-bold"
            placeholder="Search by name or phone..." 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      <div className="card border-0 shadow-sm p-0 overflow-hidden custom-table-card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 custom-user-table">
            <thead>
              <tr className="small text-uppercase bg-light">
                <th className="ps-4">Profile Image & Name</th>
                <th>Phone Number</th>
                <th>Date of Birth</th>
                <th>System ID</th>
                <th className="text-end pe-4">Manual Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.length === 0 ? (
                <tr>
                   <td colSpan="5" className="text-center py-5 fw-bold text-muted">No profiles found matching your search.</td>
                </tr>
              ) : filteredProfiles.map((p) => (
                <tr key={p.id}>
                  {/* Image & Name */}
                  <td className="ps-4">
                    <div className="d-flex align-items-center">
                      <img 
                        src={p.profileImageUrl ? `https://localhost:7065${p.profileImageUrl}` : "https://via.placeholder.com/40"} 
                        className="rounded-circle me-3 border shadow-sm profile-img-thumb" 
                        alt="User" 
                        style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                      />
                      <div>
                        <div className="fw-bold text-dark">{p.firstName} {p.lastName}</div>
                        <small className="text-muted fw-bold" style={{ fontSize: '10px' }}>Joined: {new Date(p.createdAt).toLocaleDateString()}</small>
                      </div>
                    </div>
                  </td>

                  {/* Phone Number */}
                  <td>
                    <div className="small text-dark fw-bold">
                        {p.phoneNumber || <span className="text-muted">No Phone</span>}
                    </div>
                  </td>

                  {/* Date of Birth */}
                  <td>
                    <div className="small text-dark fw-bold">
                        {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : <span className="text-muted">Not Set</span>}
                    </div>
                  </td>

                  {/* ID */}
                  <td>
                     <code className="text-danger fw-bold" style={{ fontSize: '12px' }}>
                        {p.id.toUpperCase()}
                     </code>
                     {p.isSuspended && <span className="ms-2 badge bg-danger">Suspended</span>}
                  </td>

                  {/* Actions */}
                  <td className="text-end pe-4">
                    <div className="action-button-container">
                      <button 
                        className="btn-action-verify" 
                        onClick={() => handleAction(p, 'verify')}
                        disabled={p.isVerified || p.isSuspended} // Disable if already verified or suspended
                      >
                        <FaCheck className="me-1" /> {p.isVerified ? 'Verified' : 'Verify'}
                      </button>
                      
                      <button 
                        className={p.isSuspended ? "btn-action-verify" : "btn-action-reject"} 
                        onClick={() => handleAction(p, 'suspend')}
                        style={p.isSuspended ? {backgroundColor: '#6c757d', borderColor: '#6c757d'} : {}}
                      >
                        {p.isSuspended ? <><FaCheck className="me-1" /> Unsuspend</> : <><FaTimes className="me-1" /> Suspend</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;