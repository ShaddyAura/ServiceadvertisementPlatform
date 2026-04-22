import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchProviderContacts,
  createProviderContact,
  updateProviderContact,
  deleteProviderContact
} from "../../../api/AccountApi";

export default function ProviderContactManage() {
  const { user } = useAuth();
  const Swal = window.Swal;

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal / Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [providerName, setProviderName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [operatingHours, setOperatingHours] = useState("");

  const loadContacts = useCallback(async () => {
    if (!user?.profileId) return;
    try {
      setLoading(true);
      const res = await fetchProviderContacts(user.profileId);
      setContacts(res.data || []);
    } catch (err) {
      console.error("Failed to load contacts", err);
    } finally {
      setLoading(false);
    }
  }, [user?.profileId]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const resetForm = () => {
    setEditingId(null);
    setProviderName("");
    setMobileNo("");
    setLocation("");
    setEmail("");
    setOperatingHours("");
    setShowForm(false);
  };

  const handleEdit = (contact) => {
    setEditingId(contact.id);
    setProviderName(contact.providerName || "");
    setMobileNo(contact.mobileNo || "");
    setLocation(contact.location || "");
    setEmail(contact.email || "");
    setOperatingHours(contact.operatingHours || "");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      profileId: user.profileId,
      providerName,
      mobileNo,
      location,
      email,
      operatingHours
    };

    try {
      if (editingId) {
        await updateProviderContact(editingId, payload);
        Swal.fire({ icon: 'success', title: 'Updated Successfully!', timer: 1500, showConfirmButton: false });
      } else {
        await createProviderContact(payload);
        Swal.fire({ icon: 'success', title: 'Added Successfully!', timer: 1500, showConfirmButton: false });
      }
      resetForm();
      loadContacts();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save contact details.', 'error');
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteProviderContact(id);
          Swal.fire('Deleted!', 'Contact info has been deleted.', 'success');
          loadContacts();
        } catch (err) {
          console.error(err);
          Swal.fire('Error', 'Could not delete.', 'error');
        }
      }
    });
  };

  if (loading) {
    return <div className="p-5 text-center"><div className="spinner-border text-danger"></div></div>;
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 fw-bold text-dark">Contact Information</h2>
        {!showForm && (
          <button className="btn btn-danger px-4 fw-bold" onClick={() => setShowForm(true)}>
            <i className="bi bi-plus-lg me-2"></i> Add Contact Details
          </button>
        )}
      </div>

      {showForm && (
        <div className="card shadow-sm mb-4 border-0">
          <div className="card-header bg-white py-3 border-bottom">
            <h5 className="m-0 fw-bold">{editingId ? 'Edit Contact' : 'New Contact Details'}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold small">Provider / Branch Name</label>
                <input type="text" className="form-control" value={providerName} onChange={e => setProviderName(e.target.value)} required placeholder="Main Office" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small">Mobile No</label>
                <input type="text" className="form-control" value={mobileNo} onChange={e => setMobileNo(e.target.value)} required placeholder="e.g. +977-9800000000" />
              </div>
              <div className="col-md-12">
                <label className="form-label fw-bold small">Location Address</label>
                <input type="text" className="form-control" value={location} onChange={e => setLocation(e.target.value)} required placeholder="Street Address, City" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small">Support Email</label>
                <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@example.com" />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small">Operating Hours</label>
                <input type="text" className="form-control" value={operatingHours} onChange={e => setOperatingHours(e.target.value)} placeholder="e.g. 9:00 AM - 6:00 PM" />
              </div>
              <div className="col-12 text-end mt-4">
                <button type="button" className="btn btn-outline-secondary me-2 px-4" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-success px-4 fw-bold">Save Contact Info</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 ps-4">Branch / Name</th>
                  <th>Mobile No</th>
                  <th>Location</th>
                  <th>Email</th>
                  <th>Hours</th>
                  <th className="pe-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.length > 0 ? contacts.map(c => (
                  <tr key={c.id}>
                    <td className="ps-4 fw-bold">{c.providerName}</td>
                    <td>{c.mobileNo}</td>
                    <td><small>{c.location}</small></td>
                    <td>{c.email || <span className="text-muted fst-italic">N/A</span>}</td>
                    <td><span className="badge bg-info text-dark">{c.operatingHours || 'N/A'}</span></td>
                    <td className="pe-4">
                      <div className="d-flex justify-content-end align-items-center gap-2">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(c)}>
                          <i className="bi bi-pencil-square"></i> Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)}>
                          <i className="bi bi-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">No contact information added yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
