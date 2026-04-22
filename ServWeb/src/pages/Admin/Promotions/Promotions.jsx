import React, { useEffect, useState } from "react";
import { fetchCategories } from "../../../api/AccountApi";
import { FaTag, FaPlus, FaTrash, FaEdit, FaPercent, FaCalendarAlt, FaCheck, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import "./Promotions.css";
import "../AdminDashboard.css";

const STORAGE_KEY = "platform_promotions";

const getPromotions = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
};

const savePromotions = (promos) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(promos));
};

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [discount, setDiscount] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setPromotions(getPromotions());
    fetchCategories()
      .then(res => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  const resetForm = () => {
    setDiscount("");
    setCategory("");
    setStartDate("");
    setEndDate("");
    setMessage("");
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!discount || !category || !startDate || !endDate || !message) {
      Swal.fire("Incomplete", "Please fill all fields.", "warning");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      Swal.fire("Invalid Dates", "End date must be after start date.", "warning");
      return;
    }
    if (Number(discount) <= 0 || Number(discount) > 100) {
      Swal.fire("Invalid Discount", "Discount must be between 1 and 100.", "warning");
      return;
    }

    let updated;
    if (editingId) {
      updated = promotions.map(p =>
        p.id === editingId
          ? { ...p, discount: Number(discount), category, startDate, endDate, message, updatedAt: new Date().toISOString() }
          : p
      );
      Swal.fire({ title: "Updated!", text: "Promotion updated successfully.", icon: "success", timer: 1500, showConfirmButton: false });
    } else {
      const newPromo = {
        id: Date.now().toString(),
        discount: Number(discount),
        category,
        startDate,
        endDate,
        message,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      updated = [newPromo, ...promotions];
      Swal.fire({ title: "Created!", text: "Promotion created successfully.", icon: "success", timer: 1500, showConfirmButton: false });
    }

    savePromotions(updated);
    setPromotions(updated);
    resetForm();
  };

  const handleEdit = (promo) => {
    setEditingId(promo.id);
    setDiscount(promo.discount.toString());
    setCategory(promo.category);
    setStartDate(promo.startDate);
    setEndDate(promo.endDate);
    setMessage(promo.message);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Promotion?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete"
    }).then(result => {
      if (result.isConfirmed) {
        const updated = promotions.filter(p => p.id !== id);
        savePromotions(updated);
        setPromotions(updated);
        Swal.fire({ title: "Deleted!", icon: "success", timer: 1200, showConfirmButton: false });
      }
    });
  };

  const toggleActive = (id) => {
    const updated = promotions.map(p =>
      p.id === id ? { ...p, isActive: !p.isActive } : p
    );
    savePromotions(updated);
    setPromotions(updated);
  };

  const getStatus = (promo) => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    if (!promo.isActive) return { label: "Disabled", cls: "promo-status-disabled" };
    if (now < start) return { label: "Scheduled", cls: "promo-status-scheduled" };
    if (now > end) return { label: "Expired", cls: "promo-status-expired" };
    return { label: "Active", cls: "promo-status-active" };
  };

  return (
    <div className="admin-dash-container">
      <div className="admin-dash-header">
        <div>
          <h2 className="admin-dash-title"><FaTag color="#6366f1" /> Promotions & Discounts</h2>
          <p className="admin-dash-subtitle">Create and manage category-wide discount campaigns visible on the homepage.</p>
        </div>
        <button className="promo-add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
          <FaPlus /> New Promotion
        </button>
      </div>

      {/* CREATE / EDIT FORM */}
      {showForm && (
        <div className="promo-form-card">
          <div className="promo-form-header">
            <h5>{editingId ? "✏️ Edit Promotion" : "🎉 Create New Promotion"}</h5>
            <button className="promo-form-close" onClick={resetForm}><FaTimes /></button>
          </div>
          <form onSubmit={handleSubmit} className="promo-form-body">
            <div className="promo-form-grid">
              <div className="promo-field">
                <label><FaPercent className="promo-field-icon" /> Discount (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                  placeholder="e.g. 20"
                  className="form-control"
                />
              </div>

              <div className="promo-field">
                <label><FaTag className="promo-field-icon" /> Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="form-control"
                >
                  <option value="">Select Category</option>
                  <option value="All Categories">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="promo-field">
                <label><FaCalendarAlt className="promo-field-icon" /> Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="promo-field">
                <label><FaCalendarAlt className="promo-field-icon" /> End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <div className="promo-field promo-field-full">
              <label>📢 Promotion Message</label>
              <textarea
                rows="3"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="e.g. Summer Sale! Get 20% off on all cleaning services this month."
                className="form-control"
                maxLength={200}
              />
              <div className="promo-char-count">{message.length}/200</div>
            </div>

            <div className="promo-form-actions">
              <button type="button" className="promo-cancel-btn" onClick={resetForm}>Cancel</button>
              <button type="submit" className="promo-submit-btn">
                <FaCheck /> {editingId ? "Update Promotion" : "Create Promotion"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PROMOTIONS TABLE */}
      <div className="promo-table-card">
        {promotions.length === 0 ? (
          <div className="promo-empty">
            <FaTag className="promo-empty-icon" />
            <h4>No promotions yet</h4>
            <p>Create your first promotion to attract more customers!</p>
          </div>
        ) : (
          <div className="promo-table-wrap">
            <table className="promo-table">
              <thead>
                <tr>
                  <th>Discount</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promo, idx) => {
                  const status = getStatus(promo);
                  return (
                    <tr key={promo.id} style={{ animationDelay: `${idx * 0.05}s` }} className="promo-row-anim">
                      <td>
                        <span className="promo-discount-badge">{promo.discount}% OFF</span>
                      </td>
                      <td>
                        <span className="promo-category-pill">{promo.category}</span>
                      </td>
                      <td>
                        <div className="promo-dates">
                          <span>{new Date(promo.startDate).toLocaleDateString()}</span>
                          <span className="promo-date-arrow">→</span>
                          <span>{new Date(promo.endDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td>
                        <span className="promo-message-text">{promo.message}</span>
                      </td>
                      <td>
                        <span className={`promo-status ${status.cls}`}>{status.label}</span>
                      </td>
                      <td>
                        <div className="promo-actions">
                          <button
                            className={`promo-toggle-btn ${promo.isActive ? "active" : ""}`}
                            onClick={() => toggleActive(promo.id)}
                            title={promo.isActive ? "Disable" : "Enable"}
                          >
                            {promo.isActive ? "ON" : "OFF"}
                          </button>
                          <button className="promo-edit-btn" onClick={() => handleEdit(promo)} title="Edit">
                            <FaEdit />
                          </button>
                          <button className="promo-delete-btn" onClick={() => handleDelete(promo.id)} title="Delete">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Promotions;
