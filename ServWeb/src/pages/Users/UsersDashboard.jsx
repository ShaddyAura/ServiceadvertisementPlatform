import React from "react";
import { Outlet } from "react-router-dom"; // Add this import
import Horizontalbar from "../../component/DashboardBars/Horizontalbar";
import Verticalbar from "../../component/DashboardBars/Verticalbar";

export default function UsersDashboard() {
  return (
    <div className="dashboard-wrapper">
      {/* ===== TOP HORIZONTAL BAR ===== */}
      {/* <Horizontalbar /> */}

      {/* ===== BODY AREA ===== */}
      <div className="dashboard-layout">
        {/* ===== LEFT VERTICAL BAR ===== */}
        {/* <Verticalbar /> */}

        {/* ===== MAIN CONTENT ===== */}
        <div className="main">
           {/* 🔥 THIS IS THE FIX: This renders your ManageServices, Bookings, etc. */}
           <Outlet /> 
        </div>
      </div>
    </div>
  );
}