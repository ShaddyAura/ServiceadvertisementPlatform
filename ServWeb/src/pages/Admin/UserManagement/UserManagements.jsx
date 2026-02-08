import React, { useState } from "react";
import { FaUserShield, FaBan, FaCheckCircle, FaSearch } from "react-icons/fa";
import "./Usermanagement.css"; // Shared styles for tables

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="admin-page-content">
      <div className="page-header d-flex justify-content-between align-items-center">
        <div>
          <h3>User Management</h3>
          <p>Manage all customer and provider profiles.</p>
        </div>
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card border-0 shadow-sm mt-4">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="bg-light">
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Verification</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-weight-bold">Ram Bahadur</td>
                <td>Provider</td>
                <td><span className="badge badge-success">Verified</span></td>
                <td><span className="text-success">● Active</span></td>
                <td className="text-right">
                  <button className="btn btn-sm btn-outline-danger mr-2"><FaBan /> Ban</button>
                  <button className="btn btn-sm btn-dark"><FaUserShield /> Details</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default UserManagement;