import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadingProvider } from "./context/LoadingContext";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import ServiceProviderRoute from './routes/ServiceProviderRoute';
import ServiceProviderLayout from "./layouts/ServiceProviderLayout";
import AdminLayout from "./layouts/AdminLayout";
import Notification from "./component/Notifications/Notification";

// PUBLIC
import Home from "./pages/Home";
import Login from "./auth/Login/Login";
import ProviderLogin from "./auth/Login/ProviderLogin";
import Register from "./auth/Register/Register";
import ProviderRegister from  "./auth/Register/ProviderRegister";
import PaymentSuccess from "./pages/Payment/PaymentSuccess";
import PaymentFailure from "./pages/Payment/PaymentFailure";

import Authcallback from "./auth/Authcallback";
import ForgotPassword from "./auth/Forgot password/ForgotPassword";
import ResetPassword from "./auth/Reset Password/ResetPassword";
import ConfirmEmail from "./auth/Confirm Email/ConfirmEmail";
import ChangePassword from "./pages/Auth/ChangePassword";

// USER DASHBOARD PAGES
import UsersDashboard from "./pages/Users/UsersDashboard";   
import MyProfile from "./pages/Users/Profile/MyProfile";
import Payments from "./pages/Users/Payments/Payments";
import Bookings from "./pages/Users/Bookings/Bookings";
import Reviews from "./pages/Users/Reviews/Review";
import Chats from "./pages/Users/Chats/Chats";
import ChatList from "./pages/Users/Chats/ChatList";
import Points from "./pages/Users/Point/PointsTrans";
import Reedems from "./pages/Users/ReedemGifts/Reedems";
import Gifts from "./pages/Users/Gifts/Gifts";
import Announcements from "./pages/Users/Announcements/Announcements";

// Admin Dashboard 
import AdCampaigns from "./pages/Admin/AdCampaigns/AdCampaigns";
import FinancialOverview from "./pages/Admin/FinancialOverview/FinancialOverviews";
import IdentityVerification  from "./pages/Admin/IdentityVerification/IdentityVerification";
import ServiceReport from "./pages/Admin/Report/ServiceReport"
import ReportReview from "./pages/Admin/Report/ReportReview"
import UserManagement from "./pages/Admin/UserManagement/UserManagements";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import SystemSettings from "./pages/Admin/SystemSettings/SystemSettings";
import Categories from "./pages/Admin/Categorys/Categories";
import BookingReport from "./pages/Admin/Report/BookingReport"
import ReviewModeration from "./pages/Admin/ReviewModeration/ReviewModeration";
import Broadcasting from "./pages/Admin/Broadcasting/Broadcasting";
import AdminWithdrawals from "./pages/Admin/Withdrawals/AdminWithdrawals";
import Promotions from "./pages/Admin/Promotions/Promotions";
import ProviderPayouts from "./pages/ServiceProvider/Payouts/ProviderPayouts";


// ServiceProvider Route
import ProviderDashboard from "./pages/ServiceProvider/ProviderDashboard";
import ServiceProvider from "./pages/ServiceProvider/ManageService/ServiceProvider";
import ServiceEditProvider from "./pages/ServiceProvider/ManageService/ServiceEditProvider";   
import ProfileProvider from "./pages/ServiceProvider/Profile/ProfileProvider";
import PaymentProvider from "./pages/ServiceProvider/PaymentProviders/PaymentProvider";
import BookingsProvider from "./pages/ServiceProvider/BookingsProvider/BookingProvider";
import BoostProvider from "./pages/ServiceProvider/Boost/BoostProvider";
import Review from "./pages/ServiceProvider/Review/ReviewProvider";
import ChatProvider from "./pages/ServiceProvider/ChatProvider/ChatProvider";     
import ChatListProvider from "./pages/ServiceProvider/ChatProvider/ChatListProivider";
import PointProvider from "./pages/ServiceProvider/Points/PointProvider";
import ReedemGiftsProvider from "./pages/ServiceProvider/ReedemsGifts/ReedemsGiftsProvider";
import GiftProvider from "./pages/ServiceProvider/Gifts/GiftProvider";
import MyBookings from "./pages/ServiceProvider/ProviderReport/mybookings";
import AnnouncementsProvider from "./pages/ServiceProvider/Announcements/AnnouncementsProvider";


import Services from "./pages/Services";
import ContactUs from "./pages/ContactUs";


export default function App() {
  return (
    <BrowserRouter>
      <LoadingProvider>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/providerlogin" element={<ProviderLogin />} />
        <Route path="/providerregister" element= {<ProviderRegister/>}/>
        <Route path="/auth/callback" element={<Authcallback />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/change-password" element={<ChangePassword />} />
         <Route path="/Notification" element={<Notification />} />

        {/* PROTECTED NORMAL PAGES (Shared) */}
        <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute><ContactUs /></ProtectedRoute>} />
        <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
        <Route path="/payment/failure" element={<ProtectedRoute><PaymentFailure /></ProtectedRoute>} />

        {/* --- USER/CUSTOMER DASHBOARD --- */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/user-dashboard" element={<UsersDashboard />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/chats/:bookingId" element={<Chats />} />
          <Route path="/chats" element={<ChatList />} />
          <Route path="/points" element={<Points />} />
          <Route path="/reedems" element={<Reedems />} />
          <Route path="/gifts" element={<Gifts />} />
          <Route path="/announcements" element={<Announcements />} />
        </Route>

    
     <Route element={ <ServiceProviderRoute><ServiceProviderLayout /></ServiceProviderRoute>}>
        <Route path="/serviceproviderDashboard" element={<ProviderDashboard />} />
        <Route path="/services/manage" element={<ServiceProvider />} />
        <Route path="/services/edit/:id" element={<ServiceEditProvider />} />
        <Route path="/profiles" element={<ProfileProvider />} />
        <Route path="/payment" element={<PaymentProvider />} />
        <Route path="/booking" element={<BookingsProvider />} />
        <Route path="/boosts" element={<BoostProvider />} />
        <Route path="/review" element={<Review />} />
        <Route path="/chat/:bookingId" element={<ChatProvider />} />
        <Route path="/chat" element={<ChatListProvider />} />
        <Route path="/point" element={<PointProvider />} />
        <Route path="/reedem" element={<ReedemGiftsProvider />} />
        <Route path="/gift" element={<GiftProvider />} />
         <Route path="/mybook" element={< MyBookings/>} />
         <Route path="/payouts" element={<ProviderPayouts />} />
         <Route path="/provider-announcements" element={<AnnouncementsProvider />} />
      </Route>


     <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
  
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
  
         {/* Relative paths: these combine with the parent path */}
          <Route path="/users" element={<UserManagement />} />
         <Route path="/verifications" element={<IdentityVerification />} />
         <Route path="/finances" element={<FinancialOverview />} />
          <Route path="/categories" element={<Categories />} />
         <Route path="/adminboost" element={<AdCampaigns />} />
         <Route path="servicereport" element={<ServiceReport />} />
         <Route path="bookingreport" element={<BookingReport />} />
          <Route path="reportreview" element={<ReportReview />} />


          <Route path="/settings" element={<SystemSettings />} />
          <Route path="/moderation" element={<ReviewModeration />} />
          <Route path="/broadcast" element={<Broadcasting />} />
          <Route path="/withdrawals" element={<AdminWithdrawals />} />
          <Route path="/promotions" element={<Promotions />} />
     </Route>

      </Routes>
      </LoadingProvider>
    </BrowserRouter>
  );
}