import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchAllServices,
  createService,
  deleteService,
  fetchCategories,
} from "../../../api/AccountApi";
import "./ManageServices.css";

export default function ManageServices() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const Swal = window.Swal;

  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; 

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [serviceRes, categoryRes] = await Promise.all([
        fetchAllServices(),
        fetchCategories(),
      ]);
      const userServices = serviceRes.data?.filter((s) => s.profileId === user?.profileId) || [];
      setServices(userServices);
      setCategories(categoryRes.data || []);
    } catch (err) {
      console.error("Load failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.profileId) loadData();
  }, [authLoading, user]);

  const resetForm = () => {
    setTitle(""); setPrice(""); setCategoryName("");
    setDescription(""); setImageFile(null); setVideoFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("ProfileId", user.profileId);
    formData.append("Title", title);
    formData.append("Price", price);
    formData.append("Category", categoryName);
    formData.append("Description", description);
    if (imageFile) formData.append("ImageFile", imageFile);
    if (videoFile) formData.append("VideoFile", videoFile);

    try {
      await createService(formData);
      Swal.fire({ icon: 'success', title: 'Saved', confirmButtonColor: '#28a745' });
      resetForm();
      setShowAddForm(false);
      loadData();
    } catch (err) {
      Swal.fire('Error', 'Failed to save', 'error');
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Delete?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteService(id);
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

  if (authLoading || loading) return <div className="text-center p-5"><div className="spinner-border text-danger" /></div>;

  return (
    <div className="manage-services-container p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="main-heading">Service Management</h2>
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
                  <input className="form-control custom-input-white" placeholder="Enter service title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="col-md-3 mb-2">
                  <label className="small font-weight-bold text-dark">Category</label>
                  <select className="form-control custom-input-white" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required>
                    <option value="">-- Select Category --</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-md-3 mb-2">
                  <label className="small font-weight-bold text-dark">Price (Rs.)</label>
                  <input type="number" className="form-control custom-input-white" placeholder="Enter amount" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="small font-weight-bold text-dark">Thumbnail Image</label>
                  <input type="file" className="form-control custom-input-white" onChange={(e) => setImageFile(e.target.files[0])} />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="small font-weight-bold text-dark">Video Promo</label>
                  <input type="file" className="form-control custom-input-white" onChange={(e) => setVideoFile(e.target.files[0])} />
                </div>
                <div className="col-12 mb-0">
                  <label className="small font-weight-bold text-dark">Description</label>
                  <textarea className="form-control custom-input-white" rows="1" placeholder="Short description..." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="card-footer bg-white d-flex justify-content-end pb-3 border-0">
              <button type="button" className="btn btn-secondary mr-2 px-4" onClick={() => { resetForm(); setShowAddForm(false); }}>Cancel</button>
              <button type="submit" className="btn btn-success px-5 font-weight-bold">Save Service</button>
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
              <th>Service Details</th>
              <th className="text-right">Price</th>
              <th className="text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((s, index) => (
              <tr key={s.id}>
                <td className="pl-4 font-weight-bold text-muted">{indexOfFirstItem + index + 1}</td>
                <td>
                  <div className="d-flex align-items-center">
                    {s.imageUrl ? (
                        <img src={`https://localhost:7065${s.imageUrl}`} className="rounded border" style={{ width: 60, height: 45, objectFit: 'cover' }} alt="" />
                    ) : (
                        <div style={{width: 60, height: 45, background: '#f2f5f8', borderRadius: '4px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            <i className="fas fa-image text-muted"></i>
                        </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="service-title-text">{s.title}</div>
                  <div className="service-category-text">{s.category || 'MARKETING'}</div>
                </td>
                <td className="text-right">
                    <span className="price-text-bold">Rs. {s.price}</span>
                </td>
                <td className="text-right pr-4">
                  <div className="action-cell">
                    <button className="btn-action-transparent icon-teal" title="Edit" onClick={() => navigate(`services/edit/${s.id}`)}>
                      <i className="far fa-edit"></i>
                    </button>
                    <button className="btn-action-transparent icon-red" title="Delete" onClick={() => handleDelete(s.id)}>
                      <i className="far fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="card-footer bg-white py-3 border-top">
          <ul className="pagination m-0 float-right custom-red-pagination">
            <li className={`page-item mx-1 ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
            </li>
            <li className="page-item active mx-1"><span className="page-link">{currentPage}</span></li>
            <li className={`page-item mx-1 ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}