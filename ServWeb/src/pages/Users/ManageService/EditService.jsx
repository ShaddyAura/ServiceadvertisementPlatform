import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchServiceById, updateService, fetchCategories } from "../../../api/AccountApi";
import Swal from 'sweetalert2'; // SweetAlert for error handling and success messages
import "./ManageServices.css"; 

export default function EditService() {
  const { id } = useParams(); // Extract the service ID from the URL
  const navigate = useNavigate(); // For navigation to other pages (back)
  const [categories, setCategories] = useState([]); // Store categories for dropdown
  const [loading, setLoading] = useState(true); // Track loading state
  const [submitting, setSubmitting] = useState(false); // Track submitting state for the form

  // Form fields state
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [status, setStatus] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true); // Set loading to true while fetching data
        // Fetch categories and service data
        const [catRes, serviceRes] = await Promise.all([
          fetchCategories(),
          fetchServiceById(id),
        ]);

        const service = serviceRes.data;
        setCategories(catRes.data || []);

        // Set form fields with the fetched service data
        setTitle(service.title || "");
        setPrice(service.price || "");
        setCategoryName(service.category || "");
        setDescription(service.description || "");
        setStartTime(service.startTime || "");
        setEndTime(service.endTime || "");
        setStatus(service.status || "Active");
      } catch (err) {
        console.error("Error loading service details:", err); // Log errors
        Swal.fire("Error", "Could not load service data.", "error"); // Show error message
        navigate(-1); // Navigate back if there's an error
      } finally {
        setLoading(false); // Set loading to false once data is fetched
      }
    };

    loadInitialData(); // Call the function to fetch data
  }, [id, navigate]); // Depend on 'id' to reload when it changes

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setSubmitting(true); // Set submitting state to true

    const formData = new FormData(); // Prepare form data for the update request
    formData.append("Id", id);
    formData.append("Title", title);
    formData.append("Price", price);
    formData.append("Category", categoryName);
    formData.append("Description", description);
    formData.append("StartTime", startTime);
    formData.append("EndTime", endTime);
    formData.append("Status", status);

    // Add files to form data if present
    if (imageFile) formData.append("ImageFile", imageFile);
    if (videoFile) formData.append("VideoFile", videoFile);

    try {
      // Call updateService to send the data to the server
      await updateService(id, formData);
      Swal.fire({
        icon: 'success',
        title: 'Updated Successfully',
        showConfirmButton: false,
        timer: 1500,
      });
      navigate(-1); // Navigate back to the previous page after success
    } catch (err) {
      // Show error message if there's an issue with updating the service
      Swal.fire("Error", err.response?.data?.message || "Error updating service.", "error");
    } finally {
      setSubmitting(false); // Set submitting state back to false
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-danger" role="status"></div>
        <p className="mt-2 font-weight-bold">Loading Service Details...</p>
      </div>
    );
  }

  return (
    <div className="manage-services-container p-3">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="main-heading">Edit Service Details</h2>
        <button className="btn btn-secondary px-4 font-weight-bold" onClick={() => navigate(-1)}>
          Cancel / Back
        </button>
      </div>

      {/* Main Form Card */}
      <div className="card add-service-card shadow animate-slide-down">
        <div className="card-header bg-white">
          <h5 className="m-0 font-weight-bold text-dark">Updating: {title}</h5>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="card-body bg-white py-4">
            <div className="row">
              {/* Service Title */}
              <div className="col-md-6 mb-3">
                <label className="small font-weight-bold text-dark">Service Title</label>
                <input
                  className="form-control custom-input-white"
                  placeholder="Service Title"
                  value={title}
                  required
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="col-md-3 mb-3">
                <label className="small font-weight-bold text-dark">Category</label>
                <select
                  className="form-control custom-input-white"
                  value={categoryName}
                  required
                  onChange={(e) => setCategoryName(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="col-md-3 mb-3">
                <label className="small font-weight-bold text-dark">Price (Rs.)</label>
                <input
                  type="number"
                  className="form-control custom-input-white"
                  value={price}
                  required
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              {/* Media Uploads */}
              <div className="col-md-6 mb-3">
                <label className="small font-weight-bold text-dark">Update Thumbnail (Optional)</label>
                <input
                  type="file"
                  className="form-control custom-input-white"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="small font-weight-bold text-dark">Update Video (Optional)</label>
                <input
                  type="file"
                  className="form-control custom-input-white"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files[0])}
                />
              </div>

              {/* Availability & Status */}
              <div className="col-md-4 mb-3">
                <label className="small font-weight-bold text-dark">Available From</label>
                <input
                  type="time"
                  className="form-control custom-input-white"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="small font-weight-bold text-dark">Available Until</label>
                <input
                  type="time"
                  className="form-control custom-input-white"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="small font-weight-bold text-dark">Status</label>
                <select
                  className="form-control custom-input-white"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              {/* Description */}
              <div className="col-12 mb-2">
                <label className="small font-weight-bold text-dark">Service Description</label>
                <textarea
                  className="form-control custom-input-white"
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="card-footer bg-white d-flex justify-content-end pb-3 border-0">
            <button 
              className="btn btn-success px-5 font-weight-bold shadow-sm" 
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Update Service Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
