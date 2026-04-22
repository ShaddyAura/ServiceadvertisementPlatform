import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchAllServices,
  createService,
  deleteService,
  fetchCategories,
} from "../../../api/AccountApi";
import "./ServiceProvider.css";

export default function ServiceProvider() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const Swal = window.Swal;

  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form states
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("09:00:00");
  const [endTime, setEndTime] = useState("18:00:00");
  const [status, setStatus] = useState("Active");
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  // loadData wrapped in useCallback to prevent unnecessary re-renders
  const loadData = useCallback(async () => {


    try {
      setLoading(true);
      const [serviceRes, categoryRes] = await Promise.all([
        fetchAllServices(),
        fetchCategories(),
      ]);

      // Filter logic: Ensure we only show services belonging to this profile
      const userServices = serviceRes.data?.filter((s) => s.profileId === user.profileId) || [];

      setServices(userServices);
      setCategories(categoryRes.data || []);

      // Ensure the "Add Form" is closed when data reloads
      setShowAddForm(false);
    } catch (err) {
      console.error("Load failed", err);
    } finally {
      // CRITICAL: Ensure loading is set to false even on error to reveal the UI
      setLoading(false);
    }
  }, [user?.profileId]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, loadData]);

  const handleMediaPreview = (type, url, title) => {
    const fullUrl = `https://localhost:7065${url}`;
    if (type === 'video') {
      Swal.fire({
        title: title,
        html: `<div class="video-preview-container">
                <video src="${fullUrl}" controls autoplay style="width:100%; border-radius:10px;"></video>
               </div>`,
        showCloseButton: true,
        showConfirmButton: false,
        width: '800px',
      });
    } else {
      Swal.fire({
        title: title,
        imageUrl: fullUrl,
        imageAlt: 'Service Image',
        showCloseButton: true,
        showConfirmButton: false,
      });
    }
  };

  const formatToAmPm = (timeStr) => {
    if (!timeStr) return "N/A";
    try {
      const [hourStr, minStr] = timeStr.split(':');
      if (hourStr === undefined || minStr === undefined) return timeStr;
      let hour = parseInt(hourStr, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12;
      hour = hour ? hour : 12; // the hour '0' should be '12'
      return `${hour}:${minStr} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const resetForm = () => {
    setTitle(""); setPrice(""); setCategoryName(""); setDescription("");
    setStartTime("09:00:00"); setEndTime("18:00:00"); setStatus("Active");
    setImageFile(null); setVideoFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("ProfileId", user.profileId);
    formData.append("Title", title);
    formData.append("Price", price);
    formData.append("Category", categoryName);
    formData.append("Description", description);
    formData.append("StartTime", startTime);
    formData.append("EndTime", endTime);
    formData.append("Status", status);
    if (imageFile) formData.append("ImageFile", imageFile);
    if (videoFile) formData.append("VideoFile", videoFile);

    if (parseFloat(price) <= 0) {
      return Swal.fire('Validation Error', 'Price must be greater than 0.', 'warning');
    }

    try {
      await createService(formData);
      Swal.fire({ icon: 'success', title: 'Saved', confirmButtonColor: '#28a745' });
      resetForm();
      loadData();
    } catch (err) {
      Swal.fire('Error', 'Failed to save service.', 'error');
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteService(id);
          Swal.fire('Deleted!', 'Service removed.', 'success');
          loadData();
        } catch (err) {
          Swal.fire('Error', 'Delete failed', 'error');
        }
      }
    });
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = services.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(services.length / itemsPerPage);

  // If auth is still checking, show spinner
  if (authLoading || (loading && services.length === 0)) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-danger" />
        <p className="mt-2 text-muted">Loading your services...</p>
      </div>
    );
  }

  return (
    <div className="manage-services-container p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="main-heading">Service Management</h2>
        {/* Toggle between "Add" button and "Form" */}
        {!showAddForm && (
          <button className="btn btn-success font-weight-bold px-4 shadow-sm" onClick={() => setShowAddForm(true)}>
            + Add New Service
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="card add-service-card shadow mb-4 animate-slide-down">
          <div className="card-header bg-white"><h5 className="m-0 font-weight-bold text-dark">New Service Details</h5></div>
          <form onSubmit={handleSubmit}>
            <div className="card-body bg-white py-3">
              <div className="row">
                <div className="col-md-6 mb-2">
                  <label className="small font-weight-bold text-dark">Service Title</label>
                  <input className="form-control custom-input-white" placeholder="Enter title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="col-md-3 mb-2">
                  <label className="small fw-bold">Category</label>
                  <select
                    className="form-select custom-input-white"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                  >
                    <option value="">-- Select --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3 mb-2">
                  <label className="small font-weight-bold text-dark">Price (Rs.)</label>
                  <input type="number" min="0" className="form-control custom-input-white" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="col-md-3 mb-2">
                  <label className="small font-weight-bold text-dark">Start Time</label>
                  <input type="time" step="1" className="form-control custom-input-white" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                </div>
                <div className="col-md-3 mb-2">
                  <label className="small font-weight-bold text-dark">End Time</label>
                  <input type="time" step="1" className="form-control custom-input-white" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="small fw-bold text-dark">Initial Status</label>
                  <select
                    className="form-select custom-input-white"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div className="col-md-6 mb-2">
                  <label className="small font-weight-bold text-dark">Thumbnail (Image)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control custom-input-white"
                    onChange={(e) => {
                      setImageFile(e.target.files[0]);
                      if (e.target.files[0]) setVideoFile(null); // Clear video if image selected
                    }}
                  />
                  <small className="text-danger font-weight-bold d-block mt-1">
                    * Please upload only one: either Thumbnail Image or Video Promo.
                  </small>
                </div>
                <div className="col-md-6 mb-2">
                  <label className="small font-weight-bold text-dark">Video Promo</label>
                  <input
                    type="file"
                    accept="video/*"
                    className="form-control custom-input-white"
                    onChange={(e) => {
                      setVideoFile(e.target.files[0]);
                      if (e.target.files[0]) setImageFile(null); // Clear image if video selected
                    }}
                  />
                  <small className="text-danger font-weight-bold d-block mt-1">
                    * Please upload only one: either Thumbnail Image or Video Promo.
                  </small>
                </div>
                <div className="col-12 mb-0">
                  <label className="small font-weight-bold text-dark">Description</label>
                  <textarea className="form-control custom-input-white" rows="5" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="card-footer bg-white d-flex justify-content-end pb-3 border-0">
              <button type="button" className="btn btn-secondary mr-2" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-success font-weight-bold px-4">Save Service</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-responsive bg-white shadow-sm table-red-border">
        <table className="table table-hover mb-0 custom-data-table">
          <thead>
            <tr>
              <th className="pl-4">SN</th>
              <th>Media</th>
              <th>Service Name</th>
              <th>Category</th>
              <th>Availability</th>
              <th>Status</th>
              <th className="text-right">Price</th>
              <th className="text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? currentItems.map((s, index) => (
              <tr key={s.id}>
                <td className="pl-4">{indexOfFirstItem + index + 1}</td>
                <td>
                  <div className="media-cell-wrapper">
                    {s.videoUrl ? (
                      <video
                        src={`https://localhost:7065${s.videoUrl}`}
                        className="media-preview-item"
                        muted loop playsInline
                        onClick={() => handleMediaPreview('video', s.videoUrl, s.title)}
                      />
                    ) : (
                      <img
                        src={s.imageUrl ? `https://localhost:7065${s.imageUrl}` : "placeholder.jpg"}
                        className="media-preview-item"
                        alt=""
                        onClick={() => s.imageUrl && handleMediaPreview('image', s.imageUrl, s.title)}
                      />
                    )}
                  </div>
                </td>
                <td><div className="service-title-text font-weight-bold">{s.title}</div></td>
                <td><span className="badge badge-category">{s.category || "General"}</span></td>
                <td><small className="text-muted"><i className="far fa-clock mr-1"></i> {formatToAmPm(s.startTime)} - {formatToAmPm(s.endTime)}</small></td>
                <td>
                  <span className={`badge ${s.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                    {s.status || "N/A"}
                  </span>
                </td>
                <td className="text-right"><span className="price-text-bold">Rs. {s.price}</span></td>
                <td className="text-right pr-4">

                  <div className="action-cell">

                    {/* Review Button */}
                    <button
                      className="btn-action-transparent icon-blue mr-2"
                      title="View Reviews"
                      onClick={() => navigate(`/review?serviceId=${s.id}`)}
                    >
                      <i className="far fa-star"></i>
                    </button>
                    <button className="btn-action-transparent icon-teal" onClick={() => navigate(`/services/edit/${s.id}`)}><i className="far fa-edit"></i></button>
                    <button className="btn-action-transparent icon-red" onClick={() => handleDelete(s.id)}><i className="far fa-trash-alt"></i></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" className="text-center py-5 text-muted">No services found. Click "+ Add New Service" to get started.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {services.length > 0 && (
          <div className="card-footer bg-white py-3 border-top d-flex justify-content-between align-items-center">
            <div className="small text-muted">Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, services.length)} of {services.length} services</div>
            <ul className="pagination m-0 custom-red-pagination">
              <li className={`page-item mx-1 ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}>Previous</button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i} className={`page-item mx-1 ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                </li>
              ))}
              <li className={`page-item mx-1 ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}>Next</button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}