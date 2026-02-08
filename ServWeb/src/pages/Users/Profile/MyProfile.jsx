import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { 
  fetchProfileByUserId, 
  updateProfile, 
  uploadProfileImage,
  fetchUserDocuments,
  submitVerificationDocs 
} from "../../../api/AccountApi";
import { FaCloudUploadAlt, FaHistory, FaUserShield, FaCamera, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import "./MyProfile.css";

export default function MyProfile() {
  const { user, loading: authLoading } = useAuth();
  const Swal = window.Swal;

  // Data States
  const [profile, setProfile] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Action States
  const [updating, setUpdating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Profile Form State
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");

  // Document Form State (Updated for Dual Sides)
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);

  const loadData = async () => {
    const userId = user?.id || user?.Id;
    if (!userId) return;

    try {
      setLoading(true);
      const profRes = await fetchProfileByUserId(userId);

      if (profRes.data) {
        const pData = profRes.data;
        setProfile(pData);
        setFullName(pData.fullName || pData.FullName || "");
        setBio(pData.bio || pData.Bio || "");

        const profileId = pData.id || pData.Id;
        const docRes = await fetchUserDocuments(profileId);
        setDocs(docRes.data || []);
      }
    } catch (err) {
      console.error("❌ Profile load failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (user?.id || user?.Id)) {
      loadData();
    }
  }, [authLoading, user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const pId = profile?.id || profile?.Id;
    try {
      await updateProfile(pId, { ...profile, fullName, bio, id: pId });
      Swal.fire({ icon: 'success', title: 'Profile Updated', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
      loadData();
    } catch (err) {
      Swal.fire('Error', 'Update failed', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const pId = profile?.id || profile?.Id;
    try {
      Swal.showLoading();
      await uploadProfileImage(pId, file);
      Swal.fire({ icon: 'success', title: 'Image Uploaded', timer: 1500 });
      loadData();
    } catch (err) {
      Swal.fire("Error", "Upload failed", "error");
    }
  };

  // Logic for handling file selection and preview
  const handleFileChange = (e, side) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    if (side === 'front') {
      setFrontFile(file);
      setFrontPreview(url);
    } else {
      setBackFile(file);
      setBackPreview(url);
    }
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    const pId = profile?.id || profile?.Id;
    
    if (!frontFile || !backFile) {
      return Swal.fire("Required", "Please upload both front and back images.", "warning");
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("ProfileId", pId);
    formData.append("DocumentType", documentType);
    formData.append("DocumentNumber", documentNumber);
    formData.append("DocumentFrontSide", frontFile); // Matches updated DTO
    formData.append("DocumentBackSide", backFile);   // Matches updated DTO

    try {
      await submitVerificationDocs(formData);
      Swal.fire({ icon: 'success', title: 'Submitted', text: 'Both sides sent for review.', confirmButtonColor: '#28a745' });
      
      // Reset document form
      setDocumentType(""); setDocumentNumber(""); 
      setFrontFile(null); setBackFile(null); 
      setFrontPreview(null); setBackPreview(null);
      loadData();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) return <div className="text-center p-5"><div className="spinner-border text-danger" /></div>;

  return (
    <div className="my-profile-container p-4">
      <div className="row">
        {/* LEFT COLUMN: Identity Card & Document Upload */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 text-center p-4 bg-white mb-4 table-red-border">
            <div className="position-relative d-inline-block mx-auto mb-3">
              <img 
                src={profile?.profileImageUrl ? `https://localhost:7065${profile.profileImageUrl}` : "https://via.placeholder.com/150"} 
                className="rounded-circle border shadow-sm avatar-img"
                alt="Avatar"
              />
              <label className="camera-btn">
                <FaCamera />
                <input type="file" hidden onChange={handleImageChange} accept="image/*" />
              </label>
            </div>
            <h4 className="fw-bold mb-1">{fullName || "Set Your Name"}</h4>
            <p className="text-muted small mb-3">{user?.email}</p>
            <div className={`status-badge ${profile?.isVerified ? 'verified' : 'pending'}`}>
              {profile?.isVerified ? <><FaCheckCircle className="me-1"/> Verified</> : "Unverified"}
            </div>
          </div>

          <div className="card shadow-sm border-0 table-red-border">
            <div className="card-header bg-white border-bottom-0 pt-3">
              <h6 className="fw-bold m-0"><FaUserShield className="me-2 text-danger"/>Verify Identity</h6>
            </div>
            <form onSubmit={handleDocSubmit}>
              <div className="card-body pt-2">
                <select className="form-select mb-2 custom-input" value={documentType} onChange={(e) => setDocumentType(e.target.value)} required>
                  <option value="">Document Type</option>
                  <option value="Citizenship">Citizenship</option>
                  <option value="License">Driving License</option>
                  <option value="Passport">Passport</option>
                </select>
                <input type="text" className="form-control mb-3 custom-input" placeholder="Document Number" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} required />
                
                <div className="row g-2">
                  <div className="col-6">
                    <label className="tiny-label fw-bold text-muted text-uppercase">Front Side</label>
                    <div className="doc-upload-area" onClick={() => document.getElementById('frontInput').click()}>
                      {frontPreview ? <img src={frontPreview} className="preview-small" alt="front" /> : 
                        <div className="text-muted tiny-text"><FaCloudUploadAlt size={20}/><br/>Upload</div>
                      }
                      <input id="frontInput" type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'front')} />
                    </div>
                  </div>
                  <div className="col-6">
                    <label className="tiny-label fw-bold text-muted text-uppercase">Back Side</label>
                    <div className="doc-upload-area" onClick={() => document.getElementById('backInput').click()}>
                      {backPreview ? <img src={backPreview} className="preview-small" alt="back" /> : 
                        <div className="text-muted tiny-text"><FaCloudUploadAlt size={20}/><br/>Upload</div>
                      }
                      <input id="backInput" type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'back')} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-white border-0 pb-3">
                <button className="btn btn-danger w-100 rounded-pill btn-sm fw-bold shadow-sm" disabled={submitting}>
                  {submitting ? "Processing..." : "Submit Both Sides"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Edit and History */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 mb-4 table-red-border">
            <div className="card-header bg-white"><h5 className="m-0 fw-bold">Account Details</h5></div>
            <form onSubmit={handleProfileSubmit}>
              <div className="card-body">
                <div className="mb-3">
                  <label className="small fw-bold text-muted text-uppercase">Public Name</label>
                  <input className="form-control custom-input-white" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="mb-0">
                  <label className="small fw-bold text-muted text-uppercase">Biography</label>
                  <textarea className="form-control custom-input-white" rows="4" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Describe your expertise..." />
                </div>
              </div>
              <div className="card-footer bg-white text-end border-0 pb-4">
                <button type="submit" className="btn btn-success px-5 rounded-pill fw-bold shadow-sm" disabled={updating}>
                  {updating ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>

          <div className="card shadow-sm border-0 table-red-border">
            <div className="card-header bg-white d-flex align-items-center">
               <FaHistory className="me-2 text-muted"/> <h5 className="m-0 fw-bold">Verification History</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light small text-uppercase">
                  <tr>
                    <th className="ps-3">Type</th>
                    <th>ID Number</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((doc) => (
                    <tr key={doc.id}>
                      <td className="ps-3 fw-bold">{doc.documentType}</td>
                      <td className="text-muted">{doc.documentNumber}</td>
                      <td className="text-center">
                        <span className={`badge rounded-pill px-3 py-2 ${
                          doc.status === 'Approved' ? 'bg-success-subtle text-success border border-success' : 
                          doc.status === 'Rejected' ? 'bg-danger-subtle text-danger border border-danger' : 
                          'bg-warning-subtle text-warning border border-warning'
                        }`}>
                          {doc.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {docs.length === 0 && (
                    <tr><td colSpan="3" className="text-center py-4 text-muted small"><FaInfoCircle className="me-1"/> No documents submitted.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}