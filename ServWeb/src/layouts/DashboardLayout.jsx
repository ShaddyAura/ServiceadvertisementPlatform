import React from "react";
import { Outlet } from "react-router-dom";
import Horizontalbar from "../component/DashboardBars/Horizontalbar";
import Verticalbar from "../component/DashboardBars/Verticalbar";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  return (
    <div className="dashboard-wrapper">
      
      <Horizontalbar />

      {/* BODY */}
      <div className="dashboard-body">
        {/* SIDEBAR */}
        <Verticalbar />

        {/* PAGE CONTENT */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
