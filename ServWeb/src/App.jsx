import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

// PUBLIC PAGES
import Home from "./pages/Home";

// AUTH PAGES (✅ FIXED PATHS)
import Login from "./auth/Login/Login";
import Register from "./auth/Register/Register";
import Authcallback from "./auth/Authcallback";

import ForgotPassword from "./auth/Forgot password/ForgotPassword";
import ResetPassword from "./auth/Reset Password/ResetPassword";
import ConfirmEmail from "./auth/Confirm Email/ConfirmEmail";

// PROTECTED USER PAGES
import Services from "./pages/Services";
import ContactUs from "./pages/ContactUs";

// USER DASHBOARD
import UsersDashboard from "./pages/Users/UsersDashboard";
import ManageServices from "./pages/Users/ManageServices";
import MyProfile from "./pages/Users/MyProfile";
import Payments from "./pages/Users/Payments";
import Bookings from "./pages/Users/Bookings";
import Boost from "./pages/Users/Boost";
import Reviews from "./pages/Users/Reviews";

// ADMIN
import AdminDashboard from "./pages/Admin/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<Authcallback />} />

        {/* AUTH ROUTES */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />

        {/* PROTECTED USER ROUTES */}
        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <Services />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <ContactUs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute>
              <UsersDashboard />
            </ProtectedRoute>
          }
        />       
       <Route
         path="/payments"
         element={
         <ProtectedRoute>
          <Payments />
         </ProtectedRoute>
       }
      />
        <Route
          path="/services/manage"
          element={
            <ProtectedRoute>
              <ManageServices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
          <ProtectedRoute>
            <MyProfile />
          </ProtectedRoute>
        }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/boost"
          element={
            <ProtectedRoute>
              <Boost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <Reviews />
            </ProtectedRoute>
          }
        />

        {/* ADMIN ROUTE */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
