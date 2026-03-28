import React, { useEffect, useState } from 'react';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../../../api/AccountApi';
import Swal from 'sweetalert2';
import './category.css';
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaSave
} from 'react-icons/fa';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    iconClass: 'bi bi-grid',
    isActive: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetchCategories();
      setCategories(res.data || []);
    } catch (err) {
      Swal.fire('Error', 'Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditMode(true);
      setFormData({ ...cat });
    } else {
      setEditMode(false);
      setFormData({ id: 0, name: '', iconClass: 'bi bi-grid', isActive: true });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await updateCategory(formData.id, formData);
        Swal.fire('Updated!', 'Category updated successfully', 'success');
      } else {
        await createCategory(formData);
        Swal.fire('Created!', 'New category added', 'success');
      }
      setShowModal(false);
      loadCategories();
    } catch (err) {
      Swal.fire('Error', 'Action failed.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: "Users won't be able to see this category!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (confirm.isConfirmed) {
      try {
        await deleteCategory(id);
        Swal.fire('Deleted!', 'Category removed.', 'success');
        loadCategories();
      } catch {
        Swal.fire('Error', 'Could not delete category.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="container mt-4 category-page">
      {/* Header */}
      <div className="category-header d-flex justify-content-between align-items-center mb-4">
        <h2 className="m-0">Category Management</h2>
        <button className="add-btn" onClick={() => handleOpenModal()}>
          <FaPlus /> Add Category
        </button>
      </div>

      {/* Search */}
      <div className="search-box mb-4">
        <FaSearch className="search-icon" />
        <input
          type="text"
          className="form-control"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table Card */}
      <div className="category-card shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="table-light">
              <tr>
                {/* <th style={{ width: '80px' }}>Icon</th> */}
                <th>Name</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <tr key={cat.id}>
                    {/* <td>
                      <div className="icon-box">
                        <i className={cat.iconClass}></i>
                      </div>
                    </td> */}
                    <td className="fw-bold">{cat.name}</td>
                    <td>
                      <span className={`status-badge ${cat.isActive ? 'active' : 'inactive'}`}>
                        {cat.isActive ? <FaCheckCircle /> : <FaTimesCircle />}
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-end">
                      <button className="btn-action btn-edit me-2" onClick={() => handleOpenModal(cat)}>
                        <FaEdit />
                      </button>
                      <button className="btn-action btn-delete" onClick={() => handleDelete(cat.id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">No categories found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simple Modal Overlay */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content-custom">
            <div className="modal-header-custom">
              <h4>{editMode ? 'Edit Category' : 'Add New Category'}</h4>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body-custom">
                <div className="mb-3">
                  <label className="form-label">Category Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Icon Class (Bootstrap Icons)</label>
                  <input
                    type="text"
                    name="iconClass"
                    className="form-control"
                    value={formData.iconClass}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-check form-switch mt-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    id="isActiveSwitch"
                  />
                  <label className="form-check-label" htmlFor="isActiveSwitch">Active Status</label>
                </div>
              </div>
              <div className="modal-footer-custom">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <FaSave className="me-2" /> {editMode ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;