import api from "./axios"; // must match your default axios instance

// REGISTER
export const registerUser = (data) =>
  api.post("/account/register", data, { withCredentials: true });

export const loginUser = (data) =>
  api.post("/account/login", data, { withCredentials: true });

// LOGOUT
export const logoutUser = () =>
  api.post("/account/logout", null, { withCredentials: true });

// GET CURRENT AUTHENTICATED USER
// export const fetchCurrentUser = () =>
//   api.get("/account/me", { withCredentials: true });


// -------------------------------------------------------------
// 🔵 FORGOT PASSWORD
export const forgotPassword = (data) =>
  api.post("/account/forgot-password", data, { withCredentials: true });


// 🟣 RESET PASSWORD
export const resetPassword = (data) =>
  api.post("/account/reset-password", data, { withCredentials: true });


export const verifyEmailCode = (data) =>
  api.post("/account/verify-email-code", data, { withCredentials: true });

export const resendVerificationEmail = (data) =>
  api.post("/account/resend-code", data, { withCredentials: true });


// -------------------------------------------------------------
// OPTIONAL (recommended features)
// -------------------------------------------------------------

// 🔄 REFRESH TOKEN (if you add refresh tokens later)
export const refreshToken = () =>
  api.post("/account/refresh-token", null, { withCredentials: true });


// 🔐 CHANGE PASSWORD (for logged-in user)
export const changePassword = (data) =>
  api.post("/account/change-password", data, { withCredentials: true });


// -------------------------------------------------------------
// 🟢 CATEGORIES
// -------------------------------------------------------------

// GET: api/Category/activecategories
export const fetchCategories = () => 
  api.get("/Category/activecategories");

// GET: api/Category/getbyid/5
export const fetchCategoryById = (id) => 
  api.get(`/Category/getbyid/${id}`);

// POST: api/Category/createcategory
export const createCategory = (data) => 
  api.post("/Category/createcategory", data);

// PUT: api/Category/updatecategory/5
export const updateCategory = (id, data) => 
  api.put(`/Category/updatecategory/${id}`, data);

// DELETE: api/Category/deletecategory/5
export const deleteCategory = (id) => 
  api.delete(`/Category/deletecategory/${id}`);


// -------------------------------------------------------------
// 🟢 SERVICE LISTINGS
// -------------------------------------------------------------

// GET: api/ServiceListing/allservices
export const fetchAllServices = () => 
  api.get("/ServiceListing/allservices");

// GET: api/ServiceListing/getservice/guid
export const fetchServiceById = (id) => 
  api.get(`/ServiceListing/getservice?id=${id}`);

