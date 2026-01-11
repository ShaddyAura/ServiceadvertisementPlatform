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
