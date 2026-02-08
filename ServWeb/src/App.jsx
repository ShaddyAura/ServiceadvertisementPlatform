import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import DashboardLayout from "./layouts/DashboardLayout";

// PUBLIC
import Home from "./pages/Home";
import Login from "./auth/Login/Login";
import Register from "./auth/Register/Register";
import Authcallback from "./auth/Authcallback";
import ForgotPassword from "./auth/Forgot password/ForgotPassword";
import ResetPassword from "./auth/Reset Password/ResetPassword";
import ConfirmEmail from "./auth/Confirm Email/ConfirmEmail";

// USER DASHBOARD PAGES
import UsersDashboard from "./pages/Users/UsersDashboard";
import ManageServices from "./pages/Users/ManageService/ManageServices";
import EditService from "./pages/Users/ManageService/EditService";   
import DeleteService from "./pages/Users/ManageService/DeleteService";
import MyProfile from "./pages/Users/Profile/MyProfile";
import DocumentVerified from "./pages/Users/Profile/DocumentVerified";
import Payments from "./pages/Users/Payments/Payments";
import Bookings from "./pages/Users/Bookings/Bookings";
import Boost from "./pages/Users/Boost/Boost";
import Reviews from "./pages/Users/Reviews/Review";
import Chats from "./pages/Users/Chats/Chats";

// Admin Dashboard 

import AdCampaigns from "./pages/Admin/AdCampaigns/AdCampaigns";
import FinancialOverview from "./pages/Admin/FinancialOverview/FinancialOverviews";
import IdentityVerification  from "./pages/Admin/IdentityVerification/IdentityVerification";
import SystemDisputes from "./pages/Admin/SystemDisputes/SystemDisputes";
import UserManagement from "./pages/Admin/UserManagement/UserManagements";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import SystemSettings from "./pages/Admin/SystemSettings/SystemSettings";

// OTHER
import Services from "./pages/Services";
import ContactUs from "./pages/ContactUs";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<Authcallback />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />

        {/* PROTECTED NORMAL PAGES */}
        <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><ContactUs /></ProtectedRoute>} />

        {/* USER DASHBOARD WITH LAYOUT */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/user-dashboard" element={<UsersDashboard />} />
          
          {/* Services routes fixed to match your UI navigation */}
          <Route path="/services/manage" element={<ManageServices />} />
          <Route path="/services/edit/:id" element={<EditService />} />
          <Route path="/services/delete/:id" element={<DeleteService />} />
          
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/document-verified" element={<DocumentVerified />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/boost" element={<Boost />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/chats" element={<Chats />} />
        </Route>

         
          {/* ADMIN SECTION */}
          <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
             {/* This will render at /admin/dashboard */}
              <Route index element={<AdminDashboard />} /> 
              <Route path="admin-dashboard" element={<AdminDashboard />} />
          
              {/* Management Pages */}
              <Route path="admin/users" element={<UserManagement />} />
              <Route path="verifications" element={<IdentityVerification />} />
          
             {/* Financial & Growth */}
              <Route path="finances" element={<FinancialOverview />} />
              <Route path="boosts" element={<AdCampaigns />} />
          
             {/* Support & System */}
              <Route path="disputes" element={<SystemDisputes />} />

              <Route path="settings" element={<SystemSettings />} />
          </Route>
      </Routes>
    </BrowserRouter>
  );
}