import React from "react";
import { Outlet } from "react-router-dom";
import HorizontalAdmin from "../component/DashboardBars/HorizontalAdmin";
import VerticalAdmin from "../component/DashboardBars/VerticalAdmin";
import "./DashboardLayout.css";

const ServiceProviderLayout = () => {
  return (
    <div className="dashboard-wrapper">
      
      <HorizontalAdmin />

      <div className="dashboard-body">

        <VerticalAdmin />
        
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ServiceProviderLayout;