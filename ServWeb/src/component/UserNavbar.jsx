import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const UserNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('jwtToken');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <NavLink className="navbar-brand fw-bold" to="/user/dashboard">
        E-Medicine (User Panel)
      </NavLink>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#userNavbar"
        aria-controls="userNavbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon" />
      </button>
      <div className="collapse navbar-collapse" id="userNavbar">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <NavLink className="nav-link" to="/user/dashboard">
              User Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/user/orders">
              My Orders
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/medicines">
              All Products
            </NavLink>
          </li>
          <li className="nav-item">
             <NavLink className="nav-link" to="/user/myProfile">
             My Profile
              </NavLink>
           </li>

          <li className="nav-item">
            <NavLink className="nav-link" to="/user/cart">
              Cart
            </NavLink>
          </li>
        </ul>
        <button className="btn btn-outline-light" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default UserNavbar;
