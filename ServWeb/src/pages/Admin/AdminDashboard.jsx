import React from "react";
import { Outlet } from "react-router-dom";
import HorizontalAdmin from "../../component/DashboardBars/HorizontalAdmin";
import VerticalAdmin from "../../component/DashboardBars/VerticalAdmin";
import "../../pages/Admin/AdminDashboard.css"; // Reuse the same layout CSS

export default function AdminDashboard() {
  return (
    <div className="dashboard-wrapper">
      {/* ===== TOP HORIZONTAL BAR (ADMIN) ===== */}
      <HorizontalAdmin />

      <div className="dashboard-layout">
        {/* ===== LEFT VERTICAL BAR (ADMIN) ===== */}
        <VerticalAdmin />

        {/* ===== MAIN CONTENT AREA ===== */}
        <div className="main">
          {/* Renders AdminDashboard, UserManagement, etc. */}
          <Outlet /> 
        </div>
      </div>
    </div>
  );
}