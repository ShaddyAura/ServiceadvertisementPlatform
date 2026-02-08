import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
// FIX: Import the exact names from AccountApi.js
import { submitVerificationDocs, fetchUserDocuments } from "../../../api/AccountApi";
import { FaCloudUploadAlt, FaHistory, FaUserShield } from "react-icons/fa";
import "./DocumentVerified.css";

export default function DocumentVerified() {
  const { user, loading: authLoading } = useAuth();
  const Swal = window.Swal;

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetchUserDocuments(user.profileId);
      setDocuments(res.data || []);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.profileId) {
      loadDocuments();
    }
  }, [authLoading, user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFile(file);
      // Create preview if it's an image
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!documentFile) return Swal.fire("Error", "Please upload a document file.", "error");

    setSubmitting(true);
    const formData = new FormData();
    formData.append("ProfileId", user.profileId);
    formData.append("DocumentType", documentType);
    formData.append("DocumentNumber", documentNumber);
    formData.append("ExpiryDate", expiryDate);
    formData.append("DocumentFile", documentFile);

    try {
      // FIX: Using the correct function name here
      await submitVerificationDocs(formData);
      
      Swal.fire({ 
        icon: 'success', 
        title: 'Submission Received', 
        text: 'Your identity document has been sent for admin review.',
        confirmButtonColor: '#f40606'
      });
      
      loadDocuments();
      setDocumentType(""); setDocumentNumber(""); setExpiryDate(""); setDocumentFile(null); setPreview(null);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) return <div className="text-center p-5"><div className="spinner-border text-danger" /></div>;

  return (
    <div className="verification-wrapper p-4 animate-slide-up">
      <div className="d-flex align-items-center mb-4">
        <FaUserShield size={30} className="text-danger me-3" />
        <h2 className="main-heading m-0">Identity Verification</h2>
      </div>

      <div className="row">
        {/* Left: Form */}
        <div className="col-lg-5 mb-4">
          <div className="card shadow-sm border-0 rounded-lg">
            <div className="card-header bg-white py-3">
              <h5 className="m-0 fw-bold">Submit New ID</h5>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label small fw-bold">Document Type</label>
                  <select className="form-select custom-input" value={documentType} onChange={(e) => setDocumentType(e.target.value)} required>
                    <option value="">-- Choose Type --</option>
                    <option value="Citizenship">Citizenship</option>
                    <option value="License">Driving License</option>
                    <option value="Passport">Passport</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">ID Number</label>
                  <input type="text" className="form-control custom-input" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} required placeholder="Enter Document ID" />
                </div>

                <div className="mb-3">
                    <label className="form-label small fw-bold">Upload Document Image</label>
                    <div className="upload-box" onClick={() => document.getElementById('fileInput').click()}>
                        {preview ? (
                            <img src={preview} alt="Preview" className="img-fluid rounded" style={{maxHeight: '150px'}} />
                        ) : (
                            <div className="text-center py-3">
                                <FaCloudUploadAlt size={40} className="text-muted" />
                                <p className="small text-muted mb-0">Click to upload JPG/PNG/PDF</p>
                            </div>
                        )}
                        <input id="fileInput" type="file" hidden accept="image/*,.pdf" onChange={handleFileChange} />
                    </div>
                </div>
              </div>
              <div className="card-footer bg-light border-0">
                <button className="btn btn-danger w-100 fw-bold py-2 shadow-sm" type="submit" disabled={submitting}>
                  {submitting ? "Uploading..." : "Submit for Approval"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: History */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 rounded-lg overflow-hidden">
            <div className="card-header bg-white py-3 d-flex align-items-center">
              <FaHistory className="me-2 text-muted" />
              <h5 className="m-0 fw-bold">Verification History</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr className="small text-uppercase">
                    <th className="ps-3">Type</th>
                    <th>Number</th>
                    <th className="text-center">Status</th>
                    <th className="text-end pe-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr><td colSpan="4" className="text-center py-5 text-muted">No documents submitted yet.</td></tr>
                  ) : (
                    documents.map((doc) => (
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
                        <td className="text-end pe-3 small text-muted">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
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