// Example in AccountApi.js
// export const fetchServiceById = (id) => {
//   return axios.get(`${BASE_URL}/api/services/${id}`); 
//   // Make sure this matches your .NET controller route exactly
// };
// POST: api/ServiceListing/createservice
export const createService = (formData) => 
  api.post("/ServiceListing/createservice", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

// PUT: api/ServiceListing/updateservice/guid
// export const updateService = (id, formData) => 
//   api.put(`/ServiceListing/updateservice/${id}`, formData, {
//     headers: { "Content-Type": "multipart/form-data" }
//   });

export const fetchServicesByProfile = (profileId) =>
  api.get("/ServiceListing/profileservices", {
    params: { profileId }
  });


  // Change this in your API file
export const updateService = (id, formData) => 
  api.put(`/ServiceListing/updateservice?id=${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

// DELETE: api/ServiceListing/deleteservice/guid
export const deleteService = (id) => 
  api.delete(`/ServiceListing/deleteservice?id=${id}`);





// Document 

export const submitDocument = (formData) => 
  api.post("/DocumentVerification/submit", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

// export const fetchUserDocuments = (profileId) => 
//   api.get(`/DocumentVerification/user/${profileId}`);



// profile

// Connects to: GET api/Profile/user/{userId}
// export const fetchProfileByUserId = (userId) => api.get(`/Profile/user/${userId}`);

// // Connects to: PUT api/Profile/{id}
// export const updateProfile = (id, profileData) => api.put(`/Profile/${id}`, profileData);

export const toggleSuspension = (profileId, reason) => 
  api.patch(`/Profile/togglesuspension?id=${profileId}&reason=${reason}`);





// GET: Overall system stats (Revenue, Boosts, etc.)
export const fetchAdminStats = () => 
  api.get("/admin/stats");

// POST: Verify a provider and send notification
export const verifyProvider = (profileId, email) => 
  api.post(`/admin/verify/${profileId}?email=${email}`);

// GET: View all wallets (eSewa/Khalti balances)
export const fetchFinancialOverview = () => 
  api.get("/admin/finances");

// GET: View history of all boosting transactions
export const fetchBoostingLogs = () => 
  api.get("/admin/boosting-logs");

// GET: Users waiting for document approval
export const fetchPendingVerifications = () => 
  api.get("/admin/pending-verifications");



// GET: api/Booking
export const fetchAllBookings = () => 
    api.get("/Booking");


    export const getBooking = (id) => 
    api.delete(`/Booking/getbooking?id=${id}`);

// POST: api/Booking/savebooking
export const createBooking = (bookingData) => 
    api.post("/Booking/savebooking", bookingData);

// ✅ Correct: 'id' is defined as a parameter and used in the URL
export const updateBookingStatus = (id, status) => 
    api.patch(`/Booking/bookingstatus?id=${id}&status=${status}`);

// ✅ Correct: 'id' is defined as a parameter
export const deleteBooking = (id) => 
    api.delete(`/Booking/deletebooking?id=${id}`);




// boostings 


// POST: api/Boosting/apply
export const applyBoost = (boostData) => 
    api.post("/Boosting/apply", boostData);

// GET: api/Boosting/history/{serviceId}
export const fetchBoostHistory = (serviceId) => 
    api.get(`/Boosting/history/${serviceId}`);

// GET: api/Boosting/status/{serviceId}
export const fetchBoostStatus = (serviceId) => 
    api.get(`/Boosting/status/${serviceId}`);

export const fetchAllBoostingTransactions = () => 
    api.get("/Boosting/all-history");

export const cancelBoost = (serviceId) =>
  axios.post(`/Boosting/cancel/${serviceId}`);

// chats 


export const sendMessage = (data) =>
  api.post(`/Chat/sendmessage`, data);

export const getChatHistory = (bookingId, profileId) =>
  api.get(`/Chat/gethistory/${bookingId}/${profileId}`);

export const deleteChatHistory = (bookingId, profileId) =>
  api.delete(`/Chat/deletehistory/${bookingId}/${profileId}`);






/* ===================== PROFILE ===================== */

// GET profile by USER ID
export const fetchProfileByUserId = (userId) =>
    api.get("/Profile/userprofile", {
        params: { userId }
    });

// GET profile by PROFILE ID - UPDATED: lowercase 'g'
export const fetchProfileById = (id) =>
    api.get("/Profile/getprofile", {
        params: { id }
    });

// UPDATE profile - UPDATED: lowercase 'u'
export const updateProfile = (id, profileData) =>
    api.put("/Profile/updateprofile", profileData, {
        params: { id }
    });

// VERIFY profile - Already lowercase
export const verifyProfileDirectly = (id) =>
    api.patch("/Profile/verifyprofile", null, {
        params: { id }
    });

// UPLOAD profile image - Already lowercase
export const uploadProfileImage = (id, file) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/Profile/uploadimageprofile", formData, {
        params: { id },
        headers: { "Content-Type": "multipart/form-data" }
    });
};

export const getAddressHierarchy = () => 
    api.get(`Profile/addresshierarchy`);

/* ===================== DOCUMENT VERIFICATION ===================== */

// SUBMIT documents
// export const submitVerificationDocs = (formData) =>
//     api.post("/DocumentVerification/submitdocuments", formData, {
//         headers: { "Content-Type": "multipart/form-data" }
//     });

// REVIEW document (admin)
export const reviewDocument = (id, reviewDto) =>
    api.patch("/DocumentVerification/reviewdocuments", reviewDto, {
        params: { id } // This puts ?id=... in the URL
    });

// GET documents by PROFILE ID
// export const fetchUserDocuments = (profileId) =>
//     api.get("/DocumentVerification/userdocuments", {
//         params: { profileId }
//     });
  
export const DeleteDocuments = (profileId) =>
    api.get("/DocumentVerification/deletedocuments", {
        params: { profileId }
    });


// export const updateDocument = (id, formData) =>
//   api.put(`/DocumentVerification/updatedocument/${id}`, formData, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });


export const submitVerificationDocs = (formData) =>
  api.post("/DocumentVerification/submitdocuments", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

// Matches PUT /api/DocumentVerification/updatedocument/{id}
// The {id} must be in the URL path, not after a '?'
export const updateDocument = (id, formData) =>
  api.put(`/DocumentVerification/updatedocument/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Matches GET /api/DocumentVerification/userdocuments?profileId=...
export const fetchUserDocuments = (profileId) =>
  api.get("/DocumentVerification/userdocuments", {
    params: { profileId }
  });






    // POints .......................
    // ...............................


    // Get the user's points ledger/history
export const GetHistoryPoints = (walletId) =>
    api.get("/PointTransection/historypoints", {
        params: { walletId }
    });

// Check eligibility for daily strike and see lifetime gift progress
export const GetStrikeStatus = (walletId) =>
    api.get("/PointTransection/strikestatus", {
        params: { walletId }
    });

// Deduct points when a user boosts an ad
export const SpendForBoost = (walletId, points) =>
    api.post("/PointTransection/spendforboost", null, {
        params: { walletId, points }
    });


//................................
//. Gifts
//..................
    
// Get list of all active gifts/vouchers
export const GetGifts = () => 
    api.get("/Gifts/Gift");                          

// ........................................
//. reedems gifts
//..................... 

// Claim a voucher (triggers the backend check against LifetimePurchasedPoints)
export const ClaimVoucher = (redeemRequest) =>
    api.post("/ReedemGifts/claim", redeemRequest);

// Get all vouchers earned by the user (Active and Used)
export const GetMyVouchers = (profileId) =>
    api.get("/ReedemGifts/myvouchers", {
        params: { profileId }
    });



    //..................
    // Wallet
    //..............

  // 1. Make sure 'export' is written clearly
export const getWallet = (profileId) =>
    api.get(`/Wallets/getwallet?profileId=${profileId}`); // changed to query param pattern

export const fetchAllWallets = () =>
    api.get(`/Wallets/allwallets`);

export const purchasePoints = (data) =>
    api.post(`/Wallets/purchasepoints`, data);

export const claimDailyReward = (profileId) =>
    api.post("/Wallets/claim-daily-reward", { profileId });

export const claimWatchTimeReward = (profileId, secondsWatched) =>
    api.post("/Wallets/claim-watch-time", { profileId, secondsWatched });

// User Engagement specific
export const claimUserDailyReward = (profileId) =>
    api.post("/UserEngagement/claim-daily-reward", { profileId });

export const claimUserWatchTimeReward = (profileId, secondsWatched) =>
    api.post("/UserEngagement/claim-watch-time", { profileId, secondsWatched });

// ===================== PAYMENTS =====================

export const initiateBookingPayment = (data) =>
    api.post("/Payment/initiate-booking", data);

export const initiatePointsPayment = (data) =>
    api.post("/Payment/initiate-points", data);


// Reviews

export const createReview = (data) => 
    api.post(`/Reviews/Review`, data);

export const getServiceReviews = (serviceId) => 
    api.get(`/Reviews/serviceReview?serviceId=${serviceId}`);


// Fetch all profiles (User list)
export const fetchAllProfiles = () => 
    api.get(`Profile/allprofiles`);

// Fetch all documents (Verification queue)
export const fetchAllDocuments = () => 
    api.get(`DocumentVerification/alldocuments`);


// Notification 

export const getUserNotifications = (profileId) => 
    api.get(`/Notification/${profileId}`);

export const markNotificationAsRead = (id) => 
    api.patch(`/Notification/markread/${id}`);

export const sendManualNotification = (data) => 
    api.post(`/Notification/sendmanual`, data);

export const sendBroadcast = (data) => 
    api.post(`/Notification/broadcast`, data);

export const getUserPaymentHistory = () =>
    api.get(`/UserPayment/history`);

// Admin Review Moderation
export const fetchAllReviews = () => 
    api.get(`/Reviews/all-reviews`);

export const deleteReview = (reviewId) => 
    api.delete(`/Reviews/delete/${reviewId}`);

// Withdrawal Management
export const fetchAllWithdrawals = () => 
    api.get("/Withdrawal/all-requests");

export const approveWithdrawal = (id) => 
    api.patch(`/Withdrawal/approve/${id}`);

export const rejectWithdrawal = (id) => 
    api.patch(`/Withdrawal/reject/${id}`);

export const createWithdrawalRequest = (data) => 
    api.post("/Withdrawal/request", data);

export const getUserWithdrawals = (profileId) => 
    api.get(`/Withdrawal/user-requests/${profileId}`);