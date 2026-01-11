import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('jwtToken');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <NavLink className="navbar-brand fw-bold" to="/admin/dashboard">
        Admin Panel
      </NavLink>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#adminNavbar"
        aria-controls="adminNavbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon" />
      </button>
      <div className="collapse navbar-collapse" id="adminNavbar">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin/dashboard">Admin Dashboard</NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin/medicine">Medicine Management</NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin/customers">Customer Management</NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin/orders">Order Management</NavLink>
          </li>
        </ul>
        <button className="btn btn-outline-light" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
