import api from "./axios"; // must match your default axios instance

// REGISTER
export const registerUser = (data) =>
  api.post("/account/register", data, { withCredentials: true });

// LOGIN
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


// // 🔐 CHANGE PASSWORD (for logged-in user)
// export const changePassword = (data) =>
//   api.post("/account/change-password", data, { withCredentials: true });


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
  api.get(`/ServiceListing/getservice/${id}`);

// POST: api/ServiceListing/createservice
export const createService = (formData) => 
  api.post("/ServiceListing/createservice", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

// PUT: api/ServiceListing/updateservice/guid
export const updateService = (id, formData) => 
  api.put(`/ServiceListing/updateservice/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

// DELETE: api/ServiceListing/deleteservice/guid
export const deleteService = (id) => 
  api.delete(`/ServiceListing/deleteservice/${id}`);





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

// GET: api/Booking/getbooking?id=...
// Matches [HttpGet("getbooking")]
export const fetchBookingById = (id) => 
    api.get("/Booking/getbooking", { params: { id } });

// POST: api/Booking/savebooking
// Matches [HttpPost("savebooking")]
export const createBooking = (bookingData) => 
    api.post("/Booking/savebooking", bookingData);

// PATCH: api/Booking/bookingstatus?id=...
// Matches [HttpPatch("bookingstatus")]
export const updateBookingStatus = (id, status) => 
    api.patch("/Booking/bookingstatus", status, {
        params: { id },
        headers: { "Content-Type": "application/json" }
    });

// DELETE: api/Booking/deletebooking?id=...
// Matches [HttpDelete("deletebooking")]
export const deleteBooking = (id) => 
    api.delete("/Booking/deletebooking", { params: { id } });


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



// chats 


// POST: api/Chat/send
export const sendMessage = (messageDto) => 
    api.post("/Chat/send", messageDto);

// GET: api/Chat/history/{bookingId}
export const fetchChatHistory = (bookingId) => 
    api.get(`/Chat/history/${bookingId}`);







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

/* ===================== DOCUMENT VERIFICATION ===================== */

// SUBMIT documents
export const submitVerificationDocs = (formData) =>
    api.post("/DocumentVerification/submitdocuments", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });

// REVIEW document (admin)
export const reviewDocument = (id, reviewDto) =>
    api.patch("/DocumentVerification/reviewdocuments", reviewDto, {
        params: { id }
    });

// GET documents by PROFILE ID
export const fetchUserDocuments = (profileId) =>
    api.get("/DocumentVerification/userdocuments", {
        params: { profileId }
    });
