import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./css/MyProfile.css";

export default function MyProfile() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="profile-layout">

      {/* ===== TOP NAVBAR ===== */}
      <header className="topbar">
        <input type="text" placeholder="Search..." />
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </header>

      <div className="profile-body">

        {/* ===== SIDEBAR ===== */}
        <aside className="sidebar">
          <h2>User Dashboard</h2>
          <NavLink to="/user-dashboard">Dashboard</NavLink>
          <NavLink to="/profile" className="active">My Profile</NavLink>
          <NavLink to="/services/manage">My Services</NavLink>
          <NavLink to="/boost">Boost Services</NavLink>
          <NavLink to="/bookings">Bookings</NavLink>
          <NavLink to="/payments">Payments</NavLink>
          <NavLink to="/reviews">Reviews</NavLink>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className="profile-content">

          <h1>My Profile</h1>

          <div className="profile-card">

            {/* Profile Image */}
            <div className="profile-left">
              <img
                src="https://i.pravatar.cc/150"
                alt="Profile"
              />
              <button className="change-photo">Change Photo</button>
            </div>

            {/* Profile Form */}
            <div className="profile-right">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value="John Doe" />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input type="email" value="john@example.com" />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input type="text" value="+1 234 567 890" />
              </div>

              <div className="form-group">
                <label>Profession</label>
                <input type="text" value="Service Provider" />
              </div>

              <div className="form-group full">
                <label>Bio</label>
                <textarea rows="4">
Professional service provider with 5+ years of experience.
                </textarea>
              </div>

              <div className="actions">
                <button className="save">Save Changes</button>
                <button className="cancel">Cancel</button>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
