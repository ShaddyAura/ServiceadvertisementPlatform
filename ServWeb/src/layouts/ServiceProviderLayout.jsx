import React from "react";
import { Outlet } from "react-router-dom";
import HorizontalServiceProvider from "../component/DashboardBars/HorizontalServiceProvider";
import VerticalServiceProvider from "../component/DashboardBars/VerticalServiceProvider";
import "./DashboardLayout.css";

const ServiceProviderLayout = () => {
  return (
    <div className="dashboard-wrapper">
      
      <HorizontalServiceProvider />

      <div className="dashboard-body">

        <VerticalServiceProvider />
        
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ServiceProviderLayout;