import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { fetchAllServices, fetchCategories, updateService } from "../../../api/AccountApi";

export default function ServiceEditProvider() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const Swal = window.Swal;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("Active");
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const loadServiceData = useCallback(async () => {
    try {
      setLoading(true);
      const [serviceRes, categoryRes] = await Promise.all([
        fetchAllServices(),
        fetchCategories(),
      ]);

      setCategories(categoryRes.data || []);

      // Ensure comparison works regardless of type (string vs number)
      const service = serviceRes.data?.find((s) => String(s.id) === String(id));

      if (service) {
        setTitle(service.title || "");
        setPrice(service.price || "");
        setCategoryName(service.category || "");
        setDescription(service.description || "");
        setStartTime(service.startTime || "09:00:00");
        setEndTime(service.endTime || "18:00:00");
        setStatus(service.status || "Active");
      } else {
        Swal.fire({
          icon: "error",
          title: "Service not found",
          text: "We couldn't find the service you're trying to edit.",
        }).then(() => navigate("/services/manage"));
      }
    } catch (err) {
      console.error("Load failed", err);
      Swal.fire("Error", "Failed to load data from server", "error");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      loadServiceData();
    }
  }, [id, loadServiceData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("ProfileId", user?.profileId);
    formData.append("Title", title);
    formData.append("Price", price);
    formData.append("Category", categoryName);
    formData.append("Description", description);
    formData.append("StartTime", startTime);
    formData.append("EndTime", endTime);
    formData.append("Status", status);
    
    // Only append files if the user selected new ones
    if (imageFile) formData.append("ImageFile", imageFile);
    if (videoFile) formData.append("VideoFile", videoFile);

    try {
      await updateService(id, formData);
      await Swal.fire({ 
        icon: 'success', 
        title: 'Saved', 
        text: 'Service updated successfully!',
        confirmButtonColor: '#28a745' 
      });
      navigate("/services/manage"); 
    } catch (err) {
      Swal.fire('Error', 'Failed to update service.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-danger" />
        <p className="mt-2 text-muted">Loading service data...</p>
      </div>
    );
  }

  return (
    <div className="manage-services-container p-4">
      <div className="card shadow-sm border-0 animate-slide-down">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h4 className="m-0 font-weight-bold text-dark">Edit Service Details</h4>
        
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="card-body bg-white p-4">
            <div className="row">
              {/* Title */}
              <div className="col-md-6 mb-3">
                <label className="small font-weight-bold">Service Title</label>
                <input 
                  className="form-control custom-input" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>

              {/* Category */}
              <div className="col-md-3 mb-3">
                <label className="small font-weight-bold">Category</label>
                <select 
                  className="form-control custom-input" 
                  value={categoryName} 
                  onChange={(e) => setCategoryName(e.target.value)} 
                  required
                >
                  <option value="">-- Select --</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              {/* Price */}
              <div className="col-md-3 mb-3">
                <label className="small font-weight-bold">Price (Rs.)</label>
                <input 
                  type="number" 
                  className="form-control custom-input" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  required 
                />
              </div>

              {/* Timing: Start */}
              <div className="col-md-3 mb-3">
                <label className="small font-weight-bold">Start Time</label>
                <input 
                  type="time" 
                  step="1" 
                  className="form-control custom-input" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)} 
                  required 
                />
              </div>

              {/* Timing: End */}
              <div className="col-md-3 mb-3">
                <label className="small font-weight-bold">End Time</label>
                <input 
                  type="time" 
                  step="1" 
                  className="form-control custom-input" 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)} 
                  required 
                />
              </div>

              {/* Status */}
              <div className="col-md-6 mb-3">
                <label className="small font-weight-bold">Availability Status</label>
                <select 
                  className="form-control custom-input" 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              {/* Media: Image */}
              <div className="col-md-6 mb-3">
                <label className="small font-weight-bold">Update Thumbnail (Image)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="form-control-file border p-2 w-100 rounded" 
                  onChange={(e) => setImageFile(e.target.files[0])} 
                />
                <small className="text-muted">Leave empty to keep current image</small>
              </div>

              {/* Media: Video */}
              <div className="col-md-6 mb-3">
                <label className="small font-weight-bold">Update Promo Video</label>
                <input 
                  type="file" 
                  accept="video/*" 
                  className="form-control-file border p-2 w-100 rounded" 
                  onChange={(e) => setVideoFile(e.target.files[0])} 
                />
                <small className="text-muted">Leave empty to keep current video</small>
              </div>

              {/* Description */}
              <div className="col-12 mb-2">
                <label className="small font-weight-bold">Service Description</label>
                <textarea 
                  className="form-control custom-input" 
                  rows="4" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                />
              </div>
            </div>
          </div>

          <div className="card-footer bg-light d-flex justify-content-end p-3 border-0">
            <button 
              type="button" 
              className="btn btn-outline-secondary mr-2 px-4" 
              onClick={() => navigate("/services/manage")}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-success px-5 font-weight-bold shadow-sm"
            >
              Update Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}