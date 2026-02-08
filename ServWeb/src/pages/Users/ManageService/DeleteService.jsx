import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchServiceById, deleteService } from "../../../api/AccountApi";
import "./ManageServices.css";

export default function DeleteService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const Swal = window.Swal;

  useEffect(() => {
    const getService = async () => {
      try {
        setLoading(true);
        const res = await fetchServiceById(id);
        setService(res.data);
      } catch (err) {
        navigate("/user-dashboard/services");
      } finally {
        setLoading(false);
      }
    };
    getService();
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      await deleteService(id);
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'The service has been permanently removed.',
        confirmButtonColor: '#dc3545',
        timer: 1500
      });
      navigate("/user-dashboard/services");
    } catch (err) {
      Swal.fire("Error", "Delete failed. Please try again.", "error");
    }
  };

  if (loading) return (
    <div className="text-center p-5">
      <div className="spinner-border text-danger" />
    </div>
  );

  return (
    <div className="manage-services-container d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      {/* Light Red Border applied to the delete card as well */}
      <div className="card shadow-lg text-center p-4 table-red-border animate-slide-down" style={{ maxWidth: '480px', backgroundColor: '#ffffff' }}>
        <div className="card-body">
          <div className="mb-4">
            {/* Using Font Awesome Trash Icon to match your dashboard */}
            <i className="fas fa-trash-alt text-danger" style={{ fontSize: '5rem', opacity: 0.8 }}></i>
          </div>
          
          <h2 className="main-heading mb-3">Confirm Deletion</h2>
          
          <p className="table-text-dark mb-4" style={{ fontSize: '1.1rem' }}>
            Are you sure you want to delete <br />
            <strong className="text-danger">"{service?.title}"</strong>?
          </p>
          
          <div className="alert alert-warning small py-2">
            <strong>Warning:</strong> This action cannot be reversed.
          </div>

          <div className="d-flex flex-column gap-2 mt-4">
            <button 
              className="btn btn-danger btn-lg font-weight-bold mb-2 shadow-sm" 
              onClick={handleDelete}
              style={{ height: '50px' }}
            >
              Confirm & Delete
            </button>
            <button 
              className="btn btn-light btn-lg border font-weight-bold" 
              onClick={() => navigate(-1)}
              style={{ height: '50px' }}
            >
              Cancel, Keep it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}