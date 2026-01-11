import React from "react";
import { NavLink } from "react-router-dom";
import "./css/UsersDashboard.css";

export default function UsersDashboard() {
  return (
    <div className="dashboard-layout">

      {/* ===== SIDEBAR ===== */}
     <aside className="sidebar">
     <h3>User Dashboard</h3>

     <nav className="sidebar-nav">
    <NavLink to="/user-dashboard" className="nav-item">
      Dashboard
    </NavLink>

    <NavLink to="/profile" className="nav-item">
      My Profile
    </NavLink>

    <NavLink to="/services/manage" className="nav-item">
      My Services
    </NavLink>

    <NavLink to="/boost" className="nav-item">
      Boost Services
    </NavLink>

    <NavLink to="/bookings" className="nav-item">
      Bookings
    </NavLink>

    <NavLink to="/payments" className="nav-item">
      Payments
    </NavLink>

    <NavLink to="/reviews" className="nav-item">
      Reviews
    </NavLink>

    <NavLink to="/login" className="nav-item logout">
      Logout
    </NavLink>
    </nav>
   </aside>


      {/* ===== MAIN ===== */}
      <div className="main">

        {/* ===== TOPBAR ===== */}
        <header className="topbar">
          <input type="text" placeholder="Search..." />
          <button className="logout-btn">Logout</button>
        </header>

        {/* ===== CONTENT ===== */}
        <div className="content">

          {/* ===== STATS ===== */}
          <div className="stats">
            <div className="stat blue"></div>
            <div className="stat orange"></div>
            <div className="stat yellow"></div>
            <div className="stat green"></div>
          </div>

          {/* ===== WELCOME & ACTIONS ===== */}
          <div className="welcome-actions">
            <div className="welcome-card">
              <h2>Welcome Back, John Doe!</h2>
              <p>Service Provider</p>
              <div className="buttons">
                <button className="dark">View Profile</button>
                <button>Edit Profile</button>
              </div>
            </div>

            <div className="action blue">
              ➕ Create New Service
            </div>

            <div className="action grey">
              🚀 Boost Your Service
              <p>Boost Listings & Get More Views</p>
            </div>
          </div>

          {/* ===== BOOKINGS + NOTIFICATIONS ===== */}
          <div className="grid-two">
            <div className="card">
              <h3>Recent Bookings</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Home Cleaning</td>
                    <td>Emily Smith</td>
                    <td>Dec 15, 2025</td>
                    <td><span className="badge green">Confirmed</span></td>
                  </tr>
                  <tr>
                    <td>Plumbing Repair</td>
                    <td>Alex Brown</td>
                    <td>Dec 18, 2025</td>
                    <td><span className="badge yellow">Pending</span></td>
                  </tr>
                  <tr>
                    <td>Electrician Service</td>
                    <td>Michael Lee</td>
                    <td>Dec 20, 2025</td>
                    <td><span className="badge blue">Completed</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3>Notifications</h3>
              <ul className="notifications">
                <li>✔ New booking request from Alex Brown</li>
                <li>💰 Payment of $150 received</li>
                <li>⭐ New review received</li>
              </ul>
            </div>
          </div>

          {/* ===== EARNINGS + REVIEWS ===== */}
          <div className="grid-two">
            <div className="card">
              <h3>Earnings Overview</h3>
              <div className="chart-placeholder">Chart</div>
            </div>

            <div className="card">
              <h3>User Reviews</h3>
              <p><strong>Sarah W.</strong></p>
              <p>★★★★★</p>
              <p>"Excellent service, very professional!"</p>

              <p><strong>David K.</strong></p>
              <p>★★★★☆</p>
              <p>"Quick response and quality work."</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
