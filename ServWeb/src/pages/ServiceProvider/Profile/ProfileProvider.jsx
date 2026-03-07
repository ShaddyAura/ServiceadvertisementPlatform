import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchProfileByUserId,
  updateProfile,
  uploadProfileImage,
  submitVerificationDocs,
  getAddressHierarchy,
  updateDocument,
  fetchUserDocuments,
} from "../../../api/AccountApi";
import {
  FaCloudUploadAlt,
  FaUserShield,
  FaCamera,
  FaCheckCircle,
  FaIdCard,
  FaHourglassHalf,
  FaMapMarkerAlt,
  FaTimesCircle,
  FaEnvelope,
} from "react-icons/fa";
import Swal from "sweetalert2";
import "./ProfileProvider.css";

export default function ProfileProvider() {
  const { user, loading: authLoading } = useAuth();
  const BASE_URL = "https://localhost:7065";

  // State Management
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");

  // Address Fields
  const [hierarchy, setHierarchy] = useState({});
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [specificAddress, setSpecificAddress] = useState("");

  // Document Fields
  const [documentId, setDocumentId] = useState(null);
  const [docStatus, setDocStatus] = useState(null);
  const [adminRemark, setAdminRemark] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);

  const skipKeywords = ["RM municipality", "Monohara municipality", "MP municipality", "Karmarong municipality"];
  const isLocked = docStatus === 0 || docStatus === 4;

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [profRes, hierarchyRes] = await Promise.all([
        fetchProfileByUserId(user.id),
        getAddressHierarchy()
      ]);

      const p = profRes.data;
      setProfile(p);
      setHierarchy(hierarchyRes.data || {});
      
      setPhone(p.phoneNumber || "");
      setDob(p.dateOfBirth ? p.dateOfBirth.split("T")[0] : "");

      // Map Address Parts
      if (p.address && p.address.includes(",")) {
        const parts = p.address.split(",").map(s => s.trim());
        if (parts.length >= 5) {
          setSelectedProvince(parts[0]);
          setSelectedDistrict(parts[1]);
          setSelectedMunicipality(parts[2]);
          setSelectedWard(parts[3]);
          setSpecificAddress(parts[4]);
        }
      }

      // Fetch Documents
      const docRes = await fetchUserDocuments(p.id);
      const doc = Array.isArray(docRes.data) ? docRes.data[0] : docRes.data;

      if (doc) {
        setDocumentId(doc.id);
        setDocStatus(doc.status);
        setAdminRemark(doc.message || "");
        setDocumentType(doc.documentType.toString());
        setDocumentNumber(doc.documentNumber || "");
        setFrontPreview(doc.documentFrontSideUrl ? `${BASE_URL}${doc.documentFrontSideUrl}` : null);
        setBackPreview(doc.documentBackSideUrl ? `${BASE_URL}${doc.documentBackSideUrl}` : null);
      }
    } catch (err) {
      console.error("Data Load Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && user) loadData();
  }, [authLoading, user, loadData]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const fullAddress = `${selectedProvince}, ${selectedDistrict}, ${selectedMunicipality}, ${selectedWard}, ${specificAddress}`;
      const updateData = { 
        id: profile.id, 
        fullName: `${user.firstName} ${user.lastName}`, 
        phoneNumber: phone, 
        dateOfBirth: dob, 
        address: fullAddress 
      };
      await updateProfile(profile.id, updateData);
      Swal.fire({ icon: "success", title: "Profile Updated", timer: 1500, showConfirmButton: false });
      loadData();
    } catch (err) {
      Swal.fire("Update Failed", "Check your inputs.", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await uploadProfileImage(profile.id, file);
      loadData();
    } catch (err) {
      Swal.fire("Upload Failed", "Error updating image", "error");
    }
  };

  const handleFileChange = (e, side) => {
    if (isLocked) return;
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    side === "front" ? setFrontFile(file) : setBackFile(file);
    side === "front" ? setFrontPreview(preview) : setBackPreview(preview);
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;
    setSubmitting(true);
    const formData = new FormData();
    formData.append("DocumentType", documentType);
    formData.append("DocumentNumber", documentNumber);
    if (frontFile) formData.append("DocumentFrontSide", frontFile);
    if (backFile) formData.append("DocumentBackSide", backFile);

    try {
      if (documentId) {
        await updateDocument(documentId, formData);
        Swal.fire("Resubmitted", "Documents sent for review.", "success");
      } else {
        if (!frontFile || !backFile) return Swal.fire("Required", "Upload both sides", "warning");
        formData.append("ProfileId", profile.id);
        await submitVerificationDocs(formData);
        Swal.fire("Success", "Documents submitted.", "success");
      }
      setFrontFile(null); setBackFile(null);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Action failed.";
      Swal.fire("Document Already Verified", msg, " Error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading || !profile) return <div className="text-center p-5">Syncing Profile...</div>;

  return (
    <div className="account-verification-page py-4">
      <div className="container">
        <div className="row g-4">
          
          {/* LEFT: PERSONAL DETAILS */}
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white py-3"><h5 className="mb-0 fw-bold"><FaIdCard className="text-primary me-2"/>Profile Details</h5></div>
              <div className="card-body">
                <div className="text-center mb-4">
                  <div className="avatar-wrapper shadow-sm mx-auto" style={{position:'relative', width:'110px', height:'110px'}}>
                    <img src={profile.profileImageUrl ? `${BASE_URL}${profile.profileImageUrl}` : "https://via.placeholder.com/150"} className="rounded-circle w-100 h-100 border object-fit-cover" alt="profile" />
                    <label className="bg-primary text-white rounded-circle p-2 shadow" style={{position:'absolute', bottom:0, right:0, cursor:'pointer'}}><FaCamera size={14} /><input hidden type="file" onChange={handleImageChange} accept="image/*" /></label>
                  </div>
                  <h6 className="mt-2 fw-bold mb-0">{user?.firstName} {user?.lastName}</h6>
                  <small className="text-muted"><FaEnvelope className="me-1"/>{user?.email}</small>
                </div>

                <form onSubmit={handleProfileUpdate}>
                  <div className="row g-3">
                    <div className="col-6"><label className="small fw-bold">Phone</label><input className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
                    <div className="col-6"><label className="small fw-bold">DOB</label><input type="date" className="form-control" value={dob} onChange={(e) => setDob(e.target.value)} required /></div>
                  </div>

                  <div className="mt-4 p-3 bg-light rounded border">
                    <h6 className="fw-bold mb-3 small text-uppercase"><FaMapMarkerAlt className="text-danger me-2"/>Address Hierarchy</h6>
                    <div className="row g-2">
                      <div className="col-6">
                        <select className="form-select form-select-sm" value={selectedProvince} onChange={(e) => {setSelectedProvince(e.target.value); setSelectedDistrict(""); setSelectedMunicipality(""); setSelectedWard("");}} required>
                          <option value="">Province</option>
                          {Object.keys(hierarchy).filter(p => !skipKeywords.some(k => p.toLowerCase().includes(k.toLowerCase()))).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="col-6">
                        <select className="form-select form-select-sm" value={selectedDistrict} disabled={!selectedProvince} onChange={(e) => {setSelectedDistrict(e.target.value); setSelectedMunicipality(""); setSelectedWard("");}} required>
                          <option value="">District</option>
                          {selectedProvince && hierarchy[selectedProvince] && Object.keys(hierarchy[selectedProvince]).map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="col-6">
                        <select className="form-select form-select-sm" value={selectedMunicipality} disabled={!selectedDistrict} onChange={(e) => {setSelectedMunicipality(e.target.value); setSelectedWard("");}} required>
                          <option value="">Municipality</option>
                          {selectedDistrict && hierarchy[selectedProvince]?.[selectedDistrict] && Object.keys(hierarchy[selectedProvince][selectedDistrict]).map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div className="col-6">
                        <select className="form-select form-select-sm" value={selectedWard} disabled={!selectedMunicipality} onChange={(e) => setSelectedWard(e.target.value)} required>
                          <option value="">Ward</option>
                          {selectedMunicipality && hierarchy[selectedProvince]?.[selectedDistrict]?.[selectedMunicipality]?.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                      </div>
                      <div className="col-12"><input className="form-control form-control-sm" value={specificAddress} onChange={(e) => setSpecificAddress(e.target.value)} placeholder="Street/Tole Address" required /></div>
                    </div>
                  </div>
                  <button className="btn btn-primary w-100 mt-4 fw-bold shadow-sm" disabled={updating}>{updating ? "Updating..." : "Save Profile Details"}</button>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT: DOCUMENTS */}
          <div className="col-lg-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white py-3"><h5 className="mb-0 fw-bold"><FaUserShield className="text-danger me-2"/>Identity Verification</h5></div>
              <div className="card-body">
                {adminRemark && (
                  <div className={`p-3 mb-4 rounded border-start border-4 ${docStatus === 4 ? "bg-success-subtle border-success" : "bg-danger-subtle border-danger"}`}>
                    <small className="fw-bold d-block mb-1">Feedback:</small><p className="mb-0 small italic">"{adminRemark}"</p>
                  </div>
                )}
                <form onSubmit={handleDocSubmit}>
                  <div className="row g-3 mb-4">
                    <div className="col-6"><label className="small fw-bold">ID Type</label>
                      <select className="form-select" value={documentType} disabled={isLocked} onChange={(e) => setDocumentType(e.target.value)} required>
                        <option value="">Select</option>
                        <option value="0">Citizenship</option><option value="1">Passport</option><option value="2">License</option><option value="3">NIN Card</option>
                      </select>
                    </div>
                    <div className="col-6"><label className="small fw-bold">Number</label><input className="form-control" value={documentNumber} disabled={isLocked} onChange={(e) => setDocumentNumber(e.target.value)} required /></div>
                  </div>
                  <div className="row g-3 mb-4">
                    {['front', 'back'].map(side => (
                      <div className="col-6" key={side}>
                        <div className="border rounded p-2 text-center bg-light position-relative" onClick={() => !isLocked && document.getElementById(side).click()} style={{cursor: isLocked?'default':'pointer', minHeight:'130px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                          {(side === 'front' ? frontPreview : backPreview) ? (
                            <img src={side === 'front' ? frontPreview : backPreview} className="img-fluid rounded" alt={side} style={{maxHeight:'110px'}} />
                          ) : (
                            <div><FaCloudUploadAlt className="fs-2 text-muted d-block mx-auto mb-1"/><span className="small text-muted text-uppercase">{side}</span></div>
                          )}
                          <input hidden id={side} type="file" onChange={(e) => handleFileChange(e, side)} disabled={isLocked} accept="image/*" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="alert alert-info py-2 small text-center mb-4">
                    Status: <strong className="text-uppercase">{docStatus === 4 ? "Approved" : docStatus === 0 ? "Pending Review" : docStatus === 2 ? "Rejected" : "Image Must Be less than 5MB"}</strong>
                  </div>
                  {!isLocked ? (
                    <button className="btn btn-danger w-100 fw-bold shadow-sm" disabled={submitting}>{submitting ? "Uploading..." : "Submit for Verification"}</button>
                  ) : (
                    <div className="p-2 text-center text-muted border rounded bg-light small fw-bold"><FaCheckCircle className="text-success me-1"/> VERIFIED & DATA SECURED</div>
                  )}
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}