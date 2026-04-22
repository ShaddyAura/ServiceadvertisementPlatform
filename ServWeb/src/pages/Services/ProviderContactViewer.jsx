import React, { useState, useEffect } from "react";
import { fetchProviderContacts, fetchProfileById } from "../../api/AccountApi";

export default function ProviderContactViewer({ profileId, realName }) {
  const [contacts, setContacts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) return;
    const loadData = async () => {
      try {
        setLoading(true);
        // Only fetch profile if realName was not passed from parent
        const tasks = [fetchProviderContacts(profileId)];
        if (!realName) {
          tasks.push(fetchProfileById(profileId));
        }

        const [contactRes, profileRes] = await Promise.all(tasks);
        setContacts(contactRes.data || []);
        
        if (!realName && profileRes) {
          setProfile(profileRes.data || null);
        }
      } catch (err) {
        console.error("Failed to load provider contact info", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [profileId, realName]);

  if (loading) return <div className="text-center p-3"><div className="spinner-border spinner-border-sm text-danger" /></div>;
  if (!contacts || contacts.length === 0) return null;

  const displayRealName = realName || (profile ? `${profile.firstName} ${profile.lastName}` : "Verified Provider");


  return (
    <div className="provider-contact-viewer mt-4">
      <h5 className="mb-3 fw-bold border-bottom pb-2">Contact Details</h5>
      <div className="row">
        {contacts.map((c) => (
          <div key={c.id} className="col-12 mb-3">
            <div className="card shadow-sm" style={{ background: '#ffffff', color: '#000000', borderRadius: '12px', border: '2px solid #000000' }}>
              <div className="card-body">
                <h6 className="fw-bold mb-3" style={{ color: '#ff4d4d' }}>
                  <i className="bi bi-person-badge-fill me-2"></i><strong>Provider:</strong> {displayRealName}
                </h6>
                
                {c.providerName && c.providerName.toLowerCase() !== "office" && (
                   <div className="mb-2 d-flex align-items-center">
                    <i className="bi bi-building me-2 text-primary"></i>
                    <span className="small"><strong>Office:</strong> {c.providerName}</span>
                  </div>
                )}

                <div className="mb-2 d-flex align-items-center">
                  <i className="bi bi-telephone-fill me-2 text-danger"></i>
                  <span className="small"><strong>MobileNo:</strong> {c.mobileNo}</span>
                </div>

                {c.email && (
                  <div className="mb-2 d-flex align-items-center">
                    <i className="bi bi-envelope-fill me-2 text-danger"></i>
                    <span className="small"><strong>Email:</strong> {c.email}</span>
                  </div>
                )}

                <div className="mb-2 d-flex align-items-center">
                  <i className="bi bi-pin-map-fill me-2 text-danger"></i>
                  <span className="small"><strong>Location:</strong> {c.location}</span>
                </div>

                {c.operatingHours && (
                  <div className="d-flex align-items-center">
                    <i className="bi bi-clock-fill me-2 text-danger"></i>
                    <span className="small"><strong>Hours:</strong> {c.operatingHours}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

